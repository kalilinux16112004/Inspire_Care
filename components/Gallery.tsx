'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, X, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  video_url: string;
  category: string;
  display_order: number;
}

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(3);

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

  const selected = items.find((item) => item.id === selectedId);

  return (
    <section className="py-20 bg-gray-50 dark:bg-slate-950/40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Hospital Gallery
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our state-of-the-art facilities and services
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary dark:text-blue-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Gallery coming soon</p>
          </div>
        ) : (
          <>
            {/* Gallery Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className="relative group cursor-pointer overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm active:scale-[0.99] transition-all duration-300"
                >
                  <div className="relative h-64 bg-gray-200 dark:bg-slate-800">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center px-4 transform translate-y-2 group-hover:translate-y-0">
                      <p className="text-white font-bold text-lg">{item.title}</p>
                      {item.category && (
                        <span className="inline-block mt-2 px-2 py-0.5 text-[10px] uppercase tracking-wider bg-white/20 text-white rounded font-semibold backdrop-blur-xs">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="mt-12 text-center">
              <Link href="/gallery">
                <Button size="lg" className="bg-primary hover:bg-primary/95 text-white dark:bg-blue-600 dark:hover:bg-blue-700 font-semibold h-12 px-8 active:scale-95 transition-all cursor-pointer shadow-sm">
                  View All Gallery
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Lightbox Modal */}
            {selected && (
              <div
                className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
                onClick={() => setSelectedId(null)}
              >
                <div
                  className="relative bg-white dark:bg-slate-900 rounded-xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close Button (Expanded Touch Target >= 44x44px) */}
                  <button
                    onClick={() => setSelectedId(null)}
                    className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/85 text-white rounded-full p-2.5 transition-colors w-11 h-11 flex items-center justify-center active:scale-90 cursor-pointer"
                    aria-label="Close Lightbox"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  {/* Content */}
                  <div className="flex flex-col flex-1 overflow-auto">
                    {/* Image */}
                    {selected.image_url && (
                      <div className="relative w-full h-96">
                        <img
                          src={selected.image_url}
                          alt={selected.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Text Content */}
                    <div className="p-6 space-y-3">
                      <h3 className="text-2xl font-bold text-foreground">
                        {selected.title}
                      </h3>
                      {selected.category && (
                        <p className="inline-block px-3 py-1 bg-primary/10 dark:bg-blue-400/10 text-primary dark:text-blue-400 text-xs font-semibold rounded-full capitalize">
                          {selected.category}
                        </p>
                      )}
                      {selected.description && (
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {selected.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
