'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Trash2, Edit2 } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  experience_years: number;
  consultation_fee: number;
  is_active: boolean;
}

export default function DoctorsManager() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    qualification: '',
    experience_years: 0,
    consultation_fee: 0,
  });

  useEffect(() => {
    fetchDoctors();
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

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('doctors').insert({
        ...formData,
        is_active: true,
      });

      if (error) throw error;

      setFormData({
        name: '',
        specialization: '',
        qualification: '',
        experience_years: 0,
        consultation_fee: 0,
      });
      setShowForm(false);
      fetchDoctors();
    } catch (error) {
      console.error('[v0] Error adding doctor:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    try {
      const { error } = await supabase.from('doctors').delete().eq('id', id);
      if (error) throw error;
      fetchDoctors();
    } catch (error) {
      console.error('[v0] Error deleting doctor:', error);
    }
  };

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
            value={formData.experience_years}
            onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) })}
            className="w-full border border-border rounded px-3 py-2"
          />
          <input
            type="number"
            placeholder="Consultation Fee"
            value={formData.consultation_fee}
            onChange={(e) => setFormData({ ...formData, consultation_fee: parseFloat(e.target.value) })}
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
                      <Button size="sm" variant="outline">
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
    </div>
  );
}
