'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Trash2, Image as ImageIcon, Upload } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

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
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null as File | null,
    category: '',
    previewUrl: '',
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
        setUploadMessage({ type: 'error', text: 'Please select a valid image file (JPG, PNG, or WebP)' });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadMessage({ type: 'error', text: 'File size must be less than 5MB' });
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setFormData({ ...formData, file, previewUrl });
      setUploadMessage(null);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadMessage(null);

    if (!formData.title.trim()) {
      setUploadMessage({ type: 'error', text: 'Title is required' });
      return;
    }

    // Only require file when adding new item, not when editing
    if (!editingId && !formData.file) {
      setUploadMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    setUploading(true);
    try {
      if (editingId) {
        // If editing and a new file is provided, send to API with id to replace image
        if (formData.file) {
          const uploadFormData = new FormData();
          uploadFormData.append('file', formData.file);
          uploadFormData.append('title', formData.title);
          uploadFormData.append('description', formData.description);
          uploadFormData.append('category', formData.category);
          uploadFormData.append('id', editingId);

          const response = await fetch('/api/admin/gallery', {
            method: 'POST',
            body: uploadFormData,
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to upload image');
          }
        } else {
          // Update metadata only
          const { error } = await supabase.from('gallery').update({
            title: formData.title,
            description: formData.description || null,
            category: formData.category || null,
          }).eq('id', editingId);
          if (error) throw error;
        }
      } else {
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.file as File);
        uploadFormData.append('title', formData.title);
        uploadFormData.append('description', formData.description);
        uploadFormData.append('category', formData.category);

        const response = await fetch('/api/admin/gallery', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to upload image');
        }
      }

      setUploadMessage({ type: 'success', text: editingId ? 'Gallery item updated successfully!' : 'Gallery item added successfully!' });
      setFormData({
        title: '',
        description: '',
        file: null,
        category: '',
        previewUrl: '',
      });
      setShowForm(false);
      setEditingId(null);
      fetchGallery();
    } catch (error) {
      console.error('[v0] Error adding gallery item:', error);
      setUploadMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to upload image',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      const { error } = await supabase.from('gallery').delete().eq('id', deletingId);
      if (error) throw error;
      setDeletingId(null);
      fetchGallery();
    } catch (error) {
      console.error('[v0] Error deleting gallery item:', error);
    }
  };

  const cancelDelete = () => setDeletingId(null);

  const startEdit = (item: GalleryItem) => {
    setFormData({
      title: item.title || '',
      description: item.description || '',
      file: null,
      category: item.category || '',
      previewUrl: item.image_url || '',
    });
    setEditingId(item.id);
    setShowForm(true);
  }

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
          <h3 className="text-lg font-semibold">{editingId ? 'Edit Gallery Item' : 'Add Gallery Item'}</h3>
          
          {uploadMessage && (
            <div
              className={`p-3 rounded-lg text-sm ${
                uploadMessage.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {uploadMessage.text}
            </div>
          )}

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

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Image File (JPG, PNG, WebP - Max 5MB)
              {editingId && <span className="text-xs text-muted-foreground ml-2">Optional - leave empty to keep current image</span>}
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition">
                <div className="flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {formData.file ? formData.file.name : 'Click to select image'}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                  required={!editingId}
                />
              </label>
              {formData.previewUrl && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                  <img src={formData.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <input
            type="text"
            placeholder="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full border border-border rounded px-3 py-2"
          />

          <div className="flex gap-2">
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editingId ? 'Updating...' : 'Uploading...'}
                </>
              ) : (
                editingId ? 'Update' : 'Add'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData({ title: '', description: '', file: null, category: '', previewUrl: '' });
                setUploadMessage(null);
              }}
            >
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
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(item)}>Edit</Button>
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
              </div>
            ))}
          </div>
        )}
      </div>
      {deletingId && (
        <ConfirmDialog
          open={!!deletingId}
          title="Delete Gallery Item"
          description="Are you sure you want to delete this gallery item? This will remove it from the website."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}
