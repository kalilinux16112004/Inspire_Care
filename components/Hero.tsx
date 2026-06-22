'use client';

import { Button } from '@/components/ui/button';
import { 
  ArrowRight, CheckCircle, Users, Clock, Award, Heart, 
  Activity, Microscope, Bone, Pill, TrendingUp, Shield
} from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section id="home" className="pt-16 pb-20 bg-gradient-to-br from-blue-50/30 via-white to-green-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Trust Indicator */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800/80 rounded-full w-fit">
              <span className="w-2 h-2 bg-primary dark:bg-blue-400 rounded-full"></span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Trusted Healthcare Provider</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
                Excellence in
                <br />
                <span className="text-primary dark:text-blue-400">Medical Care</span>
              </h1>
              <p className="text-base md:text-lg text-slate-600 dark:text-slate-350 leading-relaxed max-w-xl font-light">
                Experience comprehensive healthcare delivered by accomplished physicians in a patient-centered environment. From preventive medicine to advanced surgical interventions.
              </p>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-3 gap-6 py-6 border-y border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-3xl md:text-4xl font-bold text-primary dark:text-blue-400">50K+</p>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">Patients Treated</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-primary dark:text-blue-400">15+</p>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">Years Legacy</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-primary dark:text-blue-400">98%</p>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">Satisfaction</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/95 text-white dark:bg-blue-600 dark:hover:bg-blue-700 font-semibold h-12 px-8 active:scale-95 transition-all cursor-pointer shadow-sm hover:shadow-md"
                onClick={() => window.dispatchEvent(new CustomEvent('openBooking'))}
              >
                Book Appointment
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Link href="/about">
                <Button 
                  size="lg" 
                  variant={null as any}
                  className="h-12 px-8 font-semibold border-2 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 active:scale-95 transition-all cursor-pointer bg-transparent"
                >
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Key Credentials */}
            <div className="space-y-2.5 pt-4">
              {[
                { icon: CheckCircle, text: 'NABH Certified Healthcare Facility' },
                { icon: Shield, text: '24/7 Emergency & Trauma Services' },
                { icon: Users, text: '500+ Board-Certified Specialists' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <item.icon className="w-4 h-4 text-primary dark:text-blue-400 flex-shrink-0" />
                  <span className="text-xs md:text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Professional Specialties */}
          <div className="space-y-8">
            {/* Specialties Header */}
            <div>
              <h3 className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-4">Medical Departments</h3>
              
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
                    className="bg-white/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 hover:border-primary/30 dark:hover:border-blue-500/30 rounded-xl p-3.5 transition-all duration-300 group cursor-pointer hover:shadow-md active:scale-[0.97]"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 bg-primary/10 dark:bg-blue-400/10 rounded-lg group-hover:bg-primary/20 dark:group-hover:bg-blue-400/20 transition-colors flex-shrink-0">
                        <dept.icon className="w-4 h-4 text-primary dark:text-blue-400" />
                      </div>
                      <span className="text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors leading-tight">
                        {dept.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Accreditation & Features Card */}
            <div className="bg-white/50 dark:bg-slate-800/40 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-3 mb-4">
                <Award className="w-5 h-5 text-primary dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-0.5 text-sm">Accreditations</h4>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">Nationally recognized certifications</p>
                </div>
              </div>
              <div className="space-y-2 text-xs md:text-sm text-slate-700 dark:text-slate-350">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary dark:bg-blue-400 rounded-full flex-shrink-0"></span>
                  <span>NABH Certified Hospital</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary dark:bg-blue-400 rounded-full flex-shrink-0"></span>
                  <span>ISO 9001:2015 Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary dark:bg-blue-400 rounded-full flex-shrink-0"></span>
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
