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
  availability?: string;
}

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const parseAvailability = (availabilityStr?: string) => {
    if (!availabilityStr) return [];
    try {
      const availability = JSON.parse(availabilityStr);
      const availableDays: Array<{ day: string; time: string }> = [];
      Object.entries(availability).forEach(([day, schedule]: any) => {
        if (schedule.enabled && schedule.start && schedule.end) {
          availableDays.push({
            day: day.substring(0, 3),
            time: `${schedule.start} - ${schedule.end}`,
          });
        }
      });
      return availableDays;
    } catch (e) {
      return [];
    }
  };

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
    <section id="doctors" className="py-16 bg-slate-50 dark:bg-slate-950/60 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white text-balance">
            Our Medical Team
          </h2>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Board-certified specialists with extensive experience, committed to delivering exceptional healthcare outcomes.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary dark:text-blue-400" />
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No doctors available at the moment</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-primary/30 dark:hover:border-blue-500/30 hover:shadow-md transition-all duration-300 group cursor-pointer active:scale-[0.99] flex flex-col justify-between"
                >
                  <div>
                    {/* Doctor Image / Avatar */}
                    {doctor.image_url ? (
                      <div className="h-44 bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                        <img
                          src={doctor.image_url}
                          alt={doctor.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-44 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <div className="w-16 h-16 bg-primary/10 dark:bg-blue-400/10 rounded-full flex items-center justify-center">
                          <span className="text-2xl text-primary dark:text-blue-400 font-bold">
                            {doctor.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Doctor Info */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                          {doctor.name}
                        </h3>
                        {doctor.specialization && (
                          <p className="text-primary dark:text-blue-400 font-semibold text-xs mt-1">
                            {doctor.specialization}
                          </p>
                        )}
                      </div>

                      {/* Experience and Qualification */}
                      {doctor.experience_years && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                          {doctor.experience_years}+ years experience
                        </p>
                      )}

                      {/* Availability Schedule */}
                      {doctor.availability && parseAvailability(doctor.availability).length > 0 && (
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Weekly Schedule:</p>
                          <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                            {parseAvailability(doctor.availability).map((schedule, idx) => (
                              <div key={idx} className="text-xs text-slate-600 dark:text-slate-455 flex justify-between gap-2">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{schedule.day}:</span>
                                <span className="text-right text-slate-600 dark:text-slate-400">{schedule.time}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="mt-10 text-center">
              <Link href="/doctors">
                <Button size="lg" className="bg-primary hover:bg-primary/95 text-white dark:bg-blue-600 dark:hover:bg-blue-700 font-semibold h-12 px-8 active:scale-95 transition-all cursor-pointer shadow-sm">
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
