'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Users, Award, Stethoscope, Lightbulb, Eye } from 'lucide-react';
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
      title: 'Teamwork',
      description: 'Collaboration across all departments and disciplines to deliver comprehensive patient care and achieve excellence together.',
      icon: Users,
    },
    {
      title: 'Patient Centered Approach',
      description: 'Placing patient needs, comfort, and well-being at the center of everything we do, ensuring personalized and compassionate care.',
      icon: Heart,
    },
    {
      title: 'Trust',
      description: 'Building and maintaining trust through integrity, reliability, and honest communication with our patients and community.',
      icon: Award,
    },
    {
      title: 'Research and Innovation',
      description: 'Continuously advancing medical knowledge and adopting cutting-edge technologies to improve treatment outcomes.',
      icon: Lightbulb,
    },
    {
      title: 'Transparency',
      description: 'Open communication about procedures, costs, and healthcare decisions, empowering patients to make informed choices.',
      icon: Eye,
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
              Caring with Compassion 
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

      </main>
      <Footer />
    </>
  );
}
