'use server';

import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';

interface EnqueueParams {
  type: 'email' | 'whatsapp' | 'sms';
  recipient: string;
  subject?: string;
  payload: string; // The HTML email body or message text
}

/**
 * Enqueues a notification in the database for asynchronous processing.
 */
export async function enqueueNotification({ type, recipient, subject = '', payload }: EnqueueParams) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('notification_queue')
      .insert({
        type,
        recipient,
        subject,
        payload,
        status: 'pending',
      })
      .select();

    if (error) throw error;
    
    // Automatically trigger queue processing asynchronously so patient does not wait
    // We don't await this, letting it resolve in the background
    processNotificationQueue().catch(err => {
      console.warn('Deferred queue processor trigger caught error:', err);
    });

    return { success: true, id: data?.[0]?.id };
  } catch (err: any) {
    console.error('Error enqueuing notification:', err.message || err);
    return { success: false, error: err.message };
  }
}

/**
 * Worker function that processes all pending notifications in the queue.
 */
export async function processNotificationQueue() {
  try {
    const supabase = await createClient();

    // 1. Fetch pending notifications (or failed notifications that are retryable and next_retry_at is in the past)
    const { data: pendingItems, error: selectErr1 } = await supabase
      .from('notification_queue')
      .select('*')
      .eq('status', 'pending')
      .limit(10);

    if (selectErr1) throw selectErr1;

    let combined = [...(pendingItems || [])];

    if (combined.length < 10) {
      const { data: retryableItems, error: selectErr2 } = await supabase
        .from('notification_queue')
        .select('*')
        .eq('status', 'failed')
        .lt('retry_count', 4)
        .lte('next_retry_at', new Date().toISOString())
        .limit(10 - combined.length);
      
      if (selectErr2) throw selectErr2;
      combined = [...combined, ...(retryableItems || [])];
    }

    if (combined.length === 0) return { processed: 0 };

    let processedCount = 0;

    for (const item of combined) {
      processedCount++;
      try {
        // Mark as processing
        await supabase
          .from('notification_queue')
          .update({ status: 'processing' })
          .eq('id', item.id);

        if (item.type === 'email') {
          // Check provider toggle flag
          if (process.env.EMAIL_ENABLED === 'false') {
            await supabase
              .from('notification_queue')
              .update({ status: 'skipped', error_message: 'Email provider disabled in env config' })
              .eq('id', item.id);
            continue;
          }

          // Send the email using our transporter
          const result = await sendEmail({
            to: item.recipient,
            subject: item.subject || 'Inspire Care Notification',
            html: item.payload,
          });

          if (result.success) {
            await supabase
              .from('notification_queue')
              .update({ status: 'sent', error_message: null })
              .eq('id', item.id);
          } else {
            throw result.error ? new Error(result.error) : new Error('Email sending failed');
          }
        } else if (item.type === 'sms') {
          // Check provider toggle flag
          if (process.env.SMS_ENABLED === 'false') {
            await supabase
              .from('notification_queue')
              .update({ status: 'skipped', error_message: 'SMS provider disabled in env config' })
              .eq('id', item.id);
            continue;
          }

          let appointmentId: string | undefined;
          try {
            const parsedPayload = JSON.parse(item.payload);
            appointmentId = parsedPayload.appointmentId;
          } catch (e) {
            // ignore
          }

          // Send the SMS using Fast2SMS DLT gateway
          const result = await sendFast2SmsSms(item.recipient, item.payload, appointmentId);

          if (result.success) {
            await supabase
              .from('notification_queue')
              .update({ 
                status: (result as any).mocked ? 'mock_sent' : 'sent', 
                error_message: null 
              })
              .eq('id', item.id);
          } else {
            throw result.error ? new Error(result.error) : new Error('SMS sending failed');
          }
        } else if (item.type === 'whatsapp') {
          // Check provider toggle flag
          if (process.env.WHATSAPP_ENABLED !== 'true') {
            await supabase
              .from('notification_queue')
              .update({ status: 'skipped', error_message: 'WhatsApp provider disabled in env config' })
              .eq('id', item.id);
            continue;
          }

          // WhatsApp placeholder simulation
          console.log(`💬 [WHATSAPP QUEUE] Sending message to ${item.recipient}: ${item.payload}`);
          
          await supabase
            .from('notification_queue')
            .update({ status: 'sent', error_message: null })
            .eq('id', item.id);
        } else {
          throw new Error(`Unsupported notification channel: ${item.type}`);
        }
      } catch (itemErr: any) {
        console.error(`Failed to process queue item ${item.id}:`, itemErr);
        
        const nextRetryCount = (item.retry_count || 0) + 1;
        let nextRetryAt: string | null = null;
        
        if (nextRetryCount === 1) {
          nextRetryAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min
        } else if (nextRetryCount === 2) {
          nextRetryAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min
        } else if (nextRetryCount === 3) {
          nextRetryAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
        }

        await supabase
          .from('notification_queue')
          .update({
            status: 'failed',
            retry_count: nextRetryCount,
            next_retry_at: nextRetryAt,
            last_error: itemErr.message || String(itemErr),
          })
          .eq('id', item.id);
      }
    }

    return { processed: processedCount };
  } catch (err: any) {
    console.error('Error processing notification queue:', err);
    return { error: err.message };
  }
}

