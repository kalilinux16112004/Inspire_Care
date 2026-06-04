'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Users, Award, Stethoscope } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function AboutPage() {
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateStats(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { icon: Users, label: 'Patients Treated', value: '50,000+', color: 'text-blue-600' },
    { icon: Award, label: 'Years of Excellence', value: '15+', color: 'text-green-600' },
    { icon: Stethoscope, label: 'Expert Doctors', value: '150+', color: 'text-pink-600' },
    { icon: Heart, label: 'Departments', value: '8', color: 'text-amber-600' },
  ];

  const values = [
    {
      title: 'Compassionate Care',
      description: 'We treat every patient with empathy and respect, understanding that healthcare is personal.',
      icon: Heart,
    },
    {
      title: 'Excellence',
      description: 'Committed to the highest standards of medical practice and continuous improvement.',
      icon: Award,
    },
    {
      title: 'Innovation',
      description: 'Adopting latest medical technologies and practices for better patient outcomes.',
      icon: Stethoscope,
    },
    {
      title: 'Accessibility',
      description: 'Making quality healthcare accessible to everyone in our community.',
      icon: Users,
    },
  ];

  return (
    <>
      <Navigation />
      <main>
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About Us' }]} />

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 text-balance">
              Caring with Compassion Since 2009
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              Team Inspire Care Multispeciality Hospital has been serving our community with dedication, 
              expertise, and compassion. We are committed to providing world-class healthcare to every patient.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    className={`text-center p-6 rounded-lg bg-gray-50 border border-gray-200 transition-all duration-500 ${
                      animateStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                  >
                    <Icon className={`${stat.color} w-12 h-12 mx-auto mb-4`} />
                    <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                    <div className="text-muted-foreground font-medium">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  To provide compassionate, comprehensive, and cutting-edge healthcare services that improve 
                  the health and well-being of our patients and community. We strive to be the most trusted 
                  and preferred healthcare provider in our region.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We believe that quality healthcare should be accessible to everyone, regardless of their 
                  socioeconomic background. Every patient deserves respect, dignity, and the best possible care.
                </p>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  To be a beacon of healthcare excellence, setting new standards in medical practice, patient 
                  care, and community health. We envision a healthier, happier community where everyone has access 
                  to quality healthcare.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Through continuous innovation, education, and collaboration with our healthcare partners, 
                  we aim to transform lives and create a lasting positive impact on public health.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, idx) => {
                const Icon = value.icon;
                return (
                  <div key={idx} className="p-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-4">
                      <Icon className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                        <p className="text-muted-foreground">{value.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Leadership Team */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Our Leadership</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: 'Dr. Rajesh Kumar', role: 'Chief Medical Officer', dept: 'Internal Medicine' },
                { name: 'Dr. Priya Sharma', role: 'Chief of Surgery', dept: 'Surgical Oncology' },
                { name: 'Dr. Amit Patel', role: 'Director of Operations', dept: 'Hospital Management' },
              ].map((leader, idx) => (
                <div key={idx} className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4"></div>
                  <h3 className="text-xl font-bold mb-1">{leader.name}</h3>
                  <p className="text-primary font-semibold mb-1">{leader.role}</p>
                  <p className="text-muted-foreground text-sm">{leader.dept}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Experience Excellence in Healthcare?</h2>
            <p className="text-blue-100 mb-8 text-lg">
              Schedule your appointment today and join thousands of satisfied patients.
            </p>
            <Link
              href="/"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('appointment-booking');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Book an Appointment
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
