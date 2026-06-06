'use client';

import { Users, Clock, Zap, AlertCircle } from 'lucide-react';

export default function KeyFeatures() {
  const features = [
    {
      icon: Users,
      title: 'Expert Doctors',
      description: 'Highly qualified and experienced medical professionals dedicated to your health.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Clock,
      title: '24x7 Care',
      description: 'Round-the-clock medical services ensuring care when you need it most.',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Zap,
      title: 'Modern Facilities',
      description: 'State-of-the-art medical equipment and infrastructure for advanced treatment.',
      color: 'from-amber-500 to-amber-600',
    },
    {
      icon: AlertCircle,
      title: 'Emergency Services',
      description: 'Immediate response to medical emergencies with trained trauma teams.',
      color: 'from-red-500 to-red-600',
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300 group"
              >
                <div className={`bg-gradient-to-br ${feature.color} p-4 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
