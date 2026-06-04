'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Trash2, Image as ImageIcon } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  is_active: boolean;
}

export default function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    category: '',
  });

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('[v0] Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('gallery').insert({
        ...formData,
        is_active: true,
      });

      if (error) throw error;

      setFormData({
        title: '',
        description: '',
        image_url: '',
        category: '',
      });
      setShowForm(false);
      fetchGallery();
    } catch (error) {
      console.error('[v0] Error adding gallery item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    try {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) throw error;
      fetchGallery();
    } catch (error) {
      console.error('[v0] Error deleting gallery item:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Button
        onClick={() => setShowForm(!showForm)}
        className="bg-primary hover:bg-primary/90 gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Gallery Item
      </Button>

      {showForm && (
        <form onSubmit={handleAddItem} className="bg-white border border-border rounded-lg p-6 space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            type="url"
            placeholder="Image URL"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className="w-full border border-border rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No gallery items yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {items.map((item) => (
              <div key={item.id} className="border border-border rounded-lg overflow-hidden">
                <div className="relative h-48 bg-gray-200">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <ImageIcon className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-foreground line-clamp-1">{item.title}</h3>
                  {item.category && (
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(item.id)}
                    className="w-full text-red-600 border-red-200"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
