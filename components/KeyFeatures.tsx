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
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950/40 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/30 dark:to-slate-900/10 border border-slate-200 dark:border-slate-800 hover:border-primary/30 dark:hover:border-blue-500/30 rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 group cursor-pointer"
              >
                <div className={`bg-gradient-to-br ${feature.color} p-4 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
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
