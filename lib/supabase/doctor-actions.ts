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
