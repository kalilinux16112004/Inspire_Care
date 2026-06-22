'use server';

import { createClient } from '@/lib/supabase/server';
import { enqueueNotification } from '@/lib/notifications';
import { getEmailTemplate } from '@/lib/email-templates';
import { getGoogleCalendarUrl } from '@/lib/calendar';

export interface BookingPayload {
  doctorId: string;
  appointmentDate: string; // "YYYY-MM-DD"
  appointmentTime: string; // "HH:MM"
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAge?: number | null;
  symptomsDescription?: string;
  userId: string; // UUID from client session
  appointmentType: string; // 'consultation' | 'follow_up' | 'telemedicine' | 'home_visit'
  visitReason: string;
}

/**
 * Places a temporary 5-minute hold on a slot.
 */
export async function createSlotHold({
  doctorId,
  appointmentDate,
  slotId,
  userId,
}: {
  doctorId: string;
  appointmentDate: string;
  slotId: string;
  userId: string;
}) {
  try {
    const supabase = await createClient();

    // 1. Clean up expired holds to release unused slots
    await supabase
      .from('appointment_holds')
      .delete()
      .lt('expires_at', new Date().toISOString());

    // 2. Check if a booking already exists on this slot
    const { data: bookings } = await supabase
      .from('appointments')
      .select('id')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', appointmentDate)
      .eq('slot_id', slotId)
      .is('deleted_at', null)
      .neq('status', 'rejected');

    if (bookings && bookings.length > 0) {
      return { success: false, error: 'This time slot is already booked.' };
    }

    // 3. Check if there is an active hold by another patient
    const { data: holds } = await supabase
      .from('appointment_holds')
      .select('user_id')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', appointmentDate)
      .eq('slot_id', slotId)
      .gt('expires_at', new Date().toISOString());

    if (holds && holds.length > 0) {
      if (holds[0].user_id === userId) {
        // Refresh expiration timer for current holder
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
        const { error: updateErr } = await supabase
          .from('appointment_holds')
          .update({ expires_at: expiresAt })
          .eq('doctor_id', doctorId)
          .eq('appointment_date', appointmentDate)
          .eq('slot_id', slotId);
        if (updateErr) throw updateErr;
        return { success: true, refreshed: true };
      }
      return { success: false, error: 'This slot is temporarily held by another patient.' };
    }

    // 4. Place the hold
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('appointment_holds')
      .insert({
        doctor_id: doctorId,
        appointment_date: appointmentDate,
        slot_id: slotId,
        user_id: userId,
        expires_at: expiresAt,
      })
      .select();

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'This slot was just held by another patient.' };
      }
      throw error;
    }

    return { success: true, hold: data?.[0] };
  } catch (err: any) {
    console.error('Error creating slot hold:', err);
    return { success: false, error: err.message || err };
  }
}

/**
 * Releases a slot hold.
 */
export async function releaseSlotHold({
  doctorId,
  appointmentDate,
  slotId,
  userId,
}: {
  doctorId: string;
  appointmentDate: string;
  slotId: string;
  userId: string;
}) {
  try {
    const supabase = await createClient();
    await supabase
      .from('appointment_holds')
      .delete()
      .eq('doctor_id', doctorId)
      .eq('appointment_date', appointmentDate)
      .eq('slot_id', slotId)
      .eq('user_id', userId);

    return { success: true };
  } catch (err: any) {
    console.error('Error releasing slot hold:', err);
    return { success: false, error: err.message || err };
  }
}

/**
 * Creates an appointment with slot hold check, scheduling logic, and notification enqueuing.
 */
