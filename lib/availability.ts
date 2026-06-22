import { SupabaseClient } from '@supabase/supabase-js';

interface GenerateSlotsParams {
  startTime: string; // e.g. "09:00" or "09:00:00"
  endTime: string;   // e.g. "17:00" or "17:00:00"
  slotDuration: number; // in minutes
  bufferTime: number;   // in minutes
  existingBookings: string[]; // array of booked slots
  isOnLeave: boolean;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

/**
 * Generates an array of time slot objects indicating their availability.
 */
export function generateSlots({
  startTime,
  endTime,
  slotDuration = 30,
  bufferTime = 0,
  existingBookings = [],
  isOnLeave = false,
}: GenerateSlotsParams): TimeSlot[] {
  if (isOnLeave) {
    return [];
  }

  const slots: TimeSlot[] = [];

  const parseTime = (timeStr: string) => {
    const parts = timeStr.split(':');
    return {
      hours: Number(parts[0] || 0),
      minutes: Number(parts[1] || 0),
    };
  };

  const start = parseTime(startTime);
  const end = parseTime(endTime);

  let current = new Date(2000, 0, 1, start.hours, start.minutes, 0);
  const limit = new Date(2000, 0, 1, end.hours, end.minutes, 0);

  const normalizedBookings = existingBookings
    .map((b) => {
      if (!b) return '';
      return b.substring(0, 5);
    })
    .filter(Boolean);

  const totalIncrement = slotDuration + bufferTime;

  while (current.getTime() + slotDuration * 60000 <= limit.getTime()) {
    const hh = current.getHours().toString().padStart(2, '0');
    const mm = current.getMinutes().toString().padStart(2, '0');
    const slotTimeStr = `${hh}:${mm}`;

    const isBooked = normalizedBookings.includes(slotTimeStr);

    slots.push({
      time: slotTimeStr,
      available: !isBooked,
    });

    current = new Date(current.getTime() + totalIncrement * 60000);
  }

  return slots;
}

/**
 * Fetches schedules, exceptions, leaves, active holds, and active appointments (excluding soft-deleted)
 * from Supabase and returns computed available slots.
 */
export async function getDoctorDaySlots(
  supabase: SupabaseClient,
  doctorId: string,
  dateStr: string,
  bufferTime = 0
): Promise<{ slots: TimeSlot[]; error?: string; isOnLeave: boolean; isUnscheduled: boolean }> {
  try {
    // 1. Check if the doctor has leave recorded for this date
    const { data: leaves, error: leaveErr } = await supabase
      .from('doctor_leaves')
      .select('id')
      .eq('doctor_id', doctorId)
      .eq('leave_date', dateStr);

    if (leaveErr) throw leaveErr;
    if (leaves && leaves.length > 0) {
      return { slots: [], isOnLeave: true, isUnscheduled: false };
    }

    // 2. Check if there is an availability exception for this date
    const { data: exception, error: exceptionErr } = await supabase
      .from('doctor_availability_exceptions')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('exception_date', dateStr)
      .maybeSingle();

    if (exceptionErr) throw exceptionErr;

    let schedulingHours;
    if (exception) {
      if (!exception.is_available) {
        // Exception dictates doctor is closed on this date
        return { slots: [], isOnLeave: false, isUnscheduled: true };
      }
      schedulingHours = {
        start_time: exception.start_time,
        end_time: exception.end_time,
        slot_duration: exception.slot_duration || 30,
      };
    } else {
      // 3. Fallback to weekly weekday plan
      const dateParts = dateStr.split('-').map(Number);
      if (dateParts.length !== 3) {
        throw new Error('Invalid date format, expected YYYY-MM-DD');
      }
      const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      const weekday = dateObj.getDay();

      const { data: plan, error: planErr } = await supabase
        .from('doctor_availability')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('weekday', weekday)
        .eq('is_available', true)
        .maybeSingle();

      if (planErr) throw planErr;
      if (!plan) {
        return { slots: [], isOnLeave: false, isUnscheduled: true };
      }

      schedulingHours = {
        start_time: plan.start_time,
        end_time: plan.end_time,
        slot_duration: plan.slot_duration || 30,
      };
    }

    // 4. Fetch already booked active appointments (excluding soft-deleted ones)
    const { data: bookings, error: bookingsErr } = await supabase
      .from('appointments')
      .select('slot_id')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', dateStr)
      .is('deleted_at', null)
      .neq('status', 'rejected');

    if (bookingsErr) throw bookingsErr;
    const bookedSlots = (bookings || []).map((b) => b.slot_id).filter(Boolean);

    // 5. Fetch active holds
    const { data: holds, error: holdsErr } = await supabase
      .from('appointment_holds')
      .select('slot_id')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', dateStr)
      .gt('expires_at', new Date().toISOString());

    if (holdsErr) throw holdsErr;
    const heldSlots = (holds || []).map((h) => h.slot_id).filter(Boolean);

    const unavailableSlots = new Set([...bookedSlots, ...heldSlots]);

    // 6. Generate slots
    const baseSlots = generateSlots({
      startTime: schedulingHours.start_time,
      endTime: schedulingHours.end_time,
      slotDuration: schedulingHours.slot_duration,
      bufferTime,
      existingBookings: [],
      isOnLeave: false,
    });

    const slots = baseSlots.map((slot) => ({
      time: slot.time,
      available: !unavailableSlots.has(slot.time),
    }));

    return { slots, isOnLeave: false, isUnscheduled: false };
  } catch (err: any) {
    console.error('Error retrieving doctor availability slots:', err);
    return { slots: [], isOnLeave: false, isUnscheduled: false, error: err.message || err };
  }
}
