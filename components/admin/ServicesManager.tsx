'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import ConfirmDialog from './ConfirmDialog';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
}

export default function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const supabase = createClient();

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    category: string;
    price: number | string;
    duration_minutes: number | string;
  }>({
    name: '',
    description: '',
    category: '',
    price: 0,
    duration_minutes: 30,
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
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('[v0] Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: formData.price === '' || formData.price == null ? null : Number(formData.price),
        duration_minutes:
          formData.duration_minutes === '' || formData.duration_minutes == null
            ? null
            : Number(formData.duration_minutes),
        is_active: true,
      };

      if (editingId) {
        const res = await fetch('/api/admin/services', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, payload }),
        })

        const result = await res.json()
        if (!res.ok) {
          console.error('[v0] Server update error:', result)
          throw new Error(result?.error?.message || result?.error || 'Update failed')
        }
      } else {
        const res = await fetch('/api/admin/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const result = await res.json();
        if (!res.ok) {
          console.error('[v0] Server insert error:', result);
          throw new Error(result?.error?.message || result?.error || 'Insert failed');
        }
      }

      setFormData({
        name: '',
        description: '',
        category: '',
        price: 0,
        duration_minutes: 30,
      });
      setShowForm(false);
      setEditingId(null);
      fetchServices();
    } catch (error: any) {
      console.error('[v0] Error adding service:', error?.message ?? error, { error });
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
      price: service.price || 0,
      duration_minutes: service.duration_minutes || 30,
    });
    setEditingId(service.id);
    setShowForm(true);
  }

  return (
    <div className="space-y-6">
      <Button
        onClick={() => setShowForm(!showForm)}
        className="bg-primary hover:bg-primary/90 gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Service
      </Button>

      {showForm && (
        <form onSubmit={handleAddService} className="bg-white border border-border rounded-lg p-6 space-y-4">
          <input
            type="text"
            placeholder="Service Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border border-border rounded px-3 py-2"
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border border-border rounded px-3 py-2 min-h-20"
          />
          <input
            type="text"
            placeholder="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full border border-border rounded px-3 py-2"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Price"
              value={formData.price === '' || Number.isNaN(Number(formData.price)) ? '' : formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value === '' ? '' : parseFloat(e.target.value) })}
              className="w-full border border-border rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="Duration (minutes)"
              value={formData.duration_minutes === '' || Number.isNaN(Number(formData.duration_minutes)) ? '' : formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value === '' ? '' : parseInt(e.target.value) })}
              className="w-full border border-border rounded px-3 py-2"
            />
          </div>
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
        ) : services.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No services yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{service.name}</td>
                    <td className="px-6 py-4">{service.category}</td>
                    <td className="px-6 py-4">₹{service.price}</td>
                    <td className="px-6 py-4">{service.duration_minutes} min</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(service)}>
                          Edit
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
