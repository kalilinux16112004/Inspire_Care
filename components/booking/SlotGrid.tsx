'use client';

import { TimeSlot } from '@/lib/availability';
import { Loader2 } from 'lucide-react';

interface SlotGridProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  loading?: boolean;
  dayName?: string;
}

export default function SlotGrid({
  slots,
  selectedTime,
  onSelectTime,
  loading = false,
  dayName,
}: SlotGridProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 justify-center py-8 text-sm text-slate-500 font-medium">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        Checking database booking status...
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-8 px-4 text-sm bg-amber-50 text-amber-800 rounded-lg border border-amber-200 shadow-sm">
        No doctor hours configured {dayName ? `for ${dayName}s` : ''}. Please choose another scheduling date.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto p-1.5 border rounded-lg bg-slate-50/50">
        {slots.map((slot) => {
          const isSelected = selectedTime === slot.time;
          const isAvailable = slot.available;

          return (
            <button
              key={slot.time}
              type="button"
              disabled={!isAvailable}
              onClick={() => onSelectTime(slot.time)}
              className={`py-2 px-3 border text-sm font-semibold rounded-lg text-center transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                !isAvailable
                  ? 'bg-slate-100/80 text-slate-400 border-slate-200 line-through cursor-not-allowed pointer-events-none'
                  : isSelected
                  ? 'bg-gradient-to-br from-primary to-blue-700 text-white border-primary shadow-md scale-[1.03] ring-2 ring-primary/20'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-sm'
              }`}
            >
              {slot.time}
              {!isAvailable && (
                <span className="text-[9px] block font-normal tracking-wide text-slate-400 mt-0.5 uppercase">
                  Booked
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground text-center">
        Select a slot. Duration is determined by the doctor's weekly settings.
      </p>
    </div>
  );
}
