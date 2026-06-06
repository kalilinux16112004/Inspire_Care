'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  is_active: boolean;
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImageIdx, setSelectedImageIdx] = useState<number | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setItems(data || []);
      } catch (error) {
        console.error('[v0] Error fetching gallery:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  // Get unique categories from items
  const categories = ['all', ...new Set(items.map(item => item.category).filter(Boolean))];
  
  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.category === selectedCategory);

  const handlePrevImage = () => {
    if (selectedImageIdx !== null) {
      setSelectedImageIdx(selectedImageIdx === 0 ? filteredItems.length - 1 : selectedImageIdx - 1);
    }
  };

  const handleNextImage = () => {
    if (selectedImageIdx !== null) {
      setSelectedImageIdx(selectedImageIdx === filteredItems.length - 1 ? 0 : selectedImageIdx + 1);
    }
  };

  return (
    <>
      <Navigation />
      <main>
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Gallery' }]} />

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-50 to-green-50 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">Our Facilities & Events</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore our state-of-the-art hospital facilities and memorable moments from our healthcare journey.
            </p>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-b">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Filter by Category</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedImageIdx(null);
                  }}
                  className={`px-4 py-2 rounded-full font-semibold transition-all capitalize ${
                    selectedCategory === cat
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-foreground hover:bg-gray-200'
                  }`}
                >
                  {cat === 'all' ? 'All Images' : cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No gallery images available</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredItems.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedImageIdx(idx)}
                    className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    {/* Image */}
                    <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white relative overflow-hidden">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-4xl opacity-50">📷</div>
                      )}
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity flex items-center justify-center">
                        <span className="text-white text-2xl">+</span>
                      </div>
                    </div>
                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      <span className="inline-block text-xs bg-primary/10 text-primary px-2 py-1 rounded mt-2 capitalize">
                        {item.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Lightbox Modal */}
        {selectedImageIdx !== null && filteredItems.length > 0 && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-black rounded-lg max-w-4xl w-full">
              {/* Close Button */}
              <button
                onClick={() => setSelectedImageIdx(null)}
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Image */}
              <div className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white relative overflow-hidden">
                {filteredItems[selectedImageIdx]?.image_url ? (
                  <img
                    src={filteredItems[selectedImageIdx].image_url}
                    alt={filteredItems[selectedImageIdx].title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-9xl opacity-50">📷</div>
                )}

                {/* Navigation Buttons */}
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>

                {/* Image Counter */}
                <div className="absolute top-4 left-4 text-white bg-black/50 px-3 py-1 rounded text-sm">
                  {selectedImageIdx + 1} / {filteredItems.length}
                </div>
              </div>

              {/* Details */}
              <div className="bg-white p-6">
                <h3 className="text-2xl font-bold mb-2">{filteredItems[selectedImageIdx]?.title}</h3>
                <p className="text-muted-foreground mb-4">{filteredItems[selectedImageIdx]?.description}</p>
                <span className="inline-block text-sm bg-primary/10 text-primary px-3 py-1 rounded capitalize">
                  {filteredItems[selectedImageIdx]?.category}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Hospital Highlights</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { label: 'Total Beds', value: '250+' },
                { label: 'Operating Theaters', value: '8' },
                { label: 'ICU Beds', value: '30' },
                { label: 'Ambulances', value: '12' },
              ].map((stat, idx) => (
                <div key={idx} className="text-center p-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border border-blue-200">
                  <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-muted-foreground font-semibold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