export async function createAppointmentTransaction(payload: BookingPayload) {
  try {
    const supabase = await createClient();

    // 1. Check leaves
    const { data: leaves, error: leaveErr } = await supabase
      .from('doctor_leaves')
      .select('id')
      .eq('doctor_id', payload.doctorId)
      .eq('leave_date', payload.appointmentDate);

    if (leaveErr) throw leaveErr;
    if (leaves && leaves.length > 0) {
      return { success: false, error: 'The doctor is scheduled to be on leave on this date.' };
    }

    // 2. Check availability / exceptions
    const dateParts = payload.appointmentDate.split('-').map(Number);
    const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const weekday = dateObj.getDay();

    // Query Exceptions
    const { data: exception, error: exceptionErr } = await supabase
      .from('doctor_availability_exceptions')
      .select('*')
      .eq('doctor_id', payload.doctorId)
      .eq('exception_date', payload.appointmentDate)
      .maybeSingle();

    if (exceptionErr) throw exceptionErr;

    let plan;
    if (exception) {
      if (!exception.is_available) {
        return { success: false, error: 'The doctor is unavailable on this date.' };
      }
      plan = exception;
    } else {
      const { data: weeklyPlan, error: planErr } = await supabase
        .from('doctor_availability')
        .select('*')
        .eq('doctor_id', payload.doctorId)
        .eq('weekday', weekday)
        .eq('is_available', true)
        .maybeSingle();

      if (planErr) throw planErr;
      plan = weeklyPlan;
    }

    if (!plan) {
      return { success: false, error: 'The doctor has no work hours scheduled for this day.' };
    }

    // Verify slot falls inside planned work hours
    const timeToSeconds = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 3600 + m * 60;
    };

    const slotSecs = timeToSeconds(payload.appointmentTime);
    const startSecs = timeToSeconds(plan.start_time);
    const endSecs = timeToSeconds(plan.end_time);

    if (slotSecs < startSecs || slotSecs + (plan.slot_duration || 30) * 60 > endSecs) {
      return { success: false, error: "The requested slot falls outside the doctor's active schedule hours." };
    }

    // 3. Verify hold exclusivity
    const { data: holds } = await supabase
      .from('appointment_holds')
      .select('user_id')
      .eq('doctor_id', payload.doctorId)
      .eq('appointment_date', payload.appointmentDate)
      .eq('slot_id', payload.appointmentTime)
      .gt('expires_at', new Date().toISOString());

    if (holds && holds.length > 0 && holds[0].user_id !== payload.userId) {
      return { success: false, error: 'This slot is temporarily held by another patient. Please choose another slot.' };
    }

    // 4. Insert Appointment
    const { data: inserted, error: insertErr } = await supabase
      .from('appointments')
      .insert({
        doctor_id: payload.doctorId,
        appointment_date: payload.appointmentDate,
        appointment_time: payload.appointmentTime,
        slot_id: payload.appointmentTime,
        patient_name: payload.patientName,
        patient_email: payload.patientEmail || 'not-provided@clinic.com',
        patient_phone: payload.patientPhone,
        patient_age: payload.patientAge || null,
        symptoms_description: payload.symptomsDescription || '',
        appointment_type: payload.appointmentType || 'consultation',
        visit_reason: payload.visitReason || '',
        status: 'pending',
      })
      .select();

    if (insertErr) {
      // Postgres Unique Constraint Violation (code: '23505')
      if (insertErr.code === '23505' || insertErr.message.includes('unique')) {
        return {
          success: false,
          error: 'This specific slot has already been booked. Please choose another time.',
        };
      }
      throw insertErr;
    }

    const appointment = inserted?.[0];
    if (!appointment) {
      throw new Error('Database insert succeeded but returned no data.');
    }

    // 5. Log audit trail entry
    await supabase
      .from('appointment_history')
      .insert({
        appointment_id: appointment.id,
        action: 'booked',
        old_status: null,
        new_status: 'pending',
        changed_by: 'patient',
      });

    // 6. Delete hold records for this user slot since it is now officially booked
    await supabase
      .from('appointment_holds')
      .delete()
      .eq('doctor_id', payload.doctorId)
      .eq('appointment_date', payload.appointmentDate)
      .eq('slot_id', payload.appointmentTime)
      .eq('user_id', payload.userId);

    // 7. Fetch doctor info
    const { data: doctor } = await supabase
      .from('doctors')
      .select('name, specialization')
      .eq('id', payload.doctorId)
      .single();

    const doctorName = doctor?.name || 'Doctor';
    const doctorSpec = doctor?.specialization || 'Specialist';

    // 8. Enqueue transactional alert queue records
    try {
      const patientEmail = payload.patientEmail;
      const tDetails = {
        patientName: payload.patientName,
        patientEmail: payload.patientEmail,
        patientPhone: payload.patientPhone,
        patientAge: payload.patientAge,
        doctorName: doctorName,
        doctorSpecialization: doctorSpec,
        date: payload.appointmentDate,
        time: payload.appointmentTime,
        symptoms: payload.symptomsDescription,
      };

      if (patientEmail && patientEmail !== 'not-provided@clinic.com') {
        const { subject, html } = getEmailTemplate('appointment-pending', tDetails);
        await enqueueNotification({
          type: 'email',
          recipient: patientEmail,
          subject,
          payload: html,
        });
      }

      const { subject: adminSubject, html: adminHtml } = getEmailTemplate('admin-new-appointment', tDetails);
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@teaminspirecare.com';
      await enqueueNotification({
        type: 'email',
        recipient: adminEmail,
        subject: adminSubject,
        payload: adminHtml,
      });
    } catch (notifErr) {
      console.warn('Deferred enqueuing alerts caught exception:', notifErr);
    }

    return {
      success: true,
      appointment: {
        id: appointment.id,
        patientName: payload.patientName,
        doctorName: doctorName,
        doctorSpecialization: doctorSpec,
        date: payload.appointmentDate,
        time: payload.appointmentTime,
        symptoms: payload.symptomsDescription,
      },
    };
  } catch (err: any) {
    console.error('Error during appointment booking transaction:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred during database booking.',
    };
  }
}

