'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import ConfirmDialog from './ConfirmDialog';
import { Loader2, Plus, Trash2, Edit2 } from 'lucide-react';

const DEPARTMENTS = [
  'General',
  'Pediatrics',
  'Orthopedics',
  'Cardiology',
  'Gynecology',
  'Surgical Service',
  'Dermatology',
  'ENT',
  'Physiotherapy',
  'Laboratory Services',
  'Emergency Care',
  'Other'
];

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url?: string;
  is_active?: boolean;
}

export default function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    image_url: '',
    otherCategory: '',
  });

  useEffect(() => {
    fetchServices();

    const channel = supabase
      .channel('services-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, (payload) => {
        console.log('[v0] realtime services event', payload);
        fetchServices();
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

  const fetchServices = async () => {
    setLoading(true);

    try {
      const result = await supabase
        .from("services")
        .select("*")
        .order("name");

      console.log("SUPABASE RESULT:", result);

      if (result.error) {
        alert(
          JSON.stringify(
            {
              message: result.error.message,
              details: result.error.details,
              hint: result.error.hint,
              code: result.error.code,
            },
            null,
            2
          )
        );

        throw result.error;
      }

      setServices(result.data ?? []);
    } catch (err) {
      console.log("RAW ERROR:", err);

      if (err instanceof Error) {
        console.log("MESSAGE:", err.message);
        console.log("STACK:", err.stack);
      }

      console.log("STRINGIFIED:", JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const uploadServiceImage = async (file: File) => {
    setImageUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `service-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(`services/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('gallery')
        .getPublicUrl(`services/${fileName}`);

      if (data) {
        setFormData({ ...formData, image_url: data.publicUrl });
      }
    } catch (error) {
      console.error('[v0] Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate image for new services
      if (!editingId && !formData.image_url) {
        alert('Please upload a service image');
        return;
      }

      const finalCategory = formData.category === 'Other' ? formData.otherCategory : formData.category;

      const payload: any = {
        name: formData.name,
        description: formData.description,
        category: finalCategory,
      };

      if (formData.image_url) {
        payload.image_url = formData.image_url;
      }

      console.log('[v0] Submitting service payload:', payload);

      if (editingId) {
        const res = await fetch('/api/admin/services', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, payload }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result?.error?.message || 'Update failed');
      } else {
        const res = await fetch('/api/admin/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, is_active: true }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result?.error?.message || 'Insert failed');
      }

      setFormData({
        name: '',
        description: '',
        category: '',
        image_url: '',
        otherCategory: '',
      });
      setShowForm(false);
      setEditingId(null);
      fetchServices();
    } catch (error: any) {
      console.error('[v0] Error saving service:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/admin/services?id=${deletingId}`, { method: 'DELETE' })
      const result = await res.json()
      if (!res.ok) {
        console.error('[v0] Server delete error:', result)
        throw new Error(result?.error || 'Delete failed')
      }
      setDeletingId(null)
      fetchServices()
    } catch (error) {
      console.error('[v0] Error deleting service:', error);
    }
  };

  const cancelDelete = () => setDeletingId(null);

  const startEdit = (service: Service) => {
    setFormData({
      name: service.name || '',
      description: service.description || '',
      category: service.category || '',
      image_url: service.image_url || '',
      otherCategory: '',
    });
    setEditingId(service.id);
    setShowForm(true);
  }

  return (
    <div className="space-y-6">
      <Button
        onClick={() => {
          setShowForm(!showForm);
          if (!showForm) {
            setEditingId(null);
            setFormData({
              name: '',
              description: '',
              category: '',
              image_url: '',
              otherCategory: '',
            });
          }
        }}
        className="bg-primary hover:bg-primary/90 gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Service
      </Button>

      {showForm && (
        <form onSubmit={handleAddService} className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-8 space-y-6 max-w-2xl">
          {/* Service Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Service Name *</label>
            <input
              type="text"
              placeholder="e.g., Regular Checkup"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Short Description *</label>
            <textarea
              placeholder="Write a brief description of the service..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-24 resize-none"
              required
            />
          </div>

          {/* Department/Field Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Department/Field *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              required
            >
              <option value="">Select a department...</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Other Category Input */}
          {formData.category === 'Other' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Specify Department *</label>
              <input
                type="text"
                placeholder="e.g., Oncology"
                value={formData.otherCategory}
                onChange={(e) => setFormData({ ...formData, otherCategory: e.target.value })}
                className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
          )}

          {/* Service Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Service Image *</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) await uploadServiceImage(file);
                }}
                className="w-full border-2 border-dashed border-blue-300 rounded-lg px-4 py-6 text-center cursor-pointer hover:border-primary hover:bg-blue-50 transition"
                required={!editingId}
              />
              <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                Click to select an image
              </p>
            </div>
            {imageUploading && <p className="text-sm text-primary font-semibold mt-2">Uploading image...</p>}
            {formData.image_url && <p className="text-sm text-green-600 font-semibold mt-2">✓ Image uploaded</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-blue-100">
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 h-11 font-semibold">
              {editingId ? 'Update Service' : 'Add Service'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="px-6 h-11 font-semibold"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Services Table */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No services yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {service.image_url ? (
                        <img src={service.image_url} alt={service.name} className="w-12 h-12 rounded object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">No img</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium">{service.name}</td>
                    <td className="px-6 py-4">{service.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{service.description}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(service)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(service.id)}
                          className="text-red-600 border-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
          title="Delete Service"
          description="Are you sure you want to delete this service? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}