/**
 * Sends a bulk DLT SMS using the Fast2SMS gateway.
 */
async function sendFast2SmsSms(recipient: string, payloadStr: string, appointmentId?: string) {
  const apiKey = process.env.FAST2SMS_API_KEY;
  const senderIdFromEnv = process.env.DLT_SENDER_ID;

  let payload;
  try {
    payload = JSON.parse(payloadStr);
  } catch (err) {
    // Fallback if payload isn't JSON
    payload = { template: 'direct', message: payloadStr };
  }

  const { template, patientName = 'Patient', doctorName = 'Doctor', date = '', time = '' } = payload;

  const supabase = await createClient();

  // Helper to log SMS delivery auditing records
  const logSmsResult = async (status: string, requestId?: string, responseText?: string) => {
    let parsedResponse = null;
    try {
      if (responseText) parsedResponse = JSON.parse(responseText);
    } catch (e) {
      parsedResponse = { raw: responseText };
    }

    try {
      await supabase.from('sms_logs').insert({
        appointment_id: appointmentId || null,
        mobile: recipient,
        template_name: template,
        fast2sms_request_id: requestId || null,
        status,
        sms_credits_used: status === 'sent' ? 1 : 0,
        sms_rate: 0.20,
        provider_response: parsedResponse,
      });
    } catch (logErr) {
      console.error('Error inserting SMS delivery log:', logErr);
    }
  };

  // 1. Fetch template configuration from database
  let dbTemplate = null;
  try {
    const { data } = await supabase
      .from('sms_templates')
      .select('template_id, sender_id')
      .eq('template_name', template)
      .eq('is_active', true)
      .maybeSingle();
    dbTemplate = data;
  } catch (err) {
    console.warn('Could not read template config from DB:', err);
  }

  let templateId = dbTemplate?.template_id;
  let senderId = dbTemplate?.sender_id || senderIdFromEnv || 'TICARE';

  // 2. Fallback to environment variables if not configured in DB
  if (!templateId) {
    if (template === 'appointment_confirmed' || template === 'appointment_confirm') {
      templateId = process.env.DLT_CONFIRM_TEMPLATE_ID || process.env.APPOINTMENT_CONFIRM_TEMPLATE_ID || '';
    } else if (template === 'appointment_reminder' || template === 'appointment_reminder_24h' || template === 'appointment_reminder_1h') {
      if (template === 'appointment_reminder_1h') {
        templateId = process.env.DLT_REMINDER_1H_TEMPLATE_ID || '';
      } else {
        templateId = process.env.DLT_REMINDER_24H_TEMPLATE_ID || process.env.APPOINTMENT_REMINDER_TEMPLATE_ID || '';
      }
    } else if (template === 'appointment_cancelled' || template === 'appointment_cancel') {
      templateId = process.env.DLT_CANCEL_TEMPLATE_ID || process.env.APPOINTMENT_CANCEL_TEMPLATE_ID || '';
    } else if (template === 'appointment_rescheduled' || template === 'appointment_reschedule') {
      templateId = process.env.DLT_RESCHEDULE_TEMPLATE_ID || '';
    }
  }

  if (!apiKey || !templateId) {
    console.log(`📬 [SMS MOCK] API Key or Template ID missing. Dispatching mock DLT SMS:`);
    console.log(`   Recipient: ${recipient}`);
    console.log(`   Template:  ${template} (ID: ${templateId || 'N/A'})`);
    console.log(`   Variables: Patient=${patientName}, Doctor=${doctorName}, Date=${date}, Time=${time}`);
    
    await logSmsResult('mock_sent', null, 'Mock fallback dispatch');
    return { success: true, mocked: true };
  }

  try {
    const vars = `${patientName}|${doctorName}|${date}|${time}`;
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'dlt',
        sender_id: senderId,
        message: templateId,
        variables_values: vars,
        numbers: recipient,
      }),
    });

    const result = await response.json();
    if (response.ok && result.return === true) {
      const requestId = result.request_id || (result.data && result.data[0]?.request_id);
      await logSmsResult('sent', requestId, JSON.stringify(result));
      return { success: true, message: result.message || 'SMS sent successfully' };
    } else {
      const errMsg = result.message || JSON.stringify(result) || 'Fast2SMS error';
      console.error('Fast2SMS gateway returned failure response:', result);
      await logSmsResult('failed', null, errMsg);
      return { success: false, error: errMsg };
    }
  } catch (err: any) {
    console.error('Exception during Fast2SMS API call:', err);
    await logSmsResult('failed', null, err.message || String(err));
    return { success: false, error: err.message || err };
  }
}

