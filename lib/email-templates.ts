export interface EmailTemplateDetails {
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  patientAge?: number | null;
  doctorName: string;
  doctorSpecialization?: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  symptoms?: string;
  calendarUrl?: string;
}

/**
 * Returns subject and formatted HTML body for a given notification template key.
 */
export function getEmailTemplate(type: string, details: EmailTemplateDetails): { subject: string; html: string } {
  // Safe date parsing for date strings
  let formattedDate = details.date;
  try {
    formattedDate = new Date(details.date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    // Fallback to raw string
  }

  const footer = `
    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
    <p style="font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5; font-family: sans-serif;">
      This is an automated notification from Team Inspire Care Hospital.<br/>
      If you have questions or need to reschedule, please contact outpatient services at +91-253-2333333.<br/>
      &copy; 2026 Team Inspire Care Hospital. Mumbai, Maharashtra, India.
    </p>
  `;

  switch (type) {
    case 'appointment-pending':
      return {
        subject: 'Appointment Booking Request - Pending Review',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; color: #334155;">
            <h2 style="color: #1565c0; margin-top: 0; padding-bottom: 12px; border-bottom: 2px solid #f1f5f9;">Appointment Request Received</h2>
            <p>Dear <strong>${details.patientName}</strong>,</p>
            <p>Thank you for choosing Team Inspire Care. Your booking request has been successfully submitted and is currently <strong>Pending Review</strong> by our medical staff.</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; padding: 18px; border-radius: 8px; margin: 25px 0;">
              <h4 style="margin: 0 0 12px 0; color: #0f172a; border-bottom: 1px dashed #e2e8f0; padding-bottom: 6px;">Request Details:</h4>
              <table style="width: 100%; font-size: 14px; line-height: 1.6; border-collapse: collapse;">
                <tr>
                  <td style="color: #64748b; width: 120px; font-weight: 500; padding: 4px 0;">Doctor:</td>
                  <td style="padding: 4px 0;">Dr. ${details.doctorName} (${details.doctorSpecialization || 'Specialist'})</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 500; padding: 4px 0;">Date:</td>
                  <td style="padding: 4px 0;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 500; padding: 4px 0;">Time Slot:</td>
                  <td style="padding: 4px 0;">${details.time} (30 Minutes)</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 500; padding: 4px 0;">Status:</td>
                  <td style="padding: 4px 0;"><span style="background-color: #fef3c7; color: #d97706; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600;">Pending Confirmation</span></td>
                </tr>
              </table>
            </div>
            
            <p>We will review your requested slots and email you an official update shortly. Please retain this email for your scheduling records.</p>
            ${footer}
          </div>
        `,
      };

    case 'appointment-confirmed':
      return {
        subject: '✓ Appointment Confirmed - Team Inspire Care',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; color: #334155;">
            <h2 style="color: #10b981; margin-top: 0; padding-bottom: 12px; border-bottom: 2px solid #f1f5f9;">✓ Appointment Confirmed!</h2>
            <p>Dear <strong>${details.patientName}</strong>,</p>
            <p>We are pleased to inform you that your appointment request has been reviewed and is now officially <strong>Approved and Confirmed</strong>.</p>
            
            <div style="background-color: #f0fdf4; border: 1px solid #dcfce7; padding: 18px; border-radius: 8px; margin: 25px 0;">
              <h4 style="margin: 0 0 12px 0; color: #166534; border-bottom: 1px dashed #bbf7d0; padding-bottom: 6px;">Schedule Details:</h4>
              <table style="width: 100%; font-size: 14px; line-height: 1.6; border-collapse: collapse;">
                <tr>
                  <td style="color: #166534; width: 120px; font-weight: 500; padding: 4px 0;">Doctor:</td>
                  <td style="padding: 4px 0;"><strong>Dr. ${details.doctorName}</strong> (${details.doctorSpecialization || 'Specialist'})</td>
                </tr>
                <tr>
                  <td style="color: #166534; font-weight: 500; padding: 4px 0;">Date:</td>
                  <td style="padding: 4px 0;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="color: #166534; font-weight: 500; padding: 4px 0;">Confirmed Time:</td>
                  <td style="padding: 4px 0;">${details.time}</td>
                </tr>
                <tr>
                  <td style="color: #166534; font-weight: 500; padding: 4px 0;">Clinic Location:</td>
                  <td style="padding: 4px 0;">Main Wing, Outpatient Room 102, Inspire Care Hospital</td>
                </tr>
              </table>
            </div>
            
            <p>Please make sure to arrive 10 minutes prior to your time. If you wish to save this appointment to your personal calendar, click the sync button below:</p>
            
            ${
              details.calendarUrl
                ? `
            <div style="margin: 25px 0; text-align: center;">
              <a href="${details.calendarUrl}" target="_blank" style="background-color: #1565c0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Add to Google Calendar</a>
            </div>
            `
                : ''
            }
            
            ${footer}
          </div>
        `,
      };

    case 'appointment-cancelled':
      return {
        subject: 'Appointment Cancelled/Declined - Team Inspire Care',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; color: #334155;">
            <h2 style="color: #ef4444; margin-top: 0; padding-bottom: 12px; border-bottom: 2px solid #f1f5f9;">Appointment Update</h2>
            <p>Dear <strong>${details.patientName}</strong>,</p>
            <p>We are writing to inform you that your appointment request with Dr. ${details.doctorName} on ${details.date} at ${details.time} has been declined or cancelled.</p>
            
            <div style="background-color: #fef2f2; border: 1px solid #fee2e2; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 14px;">
              <p style="margin: 0; color: #991b1b;"><strong>Reason:</strong> Clinician schedule conflict, emergency absence, or double booking conflict resolved by admin.</p>
            </div>
            
            <p>Please visit our online directory to book an alternate slot, or reach out to our booking team at <strong>+91-253-2333333</strong> for direct assistance.</p>
            ${footer}
          </div>
        `,
      };

    case 'admin-new-appointment':
      return {
        subject: `🚨 [New Booking Request] ${details.patientName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; color: #334155;">
            <h2 style="color: #0f172a; margin-top: 0; padding-bottom: 12px; border-bottom: 2px solid #f1f5f9;">New Slot Request Received</h2>
            <p>A new appointment has been scheduled by a patient and is awaiting review in the admin panel.</p>
            
            <div style="background-color: #f1f5f9; padding: 18px; border-radius: 8px; margin: 20px 0; font-size: 14px; line-height: 1.6;">
              <h4 style="margin: 0 0 10px 0; color: #0f172a;">Request Details:</h4>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #64748b; width: 120px; font-weight: 500; padding: 4px 0;">Patient Name:</td>
                  <td style="padding: 4px 0;"><strong>${details.patientName}</strong></td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 500; padding: 4px 0;">Email Address:</td>
                  <td style="padding: 4px 0;">${details.patientEmail || 'Not Provided'}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 500; padding: 4px 0;">Phone Number:</td>
                  <td style="padding: 4px 0;">${details.patientPhone || 'Not Provided'}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 500; padding: 4px 0;">Age:</td>
                  <td style="padding: 4px 0;">${details.patientAge || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 500; padding: 4px 0;">Assigned Doctor:</td>
                  <td style="padding: 4px 0;">Dr. ${details.doctorName}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 500; padding: 4px 0;">Requested Slot:</td>
                  <td style="padding: 4px 0;">${details.date} at ${details.time}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 500; vertical-align: top; padding: 4px 0;">Symptoms:</td>
                  <td style="white-space: pre-wrap; padding: 4px 0;">${details.symptoms || 'None detailed'}</td>
                </tr>
              </table>
            </div>
            
            <p>Please log in to the dashboard to approve or reject this booking request.</p>
            ${footer}
          </div>
        `,
      };

    default:
      return {
        subject: `Appointment Notification - Inspire Care`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #334155;">
            <p>Dear ${details.patientName},</p>
            <p>This is a standard notification update regarding your appointment with Dr. ${details.doctorName} on ${details.date} at ${details.time}.</p>
            ${footer}
          </div>
        `,
      };
  }
}
