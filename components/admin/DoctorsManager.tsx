'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import ConfirmDialog from './ConfirmDialog';
import { Loader2, Plus, Trash2, Edit2 } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  department?: string;
  specialization?: string;
  qualification?: string;
  experience_years?: number;
  consultation_fee?: number;
  bio?: string;
  image_url?: string;
  clinicAddress?: string;
  phone?: string;
  email?: string;
  languages?: string[];
  specialServices?: string[];
  qualifications?: string[];
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
    department: '',
    specialization: '',
    qualification: '',
    experience_years: 0,
    consultation_fee: 0,
    bio: '',
    image_url: '',
    clinicAddress: '',
    phone: '',
    email: '',
    languages: '',
    specialServices: '',
    qualifications: '',
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
      const payload = {
        name: formData.name,
        department: formData.department,
        specialization: formData.specialization,
        qualification: formData.qualification,
        experience_years: Number(formData.experience_years) || 0,
        consultation_fee: Number(formData.consultation_fee) || 0,
        bio: formData.bio,
        image_url: formData.image_url,
        clinicAddress: formData.clinicAddress,
        phone: formData.phone,
        email: formData.email,
        languages: formData.languages
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        specialServices: formData.specialServices
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        qualifications: formData.qualifications
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      };

      if (editingId) {
        const { error } = await supabase.from('doctors').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('doctors').insert({
          ...payload,
          is_active: true,
        });
        if (error) throw error;
      }

      setFormData({
        name: '',
        department: '',
        specialization: '',
        qualification: '',
        experience_years: 0,
        consultation_fee: 0,
        bio: '',
        image_url: '',
        clinicAddress: '',
        phone: '',
        email: '',
        languages: '',
        specialServices: '',
        qualifications: '',
      });
      setShowForm(false);
      setEditingId(null);
      fetchDoctors();
    } catch (error) {
      console.error('[v0] Error adding doctor:', error);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      const { error } = await supabase.from('doctors').delete().eq('id', deletingId);
      if (error) throw error;
      setDeletingId(null);
      fetchDoctors();
    } catch (error) {
      console.error('[v0] Error deleting doctor:', error);
    }
  };

  const cancelDelete = () => setDeletingId(null);

  const startEdit = (doctor: Doctor) => {
    setFormData({
      name: doctor.name || '',
      department: doctor.department || '',
      specialization: doctor.specialization || '',
      qualification: doctor.qualification || '',
      experience_years: doctor.experience_years || 0,
      consultation_fee: doctor.consultation_fee || 0,
      bio: doctor.bio || '',
      image_url: doctor.image_url || '',
      clinicAddress: doctor.clinicAddress || '',
      phone: doctor.phone || '',
      email: doctor.email || '',
      languages: (doctor.languages || []).join(', '),
      specialServices: (doctor.specialServices || []).join(', '),
      qualifications: (doctor.qualifications || []).join(', '),
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
        <form onSubmit={handleAddDoctor} className="bg-white border border-border rounded-lg p-6 space-y-4">
          <input
            type="text"
            placeholder="Doctor Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border border-border rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="w-full border border-border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Specialization"
            value={formData.specialization}
            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            className="w-full border border-border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Qualification"
            value={formData.qualification}
            onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
            className="w-full border border-border rounded px-3 py-2"
          />
          <input
            type="number"
            placeholder="Experience (years)"
            value={typeof formData.experience_years === 'number' && Number.isNaN(formData.experience_years) ? '' : formData.experience_years}
            onChange={(e) => setFormData({ ...formData, experience_years: e.target.value === '' ? 0 : parseInt(e.target.value) })}
            className="w-full border border-border rounded px-3 py-2"
          />
          <input
            type="number"
            placeholder="Consultation Fee"
            value={typeof formData.consultation_fee === 'number' && Number.isNaN(formData.consultation_fee) ? '' : formData.consultation_fee}
            onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
            className="w-full border border-border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Doctor Photo URL"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className="w-full border border-border rounded px-3 py-2"
          />
          <label className="block text-sm font-medium text-slate-700">Upload Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) await uploadDoctorPhoto(file);
            }}
            className="w-full border border-border rounded px-3 py-2"
          />
          {photoUploading && <p className="text-sm text-muted-foreground">Uploading photo...</p>}
          <textarea
            placeholder="Doctor Bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full border border-border rounded px-3 py-2 min-h-24"
          />
          <input
            type="text"
            placeholder="Clinic Address"
            value={formData.clinicAddress}
            onChange={(e) => setFormData({ ...formData, clinicAddress: e.target.value })}
            className="w-full border border-border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full border border-border rounded px-3 py-2"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border border-border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Languages (comma separated)"
            value={formData.languages}
            onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
            className="w-full border border-border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Special Services (comma separated)"
            value={formData.specialServices}
            onChange={(e) => setFormData({ ...formData, specialServices: e.target.value })}
            className="w-full border border-border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Qualifications (comma separated)"
            value={formData.qualifications}
            onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
            className="w-full border border-border rounded px-3 py-2"
          />
          <div className="flex gap-2">
            <Button type="submit" className="bg-primary hover:bg-primary/90">Save</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
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
                  <th className="px-6 py-3 text-left text-xs font-semibold">Experience</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold">Fee</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {doctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{doctor.name}</td>
                    <td className="px-6 py-4">{doctor.specialization}</td>
                    <td className="px-6 py-4">{doctor.experience_years} years</td>
                    <td className="px-6 py-4">₹{doctor.consultation_fee}</td>
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