/**
 * Scans upcoming confirmed appointments, enqueues SMS reminder notifications,
 * and sets reminder flags to prevent duplicate reminder dispatches.
 */
export async function checkAndEnqueueReminders() {
  try {
    const supabase = await createClient();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Fetch active confirmed appointments from today onwards
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*, doctors(name)')
      .eq('status', 'confirmed')
      .is('deleted_at', null)
      .or('reminder_24h_sent.eq.false,reminder_1h_sent.eq.false')
      .gte('appointment_date', todayStr);

    if (error) throw error;
    if (!appointments || appointments.length === 0) return { enqueued: 0 };

    let enqueuedCount = 0;

    const parseAppointmentDateTime = (dateStr: string, timeStr: string) => {
      return new Date(`${dateStr}T${timeStr.substring(0, 5)}:00`);
    };

    for (const apt of appointments) {
      const aptTime = apt.appointment_time || apt.slot_id || '09:00';
      const aptDateTime = parseAppointmentDateTime(apt.appointment_date, aptTime);
      const diffMs = aptDateTime.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      // A. 24 Hour Reminder Check (23h to 25h window)
      if (!apt.reminder_24h_sent && diffHours >= 23 && diffHours <= 25) {
        // Atomic race prevention update check
        const { data: updatedRows, error: updateErr } = await supabase
          .from('appointments')
          .update({ reminder_24h_sent: true })
          .eq('id', apt.id)
          .eq('reminder_24h_sent', false)
          .select();

        if (updateErr) throw updateErr;

        if (updatedRows && updatedRows.length > 0) {
          const smsPayload = JSON.stringify({
            template: 'appointment_reminder_24h',
            patientName: apt.patient_name,
            doctorName: apt.doctors?.name || 'Doctor',
            date: apt.appointment_date,
            time: aptTime.substring(0, 5),
            appointmentId: apt.id,
          });

          const { error: notifErr } = await supabase.from('notification_queue').insert({
            type: 'sms',
            recipient: apt.patient_phone,
            payload: smsPayload,
            status: 'pending',
          });

          if (notifErr) {
            // Roll back the flag so it can retry later
            await supabase
              .from('appointments')
              .update({ reminder_24h_sent: false })
              .eq('id', apt.id);
            throw notifErr;
          }

          enqueuedCount++;
        }
      }

      // B. 1 Hour Reminder Check (0.5h to 1.5h window)
      if (!apt.reminder_1h_sent && diffHours >= 0.5 && diffHours <= 1.5) {
        // Atomic race prevention update check
        const { data: updatedRows, error: updateErr } = await supabase
          .from('appointments')
          .update({ reminder_1h_sent: true })
          .eq('id', apt.id)
          .eq('reminder_1h_sent', false)
          .select();

        if (updateErr) throw updateErr;

        if (updatedRows && updatedRows.length > 0) {
          const smsPayload = JSON.stringify({
            template: 'appointment_reminder_1h',
            patientName: apt.patient_name,
            doctorName: apt.doctors?.name || 'Doctor',
            date: apt.appointment_date,
            time: aptTime.substring(0, 5),
            appointmentId: apt.id,
          });

          const { error: notifErr } = await supabase.from('notification_queue').insert({
            type: 'sms',
            recipient: apt.patient_phone,
            payload: smsPayload,
            status: 'pending',
          });

          if (notifErr) {
            // Roll back
            await supabase
              .from('appointments')
              .update({ reminder_1h_sent: false })
              .eq('id', apt.id);
            throw notifErr;
          }

          enqueuedCount++;
        }
      }
    }

    return { enqueued: enqueuedCount };
  } catch (err: any) {
    console.error('Error checking and enqueuing reminder notifications:', err);
    return { error: err.message || err };
  }
}


