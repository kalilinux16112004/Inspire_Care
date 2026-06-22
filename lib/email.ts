'use server';

import { createClient } from '@/lib/supabase/server';
import nodemailer from 'nodemailer';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email using the prioritized sequence:
 * 1. Resend API (if RESEND_API_KEY is configured)
 * 2. SMTP (if SMTP_HOST is configured)
 * 3. Database Log Mock Fallback (if no credentials are provided)
 */
export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const smtpHost = process.env.SMTP_HOST;

  // 1. Try Resend API
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Team Inspire Care <onboarding@resend.dev>', // Default Resend sandbox sender
          to: to,
          subject: subject,
          html: html,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        await logEmailToDb(to, subject, html, 'success');
        return { success: true, id: result.id, provider: 'resend' };
      } else {
        const errMsg = result.message || 'Resend API error';
        await logEmailToDb(to, subject, html, 'failed', errMsg);
        return { success: false, error: errMsg };
      }
    } catch (err: any) {
      await logEmailToDb(to, subject, html, 'failed', err.message);
      return { success: false, error: err.message };
    }
  }

  // 2. Try SMTP Nodemailer
  if (smtpHost) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
        },
      });

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Team Inspire Care" <appointments@teaminspirecare.com>',
        to: to,
        subject: subject,
        html: html,
      });

      await logEmailToDb(to, subject, html, 'success');
      return { success: true, id: info.messageId, provider: 'smtp' };
    } catch (err: any) {
      await logEmailToDb(to, subject, html, 'failed', err.message);
      return { success: false, error: err.message };
    }
  }

  // 3. Fallback Mock Mode (console + database insert)
  console.log('📬 [EMAIL MOCK] dispatching email alert:');
  console.log(`   Recipient: ${to}`);
  console.log(`   Subject:   ${subject}`);
  console.log(`   Body Size: ${html.length} chars`);

  try {
    await logEmailToDb(to, subject, html, 'mock_sent');
    return { success: true, mocked: true, provider: 'mock' };
  } catch (err: any) {
    console.error('Failed to log mock email to database:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Inserts a log entry into the audit_emails database table.
 */
async function logEmailToDb(
  recipient: string,
  subject: string,
  htmlContent: string,
  status: string,
  errorMessage?: string
) {
  try {
    const supabase = await createClient();
    const payload: any = {
      recipient,
      subject,
      html_content: htmlContent,
      status,
    };
    
    // In our DB migration, we have status and errorMessage columns.
    // If there is an error, we store it in the status metadata or logs.
    if (errorMessage) {
      payload.status = `failed`;
      console.warn(`Email log error: ${errorMessage}`);
    }

    const { error: insertError } = await supabase
      .from('audit_emails')
      .insert(payload);

    if (insertError) {
      console.error('Database logging error (audit_emails):', insertError.message);
    }
  } catch (err: any) {
    console.error('Exception while logging email to database:', err.message || err);
  }
}
