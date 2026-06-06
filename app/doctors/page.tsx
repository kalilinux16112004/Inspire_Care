'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { createClient } from '@/lib/supabase/client';

interface Doctor {
  id: string;
  name: string;
  specialization?: string;
  qualification?: string;
  experience_years?: number;
  bio?: string;
  image_url?: string;
  availability?: string;
  is_active?: boolean;
}

export default function DoctorsPage() {
  const [selectedDept, setSelectedDept] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const parseAvailability = (availabilityStr?: string) => {
    if (!availabilityStr) return [];
    try {
      const availability = JSON.parse(availabilityStr);
      const availableDays: Array<{ day: string; fullDay: string; time: string }> = [];
      Object.entries(availability).forEach(([day, schedule]: any) => {
        if (schedule.enabled && schedule.start && schedule.end) {
          availableDays.push({
            day: day.substring(0, 3),
            fullDay: day,
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
          .order('name');

        if (error) throw error;

        const mappedDoctors = (data || []).map((doctor: any) => ({
          id: String(doctor.id),
          name: doctor.name,
          specialization: doctor.specialization || '',
          qualification: doctor.qualification || '',
          experience_years: doctor.experience_years || 0,
          bio: doctor.bio || '',
          image_url: doctor.image_url || undefined,
          availability: doctor.availability || '',
          is_active: doctor.is_active,
        }));

        setDoctors(mappedDoctors);
      } catch (error) {
        console.error('[v0] Error fetching doctors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [supabase]);

  const departments = ['all', ...new Set(doctors.map(d => d.specialization || 'General'))];

  const filtered = doctors.filter((doctor) => {
    const matchDept = selectedDept === 'all' || doctor.specialization === selectedDept;
    const matchSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doctor.specialization || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchDept && matchSearch;
  });

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-xl font-semibold">Loading doctors...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main>
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Our Doctors' }]} />

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">Meet Our Expert Doctors</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experienced and compassionate healthcare professionals dedicated to your wellness.
            </p>
          </div>
        </section>

        {/* Search and Filter */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-b">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search doctors by name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              {departments.map(dept => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-4 py-2 rounded-full font-semibold transition-all ${
                    selectedDept === dept
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-foreground hover:bg-gray-200'
                  }`}
                >
                  {dept === 'all' ? 'All Departments' : dept}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Doctors Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            {filtered.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(doctor => (
                  <div key={doctor.id} className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden hover:border-primary/30 hover:shadow-md transition-all duration-300 group">
                    {/* Doctor Image */}
                    {doctor.image_url ? (
                      <img
                        src={doctor.image_url}
                        alt={doctor.name}
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <span className="text-6xl">👨‍⚕️</span>
                      </div>
                    )}

                    {/* Doctor Info */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        {doctor.name}
                      </h3>

                      {doctor.specialization && (
                        <p className="text-primary font-semibold text-xs mb-2">
                          {doctor.specialization}
                        </p>
                      )}

                      {doctor.qualification && (
                        <span className="inline-block px-2 py-0.5 bg-slate-200 text-slate-700 text-xs font-medium rounded mb-2">
                          {doctor.qualification}
                        </span>
                      )}

                      {doctor.experience_years && (
                        <p className="text-xs text-slate-600 font-medium mb-3">
                          {doctor.experience_years}+ years experience
                        </p>
                      )}

                      {doctor.bio && (
                        <p className="text-slate-600 text-xs md:text-sm mb-3 leading-relaxed line-clamp-2">
                          {doctor.bio}
                        </p>
                      )}

                      {/* Availability Schedule */}
                      {doctor.availability && parseAvailability(doctor.availability).length > 0 && (
                        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs font-semibold text-slate-700 mb-2">Available Days:</p>
                          <div className="space-y-1 max-h-20 overflow-y-auto">
                            {parseAvailability(doctor.availability).map((schedule, idx) => (
                              <div key={idx} className="text-xs text-slate-600 flex justify-between gap-2">
                                <span className="font-medium min-w-fit">{schedule.fullDay}:</span>
                                <span className="text-right">{schedule.time}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Footer Link */}
                      <div className="pt-3 border-t border-slate-200 flex justify-end">
                        <Link
                          href={`/doctors/${doctor.id}`}
                          className="text-primary hover:text-primary/80 font-semibold text-sm flex items-center gap-1"
                        >
                          read more →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No doctors found matching your search.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
