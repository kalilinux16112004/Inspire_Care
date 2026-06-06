'use client';

import { Phone } from 'lucide-react';

export default function EmergencyButton() {
  const emergencyNumber = '123456789';
  const emergencyNumberFormatted = `tel:${emergencyNumber}`;

  return (
    <a
      href={emergencyNumberFormatted}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
      title="Emergency Call"
    >
      <Phone className="w-5 h-5" />
      <span className="hidden sm:inline">Call Now</span>
    </a>
  );
}