/**
 * Updates the status of an appointment, logs it to history, and enqueues a notification email.
 */
export async function updateAppointmentStatus(id: string, newStatus: string, changedBy: string) {
  try {
    const supabase = await createClient();

    // 1. Fetch current appointment details (with doctor info)
    const { data: apt, error: fetchErr } = await supabase
      .from('appointments')
      .select('*, doctors(name, specialization)')
      .eq('id', id)
      .single();

    if (fetchErr) throw fetchErr;
    if (!apt) throw new Error('Appointment not found.');

    const oldStatus = apt.status;

    // 2. Update status
    const { error: updateErr } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', id);

    if (updateErr) throw updateErr;

    // 3. Log to history
    await supabase
      .from('appointment_history')
      .insert({
        appointment_id: id,
        action: newStatus === 'confirmed' ? 'approved' : newStatus === 'rejected' ? 'rejected' : 'status_updated',
        old_status: oldStatus,
        new_status: newStatus,
        changed_by: changedBy,
      });

    // 4. Enqueue notifications if email is present
    const patientEmail = apt.patient_email;
    if (patientEmail && patientEmail !== 'not-provided@clinic.com') {
      const doctorName = apt.doctors?.name || 'Doctor';
      const doctorSpecialization = apt.doctors?.specialization || 'Specialist';

      const calendarDetails = {
        id: apt.id,
        patientName: apt.patient_name,
        doctorName,
        doctorSpecialization,
        date: apt.appointment_date,
        time: apt.appointment_time?.substring(0, 5),
        symptoms: apt.symptoms_description,
      };

      const googleUrl = getGoogleCalendarUrl(calendarDetails);

      let emailType = '';
      if (newStatus === 'confirmed') {
        emailType = 'appointment-confirmed';
      } else if (newStatus === 'rejected') {
        emailType = 'appointment-cancelled';
      }

      if (emailType) {
        const { subject, html } = getEmailTemplate(emailType, {
          ...calendarDetails,
          calendarUrl: googleUrl,
        });

        await enqueueNotification({
          type: 'email',
          recipient: patientEmail,
          subject,
          payload: html,
        });
      }
    }

    // 5. Enqueue SMS notifications if phone is present
    const patientPhone = apt.patient_phone;
    if (patientPhone) {
      const doctorName = apt.doctors?.name || 'Doctor';
      let smsTemplate = '';
      if (newStatus === 'confirmed') {
        smsTemplate = 'appointment_confirm';
      } else if (newStatus === 'rejected') {
        smsTemplate = 'appointment_cancel';
      }

      if (smsTemplate) {
        const smsPayload = JSON.stringify({
          template: smsTemplate,
          patientName: apt.patient_name,
          doctorName,
          date: apt.appointment_date,
          time: apt.appointment_time?.substring(0, 5),
          appointmentId: apt.id,
        });

        await enqueueNotification({
          type: 'sms',
          recipient: patientPhone,
          payload: smsPayload,
        });
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error updating appointment status:', err);
    return { success: false, error: err.message || err };
  }
}

/**
 * Soft deletes an appointment (sets deleted_at = NOW()), logs to history, and enqueues a notification email.
 */
export async function softDeleteAppointment(id: string, changedBy: string) {
  try {
    const supabase = await createClient();

    // 1. Fetch current appointment details (with doctor info)
    const { data: apt, error: fetchErr } = await supabase
      .from('appointments')
      .select('*, doctors(name, specialization)')
      .eq('id', id)
      .single();

    if (fetchErr) throw fetchErr;
    if (!apt) throw new Error('Appointment not found.');

    const oldStatus = apt.status;

    // 2. Set deleted_at = NOW()
    const { error: updateErr } = await supabase
      .from('appointments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (updateErr) throw updateErr;

    // 3. Log to history
    await supabase
      .from('appointment_history')
      .insert({
        appointment_id: id,
        action: 'soft_deleted',
        old_status: oldStatus,
        new_status: 'deleted',
        changed_by: changedBy,
      });

    // 4. Enqueue cancelled notification if email is present
    const patientEmail = apt.patient_email;
    if (patientEmail && patientEmail !== 'not-provided@clinic.com') {
      const doctorName = apt.doctors?.name || 'Doctor';
      const doctorSpecialization = apt.doctors?.specialization || 'Specialist';

      const calendarDetails = {
        id: apt.id,
        patientName: apt.patient_name,
        doctorName,
        doctorSpecialization,
        date: apt.appointment_date,
        time: apt.appointment_time?.substring(0, 5),
        symptoms: apt.symptoms_description,
      };

      const { subject, html } = getEmailTemplate('appointment-cancelled', calendarDetails);

      await enqueueNotification({
        type: 'email',
        recipient: patientEmail,
        subject,
        payload: html,
      });
    }

    // 5. Enqueue cancelled SMS notification if phone is present
    const patientPhone = apt.patient_phone;
    if (patientPhone) {
      const doctorName = apt.doctors?.name || 'Doctor';
      const smsPayload = JSON.stringify({
        template: 'appointment_cancel',
        patientName: apt.patient_name,
        doctorName,
        date: apt.appointment_date,
        time: apt.appointment_time?.substring(0, 5),
        appointmentId: apt.id,
      });

      await enqueueNotification({
        type: 'sms',
        recipient: patientPhone,
        payload: smsPayload,
      });
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error soft deleting appointment:', err);
    return { success: false, error: err.message || err };
  }
}

/**
 * Reschedules an appointment to a new date and time slot.
 * Enforces leaves/availability constraints, resets reminder flags, logs to history, and enqueues notifications.
 */
export async function rescheduleAppointment(
  id: string,
  newDate: string,
  newTime: string,
  changedBy: string
) {
  try {
    const supabase = await createClient();

    // 1. Fetch current appointment details (with doctor info)
    const { data: apt, error: fetchErr } = await supabase
      .from('appointments')
      .select('*, doctors(name, specialization)')
      .eq('id', id)
      .single();

    if (fetchErr) throw fetchErr;
    if (!apt) throw new Error('Appointment not found.');

    const oldDate = apt.appointment_date;
    const oldTime = apt.appointment_time;
    const doctorId = apt.doctor_id;

    // If date and time didn't change, return success
    if (oldDate === newDate && oldTime === newTime) {
      return { success: true };
    }

    // 2. Validate leaves on new date
    const { data: leaves, error: leaveErr } = await supabase
      .from('doctor_leaves')
      .select('id')
      .eq('doctor_id', doctorId)
      .eq('leave_date', newDate);

    if (leaveErr) throw leaveErr;
    if (leaves && leaves.length > 0) {
      return { success: false, error: 'The doctor is scheduled to be on leave on the new date.' };
    }

    // 3. Validate availability plan / exceptions on new date
    const dateParts = newDate.split('-').map(Number);
    const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const weekday = dateObj.getDay();

    const { data: exception, error: exceptionErr } = await supabase
      .from('doctor_availability_exceptions')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('exception_date', newDate)
      .maybeSingle();

    if (exceptionErr) throw exceptionErr;

    let plan;
    if (exception) {
      if (!exception.is_available) {
        return { success: false, error: 'The doctor is unavailable on the new date.' };
      }
      plan = exception;
    } else {
      const { data: weeklyPlan, error: planErr } = await supabase
        .from('doctor_availability')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('weekday', weekday)
        .eq('is_available', true)
        .maybeSingle();

      if (planErr) throw planErr;
      plan = weeklyPlan;
    }

    if (!plan) {
      return { success: false, error: 'The doctor has no work hours scheduled for the new date.' };
    }

    // Verify time falls inside planned work hours
    const timeToSeconds = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 3600 + m * 60;
    };

    const slotSecs = timeToSeconds(newTime);
    const startSecs = timeToSeconds(plan.start_time);
    const endSecs = timeToSeconds(plan.end_time);

    if (slotSecs < startSecs || slotSecs + (plan.slot_duration || 30) * 60 > endSecs) {
      return { success: false, error: "The new slot falls outside the doctor's active schedule hours." };
    }

    // 4. Verify new slot is not already booked by another active appointment
    const { data: bookings, error: bookErr } = await supabase
      .from('appointments')
      .select('id')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', newDate)
      .eq('slot_id', newTime)
      .is('deleted_at', null)
      .neq('status', 'rejected')
      .neq('id', id); // exclude current appointment

    if (bookErr) throw bookErr;
    if (bookings && bookings.length > 0) {
      return { success: false, error: 'The new slot is already booked.' };
    }

    // 5. Update appointment details
    const { error: updateErr } = await supabase
      .from('appointments')
      .update({
        appointment_date: newDate,
        appointment_time: newTime,
        slot_id: newTime,
        reminder_24h_sent: false,
        reminder_1h_sent: false,
      })
      .eq('id', id);

    if (updateErr) {
      if (updateErr.code === '23505' || updateErr.message.includes('unique')) {
        return { success: false, error: 'Double-booking conflict: This slot was just booked.' };
      }
      throw updateErr;
    }

    // 6. Log history
    const oldDetailsStr = `${oldDate} ${oldTime?.substring(0, 5)}`;
    const newDetailsStr = `${newDate} ${newTime?.substring(0, 5)}`;
    await supabase
      .from('appointment_history')
      .insert({
        appointment_id: id,
        action: 'rescheduled',
        old_status: `Scheduled on ${oldDetailsStr}`,
        new_status: `Rescheduled to ${newDetailsStr}`,
        changed_by: changedBy,
      });

    // 7. Enqueue reschedule email notification if email exists
    const patientEmail = apt.patient_email;
    const doctorName = apt.doctors?.name || 'Doctor';
    const doctorSpecialization = apt.doctors?.specialization || 'Specialist';

    if (patientEmail && patientEmail !== 'not-provided@clinic.com') {
      const calendarDetails = {
        id: apt.id,
        patientName: apt.patient_name,
        doctorName,
        doctorSpecialization,
        date: newDate,
        time: newTime?.substring(0, 5),
        symptoms: apt.symptoms_description,
      };

      const googleUrl = getGoogleCalendarUrl(calendarDetails);
      const { subject, html } = getEmailTemplate('appointment-confirmed', {
        ...calendarDetails,
        calendarUrl: googleUrl,
        subject: `[RESCHEDULED] Your appointment with Dr. ${doctorName}`,
      });

      await enqueueNotification({
        type: 'email',
        recipient: patientEmail,
        subject,
        payload: html,
      });
    }

    // 8. Enqueue reschedule SMS notification if phone exists
    const patientPhone = apt.patient_phone;
    if (patientPhone) {
      const smsPayload = JSON.stringify({
        template: 'appointment_reschedule',
        patientName: apt.patient_name,
        doctorName,
        date: newDate,
        time: newTime?.substring(0, 5),
        appointmentId: id,
      });

      await enqueueNotification({
        type: 'sms',
        recipient: patientPhone,
        payload: smsPayload,
      });
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error rescheduling appointment:', err);
    return { success: false, error: err.message || err };
  }
}

