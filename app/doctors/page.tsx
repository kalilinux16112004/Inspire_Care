'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Doctor {
  id: string;
  name: string;
  department?: string;
  specialization?: string;
  experience_years?: number;
  experience?: number;
  consultation_fee?: number;
  fee?: number;
  rating?: number;
  reviews?: number;
  bio?: string;
  image_url?: string;
  image?: string;
  description?: string;
  qualification?: string;
  availability?: string;
  timing?: string;
}

export default function DoctorsPage() {
  const [selectedDept, setSelectedDept] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
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
          .order('name');

        if (error) throw error;

        const mappedDoctors = (data || []).map((doctor: any) => ({
          id: String(doctor.id),
          name: doctor.name,
          department: doctor.department || doctor.specialization || 'General',
          specialization: doctor.specialization || doctor.department || 'General Practice',
          experience: doctor.experience_years || doctor.experience || 0,
          consultation_fee: doctor.consultation_fee || doctor.fee || 0,
          fee: doctor.consultation_fee || doctor.fee || 0,
          rating: doctor.rating || 4.8,
          reviews: doctor.reviews || 0,
          bio: doctor.bio || doctor.description || '',
          image_url: doctor.image_url || undefined,
          image: doctor.image_url ? undefined : '👨‍⚕️',
          description: doctor.description || doctor.bio || 'Experienced specialist committed to exceptional care.',
          qualification: doctor.qualification || '',
          availability: typeof doctor.availability === 'string' ? doctor.availability : 'Mon-Fri 9:00 AM - 5:00 PM',
          timing: doctor.timing || '',
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

  const departments = ['all', ...new Set(doctors.map(d => d.department || d.specialization || 'General'))];

  const filtered = doctors.filter((doctor) => {
    const dept = doctor.department || doctor.specialization || '';
    const matchDept = selectedDept === 'all' || dept === selectedDept;
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map(doctor => (
                  <div key={doctor.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer h-full overflow-hidden group">
                      {/* Avatar */}
                      <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-8 text-center text-6xl">
                        {doctor.image}
                      </div>
                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-2xl font-bold text-foreground mb-1">{doctor.name}</h3>
                        <p className="text-primary font-semibold mb-2">{doctor.specialization}</p>
                        <p className="text-sm text-muted-foreground mb-4">{doctor.department}</p>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(doctor.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold">{doctor.rating}</span>
                          <span className="text-xs text-muted-foreground">({doctor.reviews})</span>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4">{doctor.description}</p>

                        {/* Details */}
                        <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                          <div className="text-sm">
                            <p className="font-semibold text-gray-700">Experience</p>
                            <p className="text-muted-foreground">{doctor.experience} years</p>
                          </div>
                          <div className="text-sm">
                            <p className="font-semibold text-gray-700">Qualification</p>
                            <p className="text-muted-foreground">{doctor.qualification || 'N/A'}</p>
                          </div>
                          <div className="text-sm">
                            <p className="font-semibold text-gray-700">Availability</p>
                            <p className="text-muted-foreground text-xs">{doctor.availability}</p>
                            {doctor.timing && (
                              <p className="text-muted-foreground text-xs">{doctor.timing}</p>
                            )}
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">₹{doctor.fee}</span>
                          <Link
                            href={`/doctors/${doctor.id}`}
                            className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
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
