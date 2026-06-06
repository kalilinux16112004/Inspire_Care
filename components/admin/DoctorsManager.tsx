'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import ConfirmDialog from './ConfirmDialog';
import { Loader2, Plus, Trash2, Edit2 } from 'lucide-react';
import { addDoctor, updateDoctor, deleteDoctor } from '@/lib/supabase/doctor-actions';

interface Doctor {
  id: string;
  name: string;
  specialization?: string;
  qualification?: string;
  experience_years?: number;
  bio?: string;
  image_url?: string;
  specialServices?: string[];
  phone?: string;
  availability?: string;
  is_active?: boolean;
}

export default function DoctorsManager() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    qualification: '',
    experience_years: 0,
    bio: '',
    image_url: '',
    specialServices: '',
    phone: '',
    availabilityDays: '',
    availabilityStartTime: '',
    availabilityEndTime: '',
  });

  useEffect(() => {
    fetchDoctors();

    const channel = supabase
      .channel('doctors-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'doctors' }, (payload) => {
        console.log('[v0] realtime doctors event', payload);
        fetchDoctors();
      })
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {
        channel.unsubscribe();
      }
    };
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('name');

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('[v0] Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadDoctorPhoto = async (file: File) => {
    setPhotoUploading(true);
    try {
      const filePath = `doctors/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      setFormData((prev) => ({
        ...prev,
        image_url: publicUrlData.publicUrl,
      }));
    } catch (error) {
      console.error('[v0] Error uploading doctor photo:', error);
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate image was uploaded only when adding new doctor
      if (!editingId && !formData.image_url) {
        console.error('[v0] Doctor photo must be uploaded before submitting');
        alert('Please upload a doctor photo before submitting');
        return;
      }

      const payload: any = {
        name: formData.name,
        specialization: formData.specialization,
        qualification: formData.qualification,
        experience_years: Number(formData.experience_years) || 0,
        bio: formData.bio,
        special_services: formData.specialServices
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        phone: formData.phone || '',
        availability:
          formData.availabilityDays && formData.availabilityStartTime && formData.availabilityEndTime
            ? `${formData.availabilityDays} ${formData.availabilityStartTime} - ${formData.availabilityEndTime}`
            : '',
      };

      // Only include image_url if it's provided
      if (formData.image_url) {
        payload.image_url = formData.image_url;
      }

      console.log('[v0] Submitting doctor payload:', payload);

      let result;
      if (editingId) {
        result = await updateDoctor(editingId, payload);
      } else {
        result = await addDoctor({
          ...payload,
          is_active: true,
        });
      }

      if (!result.success) {
        console.error('[v0] Server action failed:', result.error);
        alert(`Error: ${result.error}`);
        return;
      }

      console.log('[v0] Doctor saved successfully:', result.data);

      setFormData({
        name: '',
        specialization: '',
        qualification: '',
        experience_years: 0,
        bio: '',
        image_url: '',
        specialServices: '',
        phone: '',
        availabilityDays: '',
        availabilityStartTime: '',
        availabilityEndTime: '',
      });
      setShowForm(false);
      setEditingId(null);
      fetchDoctors();
    } catch (error: any) {
      console.error('[v0] Error adding doctor:', error);
      console.error('[v0] Error details:', error.message, error.stack);
      alert(`Error: ${error.message || 'An unexpected response was received from the server'}`);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      const result = await deleteDoctor(deletingId);
      if (!result.success) {
        console.error('[v0] Delete failed:', result.error);
        alert(`Error: ${result.error}`);
        return;
      }
      setDeletingId(null);
      fetchDoctors();
    } catch (error) {
      console.error('[v0] Error deleting doctor:', error);
      alert('Error deleting doctor');
    }
  };

  const cancelDelete = () => setDeletingId(null);

  const startEdit = (doctor: Doctor) => {
    // Parse availability string back into separate fields
    // Format: "Mon-Fri 09:00 - 17:00" or "Mon, Wed, Fri 09:00 - 17:00"
    let days = '';
    let startTime = '';
    let endTime = '';

    if (doctor.availability) {
      const match = doctor.availability.match(/^(.+?)\s+(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/);
      if (match) {
        days = match[1];
        startTime = match[2];
        endTime = match[3];
      }
    }

    setFormData({
      name: doctor.name || '',
      specialization: doctor.specialization || '',
      qualification: doctor.qualification || '',
      experience_years: doctor.experience_years || 0,
      bio: doctor.bio || '',
      image_url: doctor.image_url || '',
      specialServices: (doctor.specialServices || []).join(', '),
      phone: doctor.phone || '',
      availabilityDays: days,
      availabilityStartTime: startTime,
      availabilityEndTime: endTime,
    });
    setEditingId(doctor.id);
    setShowForm(true);
  }

  return (
    <div className="space-y-6">
      <Button
        onClick={() => setShowForm(!showForm)}
        className="bg-primary hover:bg-primary/90 gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Doctor
      </Button>

      {showForm && (
        <form onSubmit={handleAddDoctor} className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-8 space-y-6 shadow-lg">
          <div className="border-b border-blue-100 pb-4">
            <h3 className="text-xl font-bold text-foreground">{editingId ? 'Edit Doctor' : 'Add New Doctor'}</h3>
            <p className="text-sm text-muted-foreground mt-1">Fill in the doctor's essential information</p>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Doctor Name *</label>
            <input
              type="text"
              placeholder="e.g., Dr. John Smith"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Specialization Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Specialization *</label>
            <input
              type="text"
              placeholder="e.g., Cardiology, Pediatrics"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Qualification Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Qualification *</label>
            <input
              type="text"
              placeholder="e.g., MBBS, MD"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Experience Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Experience (Years) *</label>
            <input
              type="number"
              placeholder="e.g., 15"
              value={formData.experience_years || ''}
              onChange={(e) => setFormData({ ...formData, experience_years: e.target.value === '' ? 0 : parseInt(e.target.value) })}
              className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
              min="0"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Photo *</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) await uploadDoctorPhoto(file);
                }}
                className="w-full border-2 border-dashed border-blue-300 rounded-lg px-4 py-6 text-center cursor-pointer hover:border-primary hover:bg-blue-50 transition"
                required={!editingId}
              />
              <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">Click to select an image</p>
            </div>
            {photoUploading && <p className="text-sm text-primary font-semibold mt-2">Uploading photo...</p>}
            {formData.image_url && <p className="text-sm text-green-600 font-semibold mt-2">✓ Photo uploaded</p>}
          </div>

          {/* Bio Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Bio / Description</label>
            <textarea
              placeholder="Write a brief bio about the doctor's background, expertise, and approach to patient care..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-32 resize-none"
            />
          </div>

          {/* Optional Fields Divider */}
          <div className="border-t border-blue-100 pt-6">
            <p className="text-sm text-slate-600 font-semibold mb-4">Additional Information (Optional)</p>
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
            <input
              type="tel"
              placeholder="e.g., +1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Special Services Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Special Services</label>
            <input
              type="text"
              placeholder="e.g., Telemedicine, Emergency Care, Surgery (comma separated)"
              value={formData.specialServices}
              onChange={(e) => setFormData({ ...formData, specialServices: e.target.value })}
              className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Availability Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Availability</label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Days</label>
                <input
                  type="text"
                  placeholder="e.g., Mon-Fri or Mon, Wed, Fri"
                  value={formData.availabilityDays}
                  onChange={(e) => setFormData({ ...formData, availabilityDays: e.target.value })}
                  className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.availabilityStartTime}
                    onChange={(e) => setFormData({ ...formData, availabilityStartTime: e.target.value })}
                    className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.availabilityEndTime}
                    onChange={(e) => setFormData({ ...formData, availabilityEndTime: e.target.value })}
                    className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-blue-100">
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 h-11 font-semibold">
              {editingId ? 'Update Doctor' : 'Add Doctor'}
            </Button>
            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-6 h-11 font-semibold">
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="bg-white border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No doctors yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold">Specialization</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold">Qualification</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold">Experience</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {doctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{doctor.name}</td>
                    <td className="px-6 py-4">{doctor.specialization}</td>
                    <td className="px-6 py-4">{doctor.qualification}</td>
                    <td className="px-6 py-4">{doctor.experience_years} years</td>
                    <td className="px-6 py-4 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(doctor)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(doctor.id)}
                        className="text-red-600 border-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {deletingId && (
        <ConfirmDialog
          open={!!deletingId}
          title="Delete Doctor"
          description="Are you sure you want to delete this doctor? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}
