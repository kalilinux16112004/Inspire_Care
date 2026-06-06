'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, MapPin, Briefcase, Star, ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience_years: number;
  qualification: string;
  image_url: string;
  consultation_fee: number;
  bio: string;
}

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        setDoctors(data || []);
      } catch (error) {
        console.error('[v0] Error fetching doctors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <section id="doctors" className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 text-balance">
            Our Medical Team
          </h2>
          <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Board-certified specialists with extensive experience, committed to delivering exceptional healthcare outcomes.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No doctors available at the moment</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white rounded-lg overflow-hidden border border-slate-200 hover:border-primary/30 hover:shadow-md transition-all duration-300 group"
                >
                  {/* Doctor Image / Avatar */}
                  {doctor.image_url ? (
                    <div className="h-40 bg-slate-200 flex items-center justify-center overflow-hidden">
                      <img
                        src={doctor.image_url}
                        alt={doctor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-40 bg-slate-300 flex items-center justify-center">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-2xl text-white font-bold">
                          {doctor.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Doctor Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {doctor.name}
                      </h3>
                      {doctor.specialization && (
                        <p className="text-primary font-semibold text-xs mt-0.5">
                          {doctor.specialization}
                        </p>
                      )}
                    </div>

                    {/* Experience and Qualification */}
                    {doctor.experience_years && (
                      <p className="text-xs text-slate-600 font-medium">
                        {doctor.experience_years}+ years experience
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="mt-10 text-center">
              <Link href="/doctors">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold h-12 px-8">
                  View All Specialists
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
