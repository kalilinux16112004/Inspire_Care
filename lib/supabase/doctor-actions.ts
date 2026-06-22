'use server';

import { createClient } from '@/lib/supabase/server';

export interface DoctorPayload {
  name: string;
  specialization?: string;
  qualification?: string;
  experience_years?: number;
  bio?: string;
  image_url?: string;
  special_services?: string[];
  phone?: string;
  availability?: string;
}

export async function addDoctor(payload: DoctorPayload & { is_active: boolean }) {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('doctors')
      .insert([payload])
      .select();

    if (error) {
      console.error('[v0] Server: Error inserting doctor:', {
        message: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details,
        status: error.status,
      });
      throw new Error(error.message || 'Failed to add doctor');
    }

    const doctorId = data?.[0]?.id;
    if (doctorId && payload.availability) {
      try {
        const schedule = JSON.parse(payload.availability);
        const DAY_MAP: { [key: string]: number } = {
          'Sunday': 0,
          'Monday': 1,
          'Tuesday': 2,
          'Wednesday': 3,
          'Thursday': 4,
          'Friday': 5,
          'Saturday': 6
        };
        const availabilityRows: any[] = [];
        
        Object.entries(schedule).forEach(([dayName, dayInfo]: [string, any]) => {
          if (dayInfo && dayInfo.enabled) {
            const weekday = DAY_MAP[dayName];
            if (weekday !== undefined) {
              availabilityRows.push({
                doctor_id: doctorId,
                weekday,
                start_time: dayInfo.start || '09:00',
                end_time: dayInfo.end || '17:00',
                slot_duration: 30,
                is_available: true
              });
            }
          }
        });

        if (availabilityRows.length > 0) {
          const { error: syncError } = await supabase
            .from('doctor_availability')
            .insert(availabilityRows);
            
          if (syncError) {
            console.error('[v0] Error syncing availability rows:', syncError);
          }
        }
      } catch (parseErr) {
        console.error('[v0] Failed parsing/syncing availability schedule:', parseErr);
      }
    }

    return { success: true, data: data ? { id: data[0]?.id } : null };
  } catch (error: any) {
    console.error('[v0] Server action error (addDoctor):', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

export async function updateDoctor(id: string, payload: DoctorPayload) {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('doctors')
      .update(payload)
      .eq('id', id)
      .select();

    if (error) {
      console.error('[v0] Server: Error updating doctor:', {
        message: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details,
        status: error.status,
      });
      throw new Error(error.message || 'Failed to update doctor');
    }

    if (payload.availability) {
      // First delete existing rows for this doctor
      const { error: deleteErr } = await supabase
        .from('doctor_availability')
        .delete()
        .eq('doctor_id', id);

      if (deleteErr) {
        console.error('[v0] Error deleting old availability rows:', deleteErr);
      }

      // Sync new ones
      try {
        const schedule = JSON.parse(payload.availability);
        const DAY_MAP: { [key: string]: number } = {
          'Sunday': 0,
          'Monday': 1,
          'Tuesday': 2,
          'Wednesday': 3,
          'Thursday': 4,
          'Friday': 5,
          'Saturday': 6
        };
        const availabilityRows: any[] = [];
        
        Object.entries(schedule).forEach(([dayName, dayInfo]: [string, any]) => {
          if (dayInfo && dayInfo.enabled) {
            const weekday = DAY_MAP[dayName];
            if (weekday !== undefined) {
              availabilityRows.push({
                doctor_id: id,
                weekday,
                start_time: dayInfo.start || '09:00',
                end_time: dayInfo.end || '17:00',
                slot_duration: 30,
                is_available: true
              });
            }
          }
        });

        if (availabilityRows.length > 0) {
          const { error: syncError } = await supabase
            .from('doctor_availability')
            .insert(availabilityRows);
            
          if (syncError) {
            console.error('[v0] Error syncing availability rows during update:', syncError);
          }
        }
      } catch (parseErr) {
        console.error('[v0] Failed parsing/syncing availability schedule during update:', parseErr);
      }
    }

    return { success: true, data: data ? { id: data[0]?.id } : null };
  } catch (error: any) {
    console.error('[v0] Server action error (updateDoctor):', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

export async function deleteDoctor(id: string) {
  try {
    const supabase = await createClient();
    
    // Use soft delete: mark as inactive instead of hard delete
    // This prevents foreign key constraint violations from appointments
    const { error } = await supabase
      .from('doctors')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('[v0] Server: Error deleting doctor:', {
        message: error.message,
        code: error.code,
      });
      throw new Error(error.message || 'Failed to delete doctor');
    }

    return { success: true };
  } catch (error: any) {
    console.error('[v0] Server action error (deleteDoctor):', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}
