'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Star, MapPin, Phone, Mail } from 'lucide-react';

export default function DoctorsPage() {
  const [selectedDept, setSelectedDept] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const doctors = [
    {
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
      availability: 'Mon, Tue, Wed, Thu, Fri',
      timing: '10:00 AM - 5:00 PM',
      image: '👨‍⚕️',
    },
    {
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
      availability: 'Mon, Wed, Fri, Sat',
      timing: '11:00 AM - 6:00 PM',
      image: '👩‍⚕️',
    },
    {
      id: 3,
      name: 'Dr. Amit Patel',
      department: 'Orthopedics',
      specialization: 'Joint Replacement',
      experience: 14,
      qualification: 'MS, MNAMS',
      fee: 800,
      rating: 4.7,
      reviews: 198,
      description: 'Expert in hip and knee replacement surgeries with excellent post-operative outcomes.',
      availability: 'Tue, Thu, Sat, Sun',
      timing: '2:00 PM - 8:00 PM',
      image: '👨‍⚕️',
    },
    {
      id: 4,
      name: 'Dr. Neha Singh',
      department: 'Pediatrics',
      specialization: 'Neonatal Care',
      experience: 12,
      qualification: 'MD, DNB Pediatrics',
      fee: 700,
      rating: 4.9,
      reviews: 276,
      description: 'Compassionate care for newborns and children with expertise in neonatal emergencies.',
      availability: 'Mon, Tue, Wed, Thu, Sat',
      timing: '9:00 AM - 4:00 PM',
      image: '👩‍⚕️',
    },
    {
      id: 5,
      name: 'Dr. Vikram Gupta',
      department: 'Surgery',
      specialization: 'Surgical Oncology',
      experience: 20,
      qualification: 'MCh, MNAMS',
      fee: 1200,
      rating: 4.8,
      reviews: 189,
      description: 'Pioneer in minimally invasive cancer surgery with international training.',
      availability: 'Mon, Wed, Fri',
      timing: '10:00 AM - 3:00 PM',
      image: '👨‍⚕️',
    },
    {
      id: 6,
      name: 'Dr. Anjali Verma',
      department: 'Respiratory Medicine',
      specialization: 'Pulmonology',
      experience: 13,
      qualification: 'MD, DM Pulmonology',
      fee: 900,
      rating: 4.7,
      reviews: 167,
      description: 'Expert in asthma, COPD, and sleep disorders management.',
      availability: 'Tue, Thu, Fri, Sat',
      timing: '3:00 PM - 8:00 PM',
      image: '👩‍⚕️',
    },
  ];

  const departments = ['all', ...new Set(doctors.map(d => d.department))];

  const filtered = doctors.filter(doctor => {
    const matchDept = selectedDept === 'all' || doctor.department === selectedDept;
    const matchSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    return matchDept && matchSearch;
  });

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
                  <Link key={doctor.id} href={`/doctors/${doctor.id}`}>
                    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer h-full overflow-hidden group">
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
                            <p className="text-muted-foreground">{doctor.qualification}</p>
                          </div>
                          <div className="text-sm">
                            <p className="font-semibold text-gray-700">Availability</p>
                            <p className="text-muted-foreground text-xs">{doctor.availability}</p>
                            <p className="text-muted-foreground text-xs">{doctor.timing}</p>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">₹{doctor.fee}</span>
                          <button className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                            Book Now →
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
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
