'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, ArrowRight, Shield, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url?: string;
  is_active?: boolean;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error('[v0] Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <section id="services" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 text-balance">
            Comprehensive Medical Services
          </h2>
          <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            From preventive care to advanced treatments, our complete range of services delivers exceptional outcomes with cutting-edge medical technology.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No services available at the moment</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden hover:border-primary/30 hover:shadow-md transition-all duration-300 group"
                >
                  {/* Image */}
                  {service.image_url ? (
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <Shield className="w-12 h-12 text-white opacity-40" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {service.name}
                    </h3>
                    
                    {service.category && (
                      <span className="inline-block px-2 py-0.5 bg-slate-200 text-slate-700 text-xs font-medium rounded mb-2">
                        {service.category}
                      </span>
                    )}
                    
                    {service.description && (
                      <p className="text-slate-600 text-xs md:text-sm mb-3 leading-relaxed line-clamp-3">
                        {service.description}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="pt-3 border-t border-slate-200 flex justify-end">
                      <Link href="/services" className="text-primary hover:text-primary/80 font-semibold text-sm flex items-center gap-1">
                        Learn More →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="mt-10 text-center">
              <Link href="/services">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold h-12 px-8">
                  View All Services
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
