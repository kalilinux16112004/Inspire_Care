"use client";

import { useEffect, useState, use } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Phone, Mail, Calendar, Clock, Award, BookOpen } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Doctor {
  id: string;
  name: string;
  department?: string;
  specialization?: string;
  experience_years?: number;
  experience?: number;
  qualification?: string;
  consultation_fee?: number;
  fee?: number;
  bio?: string;
  image_url?: string;
  image?: string;
  rating?: number;
  reviews?: number;
  phone?: string;
  email?: string;
  availability?: string;
  specialServices?: string[];
  testimonials?: Array<{ patient: string; rating: number; text: string }>;

}

export default function DoctorProfilePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // params may be a Promise in client components — unwrap with React.use()
  const resolvedParams = use(params as any) as { id: string };
  const docId = resolvedParams?.id;

  const parseAvailability = (availabilityStr?: string) => {
    if (!availabilityStr) return [];
    try {
      const availability = JSON.parse(availabilityStr);
      const availableDays: Array<{ day: string; time: string }> = [];
      Object.entries(availability).forEach(([day, schedule]: any) => {
        if (schedule.enabled && schedule.start && schedule.end) {
          availableDays.push({
            day,
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
    const fetchDoctor = async () => {
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('*')
          .eq('id', docId)
          .single();

        if (error) throw error;

        if (data) {
          setDoctor({
            id: String(data.id),
            name: data.name,
            department: data.department,
            specialization: data.specialization,
            experience_years: data.experience_years,
            experience: data.experience_years || data.experience,
            qualification: data.qualification,
            consultation_fee: data.consultation_fee,
            fee: data.consultation_fee || data.fee,
            bio: data.bio || data.description,
            image_url: data.image_url,
            rating: data.rating || 4.8,
            reviews: data.reviews || 0,
            phone: data.phone || '',
            email: data.email || '',
            availability: data.availability || '',
            specialServices: data.specialServices || data.special_services || [],
            testimonials: data.testimonials || [],
          });
        }
      } catch (error) {
        console.error('[v0] Error fetching doctor profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [docId, supabase]);

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-xl font-semibold">Loading doctor profile...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!doctor) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Doctor not found</h1>
            <p className="mt-4 text-muted-foreground">The requested profile could not be loaded.</p>
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
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Doctors', href: '/doctors' },
            { label: doctor.name },
          ]}
        />

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 items-start">
              {/* Avatar */}
              <div className="text-center md:text-left">
                <div className="text-9xl mb-6 bg-blue-400 rounded-full w-32 h-32 flex items-center justify-center overflow-hidden mx-auto md:mx-0">
                  {doctor.image_url ? (
                    <img
                      src={doctor.image_url}
                      alt={doctor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    doctor.image || '👨‍⚕️'
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="md:col-span-2">
                <h1 className="text-4xl font-bold mb-2">{doctor.name}</h1>
                <p className="text-blue-100 text-xl mb-1">{doctor.specialization || 'Specialist'}</p>
                <p className="text-blue-100 mb-4">{doctor.department || 'General Medicine'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            {/* Left Column - Details */}
            <div className="md:col-span-2 space-y-8">
              {/* About */}
              <div className="bg-white p-8 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4">About Dr. {doctor.name.split(' ')[1] || doctor.name}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{doctor.bio || 'No profile description is available for this doctor yet.'}</p>
              </div>

              {/* Qualifications - Hidden since not stored anymore */}
              {/* Previously displayed qualifications array here */}

              {/* Special Services */}
            </div>

            {/* Right Column - Booking */}
            <div className="space-y-6">
              {/* Availability */}
              {doctor.availability && parseAvailability(doctor.availability).length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Availability Schedule
                  </h3>
                  <div className="space-y-2">
                    {parseAvailability(doctor.availability).map((schedule, idx) => (
                      <div key={idx} className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-b-0">
                        <span className="font-semibold text-gray-700">{schedule.day}</span>
                        <span className="text-primary font-medium">{schedule.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Phone</p>
                      <a href={`tel:${doctor.phone}`} className="text-primary hover:underline text-sm">
                        {doctor.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Email</p>
                      <a href={`mailto:${doctor.email}`} className="text-primary hover:underline text-sm">
                        {doctor.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
