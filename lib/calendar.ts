/**
 * Calendar Integration Utility
 * Provides helpers to synchronize appointments with calendar clients
 */

export interface AppointmentCalendarDetails {
  id?: string;
  patientName: string;
  doctorName: string;
  doctorSpecialization?: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  symptoms?: string;
}

/**
 * Returns a template link to open Google Calendar with pre-populated event details.
 */
export function getGoogleCalendarUrl(details: AppointmentCalendarDetails): string {
  const title = `Hospital Appointment with Dr. ${details.doctorName}`;
  const dates = formatDateTimeLocal(details.date, details.time, 30);
  const description = `Appointment at Team Inspire Care Hospital.\n\nDoctor: Dr. ${details.doctorName} (${details.doctorSpecialization || 'Specialist'})\nPatient: ${details.patientName}\nSymptoms: ${details.symptoms || 'General Checkup'}`;
  const location = 'Team Inspire Care Hospital, Mumbai, Maharashtra, India';

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
}

/**
 * Generates plain-text iCalendar (RFC 5545) event data.
 */
export function getIcsFileContent(details: AppointmentCalendarDetails): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const [year, month, day] = details.date.split('-');
  const [hours, minutes] = details.time.split(':');
  const start = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes));
  const end = new Date(start.getTime() + 30 * 60000); // Default to 30 min duration

  const startStr = `${start.getFullYear()}${pad(start.getMonth() + 1)}${pad(start.getDate())}T${pad(start.getHours())}${pad(start.getMinutes())}00`;
  const endStr = `${end.getFullYear()}${pad(end.getMonth() + 1)}${pad(end.getDate())}T${pad(end.getHours())}${pad(end.getMinutes())}00`;
  
  const uid = details.id || Math.random().toString(36).substring(2, 11);
  const description = `Appointment with Dr. ${details.doctorName} (${details.doctorSpecialization || 'Specialist'}). Patient: ${details.patientName}. Symptoms: ${details.symptoms || 'None'}`;

  // Escape special calendar format characters
  const escapedDesc = description.replace(/[,;]/g, '\\$&').replace(/\n/g, '\\n');
  const location = 'Team Inspire Care Hospital\\, Mumbai\\, Maharashtra\\, India';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Team Inspire Care//Hospital Management System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `SUMMARY:Appointment with Dr. ${details.doctorName}`,
    `UID:${uid}@teaminspirecare.com`,
    'SEQUENCE:0',
    'STATUS:CONFIRMED',
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `DESCRIPTION:${escapedDesc}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

/**
 * Initiates a client-side file download of the generated .ics calendar invite.
 */
export function downloadIcsFile(details: AppointmentCalendarDetails) {
  if (typeof window === 'undefined') return;
  
  try {
    const content = getIcsFileContent(details);
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Normalize doctor name for standard filesystem usage
    const docNameClean = details.doctorName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.setAttribute('download', `appointment-dr-${docNameClean}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to trigger .ics download:', err);
  }
}

/**
 * Formats a date and time string into YYYYMMDDTHHmmSS format.
 */
function formatDateTimeLocal(dateStr: string, timeStr: string, durationMinutes = 30): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const [year, month, day] = dateStr.split('-');
  const [hours, minutes] = timeStr.split(':');
  const start = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes));
  const end = new Date(start.getTime() + durationMinutes * 60000);

  const startStr = `${start.getFullYear()}${pad(start.getMonth() + 1)}${pad(start.getDate())}T${pad(start.getHours())}${pad(start.getMinutes())}00`;
  const endStr = `${end.getFullYear()}${pad(end.getMonth() + 1)}${pad(end.getDate())}T${pad(end.getHours())}${pad(end.getMinutes())}00`;
  
  return `${startStr}/${endStr}`;
}
