'use client';

import { Button } from '@/components/ui/button';
import { 
  ArrowRight, CheckCircle, Users, Clock, Award, Heart, 
  Activity, Microscope, Bone, Pill, TrendingUp, Shield
} from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section id="home" className="pt-16 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Trust Indicator */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              <span className="text-sm font-semibold text-slate-700">Trusted Healthcare Provider</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
                Excellence in
                <br />
                <span className="text-primary">Medical Care</span>
              </h1>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-xl font-light">
                Experience comprehensive healthcare delivered by accomplished physicians in a patient-centered environment. From preventive medicine to advanced surgical interventions.
              </p>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-3 gap-6 py-6 border-y border-slate-200">
              <div>
                <p className="text-3xl md:text-4xl font-bold text-primary">50K+</p>
                <p className="text-xs md:text-sm text-slate-600 mt-1">Patients Treated</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-primary">15+</p>
                <p className="text-xs md:text-sm text-slate-600 mt-1">Years Legacy</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-primary">98%</p>
                <p className="text-xs md:text-sm text-slate-600 mt-1">Satisfaction</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/#contact">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white font-semibold h-12 px-8"
                >
                  Book Appointment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/about">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="h-12 px-8 font-semibold border-2 border-slate-300 hover:bg-slate-50"
                >
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Key Credentials */}
            <div className="space-y-2 pt-4">
              {[
                { icon: CheckCircle, text: 'NABH Certified Healthcare Facility' },
                { icon: Shield, text: '24/7 Emergency & Trauma Services' },
                { icon: Users, text: '500+ Board-Certified Specialists' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-700">
                  <item.icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-xs md:text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Professional Specialties */}
          <div className="space-y-8">
            {/* Specialties Header */}
            <div>
              <h3 className="text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-widest mb-4">Medical Departments</h3>
              
              {/* Department Cards - 2x3 Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'General Medicine', icon: Activity },
                  { name: 'Surgical Care', icon: Microscope },
                  { name: 'Orthopedics', icon: Bone },
                  { name: 'Pediatrics', icon: Heart },
                  { name: 'Cardiology', icon: Heart },
                  { name: 'Gynecology', icon: Pill },
                ].map((dept) => (
                  <div
                    key={dept.name}
                    className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-primary/30 rounded-lg p-3 transition-all duration-300 group cursor-pointer hover:shadow-md"
                  >
                    <div className="flex items-start gap-2">
                      <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors flex-shrink-0">
                        <dept.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-xs md:text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors leading-tight">
                        {dept.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Accreditation & Features Card */}
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <div className="flex items-start gap-3 mb-4">
                <Award className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900 mb-0.5 text-sm">Accreditations</h4>
                  <p className="text-xs md:text-sm text-slate-600">Nationally recognized certifications</p>
                </div>
              </div>
              <div className="space-y-2 text-xs md:text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></span>
                  <span>NABH Certified Hospital</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></span>
                  <span>ISO 9001:2015 Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></span>
                  <span>Emergency Services Accredited</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
