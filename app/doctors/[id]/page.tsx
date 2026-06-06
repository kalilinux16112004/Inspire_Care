'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Star, MapPin, Phone, Mail, Calendar, Clock, Award, Users, BookOpen } from 'lucide-react';
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
  availability?: Record<string, any> | string;
  clinicAddress?: string;
  phone?: string;
  email?: string;
  specialServices?: string[];
  qualifications?: string[];
  testimonials?: Array<{ patient: string; rating: number; text: string }>;
  languages?: string[];
}

export default function DoctorProfilePage({ params }: { params: { id: string } }) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('monday');
  const supabase = createClient();

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('*')
          .eq('id', params.id)
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
            availability: data.availability || { monday: '9:00 AM - 5:00 PM' },
            clinicAddress: data.clinicAddress || data.clinic_address || '',
            phone: data.phone || '',
            email: data.email || '',
            specialServices: data.specialServices || data.special_services || [],
            qualifications: data.qualifications || [],
            testimonials: data.testimonials || [],
            languages: data.languages || [],
          });
        }
      } catch (error) {
        console.error('[v0] Error fetching doctor profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [params.id, supabase]);

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

                {/* Rating */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(doctor.rating) ? 'fill-yellow-300 text-yellow-300' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-bold">{doctor.rating}</span>
                  <span className="text-blue-100">({doctor.reviews} reviews)</span>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-400/30 p-3 rounded">
                    <div className="font-semibold text-sm">Experience</div>
                    <div className="text-2xl font-bold">{doctor.experience || doctor.experience_years || 0}+</div>
                    <div className="text-xs text-blue-100">Years</div>
                  </div>
                  <div className="bg-blue-400/30 p-3 rounded">
                    <div className="font-semibold text-sm">Consultation</div>
                    <div className="text-2xl font-bold">₹{doctor.fee}</div>
                    <div className="text-xs text-blue-100">per visit</div>
                  </div>
                  <div className="bg-blue-400/30 p-3 rounded">
                    <div className="font-semibold text-sm">Patients</div>
                    <div className="text-2xl font-bold">1000+</div>
                    <div className="text-xs text-blue-100">Treated</div>
                  </div>
                </div>
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

              {/* Qualifications */}
              <div className="bg-white p-8 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-primary" />
                  Qualifications
                </h2>
                <ul className="space-y-2">
                  {(doctor.qualifications || []).map((qual: string, i: number) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span>{qual}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Special Services */}
              <div className="bg-white p-8 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-primary" />
                  Special Services
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {(doctor.specialServices || []).map((service: string, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-secondary rounded-full"></span>
                      <span className="text-sm">{service}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testimonials */}
              <div className="bg-white p-8 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  Patient Reviews
                </h2>
                <div className="space-y-4">
                  {(doctor.testimonials || []).map((review: any, i: number) => (
                    <div key={i} className="border-l-4 border-primary p-4 bg-gray-50 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{review.patient}</span>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, j) => (
                            <Star
                              key={j}
                              className={`w-4 h-4 ${j < Math.floor(review.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground italic">&quot;{review.text}&quot;</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Booking */}
            <div className="space-y-6">
              {/* Availability */}
              <div className="bg-white p-6 rounded-lg shadow-lg sticky top-20">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Availability
                </h3>

                <div className="space-y-2 mb-6">
                  {typeof doctor.availability === 'object' ? (
                    Object.entries(doctor.availability).map(([day, time]: any) => (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`w-full text-left p-3 rounded capitalize transition-all ${
                          selectedDay === day
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <span className="font-semibold">{day}</span>
                        {typeof time === 'string' ? (
                          <p className="text-xs">{time}</p>
                        ) : (
                          <p className="text-xs">{time.start} - {time.end}</p>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="p-3 rounded bg-gray-100 text-sm">
                      {doctor.availability}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openBooking', { detail: { doctorId: String(doctor.id) } }))}
                  className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors block text-center"
                >
                  Book Appointment
                </button>
              </div>

              {/* Contact Info */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Clinic Location</p>
                      <p className="text-muted-foreground text-sm">{doctor.clinicAddress}</p>
                    </div>
                  </div>
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

              {/* Languages */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4">Languages</h3>
                <div className="space-y-2">
                  {(doctor.languages || []).map((lang: string, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span>{lang}</span>
                    </div>
                  ))}
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
