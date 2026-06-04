'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Star, MapPin, Phone, Mail, Calendar, Clock, Award, Users, BookOpen } from 'lucide-react';

// Mock doctor data - in production this would come from Supabase
const doctorsData: any = {
  '1': {
    id: 1,
    name: 'Dr. Rajesh Kumar',
    department: 'Internal Medicine',
    specialization: 'Cardiology',
    experience: 18,
    qualification: 'MD, DM Cardiology',
    fee: 1000,
    rating: 4.9,
    reviews: 245,
    description: 'Expert in cardiac care with special interest in interventional cardiology.',
    bio: 'Dr. Rajesh Kumar is a renowned cardiologist with over 18 years of experience in managing cardiac emergencies and complex cardiac procedures. He has successfully performed over 5000 angiographies and 2000 angioplasties with excellent success rates. His areas of expertise include coronary artery disease, arrhythmias, and heart failure management.',
    qualifications: ['MD (Internal Medicine) - AIIMS', 'DM (Cardiology) - Delhi University', 'Fellowship in Interventional Cardiology - USA'],
    certifications: ['FNCS', 'ACLS Certified', 'Fellow of ESC'],
    availability: {
      monday: { start: '10:00 AM', end: '5:00 PM' },
      tuesday: { start: '10:00 AM', end: '5:00 PM' },
      wednesday: { start: '10:00 AM', end: '5:00 PM' },
      thursday: { start: '10:00 AM', end: '5:00 PM' },
      friday: { start: '10:00 AM', end: '5:00 PM' },
      saturday: 'Closed',
      sunday: 'Closed',
    },
    clinicAddress: 'OPD Building, 2nd Floor, Wing A',
    phone: '+91-253-2333333 Ext. 201',
    email: 'rajesh.kumar@teaminspirecare.com',
    image: '👨‍⚕️',
    specialServices: [
      'Cardiac Surgery Consultation',
      'Stress Test & ECG',
      'Echocardiography',
      'Angiography & Angioplasty',
      'Pacemaker Implantation',
      'Follow-up Care',
    ],
    publications: 12,
    awardsAndRecognitions: [
      'Best Cardiologist Award 2022',
      'Outstanding Medical Service 2021',
      'Patient Choice Award 2023',
    ],
    languages: ['English', 'Hindi', 'Kannada'],
    testimonials: [
      {
        patient: 'Mr. Sharma',
        rating: 5,
        text: 'Exceptional care and very patient. Dr. Kumar explained everything in detail. Highly recommended!',
      },
      {
        patient: 'Mrs. Patel',
        rating: 5,
        text: 'Best cardiologist I have met. Very professional and caring. Thank you for saving my life.',
      },
      {
        patient: 'Mr. Gupta',
        rating: 4.5,
        text: 'Great doctor, very knowledgeable. A bit busy but always gives time to patients.',
      },
    ],
  },
  '2': {
    id: 2,
    name: 'Dr. Priya Sharma',
    department: 'Gynecology',
    specialization: 'Obstetrics & Gynecology',
    experience: 16,
    qualification: 'MD, DGO',
    fee: 900,
    rating: 4.8,
    reviews: 312,
    description: 'Specialized in high-risk pregnancies and minimally invasive gynecological procedures.',
    bio: 'Dr. Priya Sharma is a highly experienced obstetrician and gynecologist with 16 years of expertise in managing complex pregnancies and gynecological conditions. She has delivered over 3000 babies with zero maternal mortality rate.',
    qualifications: ['MD (Obstetrics & Gynecology)', 'DGO', 'Fellowship in Maternal-Fetal Medicine'],
    certifications: ['FLS (Fetal Surgery)', 'ACOG Member'],
    availability: {
      monday: { start: '11:00 AM', end: '6:00 PM' },
      wednesday: { start: '11:00 AM', end: '6:00 PM' },
      friday: { start: '11:00 AM', end: '6:00 PM' },
      saturday: { start: '11:00 AM', end: '3:00 PM' },
    },
    clinicAddress: 'Maternity Ward, Wing B',
    phone: '+91-253-2333333 Ext. 302',
    email: 'priya.sharma@teaminspirecare.com',
    image: '👩‍⚕️',
    specialServices: [
      'Antenatal Care',
      'Safe Delivery Services',
      'Cesarean Section',
      'Minimally Invasive Surgery',
      'Gynecological Procedures',
      'Fertility Consultation',
    ],
    publications: 8,
    awardsAndRecognitions: [
      'Best Obstetrician 2023',
      'Excellence in Maternal Care 2022',
    ],
    languages: ['English', 'Hindi', 'Marathi'],
    testimonials: [
      {
        patient: 'Ms. Verma',
        rating: 5,
        text: 'Dr. Sharma is amazing! She made my pregnancy journey so comfortable and safe.',
      },
      {
        patient: 'Mrs. Singh',
        rating: 5,
        text: 'Very caring and supportive doctor. I felt safe throughout my delivery.',
      },
    ],
  },
};

export default function DoctorProfilePage({ params }: { params: { id: string } }) {
  const doctor = doctorsData[params.id] || doctorsData['1'];
  const [selectedDay, setSelectedDay] = useState('monday');

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
                <div className="text-9xl mb-6 bg-blue-400 rounded-full w-32 h-32 flex items-center justify-center mx-auto md:mx-0">
                  {doctor.image}
                </div>
              </div>

              {/* Info */}
              <div className="md:col-span-2">
                <h1 className="text-4xl font-bold mb-2">{doctor.name}</h1>
                <p className="text-blue-100 text-xl mb-1">{doctor.specialization}</p>
                <p className="text-blue-100 mb-4">{doctor.department}</p>

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
                    <div className="text-2xl font-bold">{doctor.experience}+</div>
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
                <h2 className="text-2xl font-bold mb-4">About Dr. {doctor.name.split(' ')[1]}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{doctor.bio}</p>
              </div>

              {/* Qualifications */}
              <div className="bg-white p-8 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-primary" />
                  Qualifications
                </h2>
                <ul className="space-y-2">
                  {doctor.qualifications.map((qual: string, i: number) => (
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
                  {doctor.specialServices.map((service: string, i: number) => (
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
                  {doctor.testimonials.map((review: any, i: number) => (
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
                  {Object.entries(doctor.availability).map(([day, time]: any) => (
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
                  ))}
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
                  {doctor.languages.map((lang: string, i: number) => (
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
