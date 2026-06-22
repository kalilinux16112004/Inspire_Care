'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import { Loader2, X, Calendar, Clock, User, CheckCircle, CalendarDays, Download, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getDoctorDaySlots, TimeSlot } from '@/lib/availability';
import { createAppointmentTransaction, createSlotHold, releaseSlotHold } from '@/lib/booking';
import { getGoogleCalendarUrl, downloadIcsFile } from '@/lib/calendar';
import SlotGrid from '@/components/booking/SlotGrid';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
}

interface AppointmentBookingProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId?: string;
}

export default function AppointmentBooking({
  isOpen,
  onClose,
  doctorId,
}: AppointmentBookingProps) {
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  
  // Slot Hold Expiration Tracker
  const [userId, setUserId] = useState('');
  const [holdExpiry, setHoldExpiry] = useState<number | null>(null);
  const [countdown, setCountdown] = useState('');
  const supabase = createClient();

  const [formData, setFormData] = useState({
    selectedDoctor: doctorId || '',
    appointmentDate: '',
    appointmentTime: '',
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    patientAge: '',
    symptomsDescription: '',
    appointmentType: 'consultation',
    visitReason: '',
  });

  const [createdAppointment, setCreatedAppointment] = useState<any>(null);

  // Generate or retrieve a persistent client session UUID
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('bookingUserId');
      if (!id) {
        id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
        localStorage.setItem('bookingUserId', id);
      }
      setUserId(id);
    }
  }, []);

  // Countdown timer effect for slot holds
  useEffect(() => {
    if (!holdExpiry) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.round((holdExpiry - Date.now()) / 1000));
      if (remaining <= 0) {
        setHoldExpiry(null);
        setFormData((prev) => ({ ...prev, appointmentTime: '' }));
        setBookingError('Your slot hold session has expired. Please select a slot again.');
        fetchSlots();
      } else {
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        setCountdown(`${mins}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [holdExpiry]);

  useEffect(() => {
    if (isOpen && step === 1) {
      fetchDoctors();
    }
  }, [isOpen, step]);

  useEffect(() => {
    if (formData.selectedDoctor && formData.appointmentDate) {
      fetchSlots();
    } else {
      setSlots([]);
    }
  }, [formData.selectedDoctor, formData.appointmentDate]);

  useEffect(() => {
    if (doctorId) {
      setFormData((prev) => ({ ...prev, selectedDoctor: doctorId }));
    }
  }, [doctorId]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, name, specialization')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('[v0] Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    setLoadingSlots(true);
    try {
      const result = await getDoctorDaySlots(
        supabase,
        formData.selectedDoctor,
        formData.appointmentDate
      );
      setSlots(result.slots || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'selectedDoctor' || name === 'appointmentDate' ? { appointmentTime: '' } : {}),
    }));
  };

  const handleSelectSlot = async (slotTime: string) => {
    setLoadingSlots(true);
    setBookingError(null);
    try {
      const result = await createSlotHold({
        doctorId: formData.selectedDoctor,
        appointmentDate: formData.appointmentDate,
        slotId: slotTime,
        userId: userId,
      });

      if (!result.success) {
        setBookingError(result.error || 'Failed to place slot hold.');
        fetchSlots(); // Refresh list to update status
        return;
      }

      setFormData((prev) => ({ ...prev, appointmentTime: slotTime }));
      setHoldExpiry(Date.now() + 5 * 60 * 1000); // 5 Minutes
    } catch (e: any) {
      console.error('Error holding slot:', e);
      setBookingError(e.message || 'Error locking slot.');
    } finally {
      setLoadingSlots(false);
    }
  };

  const getDayOfWeek = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString + 'T00:00:00');
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[date.getDay()];
    } catch (e) {
      return '';
    }
  };

  const handleSubmit = async () => {
    if (!formData.selectedDoctor || !formData.patientName || !formData.patientEmail || !formData.patientPhone || !formData.appointmentTime) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setBookingError(null);
    try {
      const result = await createAppointmentTransaction({
        doctorId: formData.selectedDoctor,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        patientName: formData.patientName,
        patientEmail: formData.patientEmail,
        patientPhone: formData.patientPhone,
        patientAge: formData.patientAge ? parseInt(formData.patientAge) : null,
        symptomsDescription: formData.symptomsDescription,
        userId: userId,
        appointmentType: formData.appointmentType,
        visitReason: formData.visitReason,
      });

      if (!result.success) {
        setBookingError(result.error || 'Failed to complete booking transaction.');
        // If booking failed because slot was booked/expired, clean timer
        setHoldExpiry(null);
        return;
      }

      setHoldExpiry(null); // Clean hold timer on success
      setCreatedAppointment(result.appointment);
      setStep(4);
    } catch (error: any) {
      console.error('[v0] Error booking appointment:', error);
      setBookingError(error.message || 'Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseAndReset = async () => {
    // Release hold if user cancels modal before booking
    if (formData.appointmentTime && holdExpiry) {
      await releaseSlotHold({
        doctorId: formData.selectedDoctor,
        appointmentDate: formData.appointmentDate,
        slotId: formData.appointmentTime,
        userId: userId,
      });
    }

    onClose();
    setStep(1);
    setHoldExpiry(null);
    setBookingError(null);
    setFormData({
      selectedDoctor: '',
      appointmentDate: '',
      appointmentTime: '',
      patientName: '',
      patientEmail: '',
      patientPhone: '',
      patientAge: '',
      symptomsDescription: '',
      appointmentType: 'consultation',
      visitReason: '',
    });
    setCreatedAppointment(null);
  };

  const activeDoctorInfo = doctors.find((d) => d.id === formData.selectedDoctor);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs transition-all">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto border border-border dark:border-slate-800 transition-all duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-primary dark:bg-blue-600 text-white px-6 py-4 flex items-center justify-between border-b border-primary-foreground/10 z-10 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-bold">Book an Appointment</h2>
          <button
            onClick={handleCloseAndReset}
            className="p-2 hover:bg-white/20 rounded-lg transition-all w-11 h-11 flex items-center justify-center active:scale-90 cursor-pointer"
            aria-label="Close Booking Dialog"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step 1: Select Doctor */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  <User className="w-4 h-4 inline mr-2 text-primary dark:text-blue-400" />
                  Select Doctor
                </label>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary dark:text-blue-400" />
                  </div>
                ) : (
                  <select
                    name="selectedDoctor"
                    value={formData.selectedDoctor}
                    onChange={handleInputChange}
                    className="w-full border border-border dark:border-slate-800 rounded-lg p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                  >
                    <option value="">Choose a doctor...</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id} className="bg-white dark:bg-slate-900">
                        {doctor.name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!formData.selectedDoctor}
                className="w-full bg-primary hover:bg-primary/95 text-white dark:bg-blue-600 dark:hover:bg-blue-700 font-semibold h-11 cursor-pointer active:scale-95 transition-all shadow-sm"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Date and Time Slots */}
          {step === 2 && (
            <div className="space-y-6">
              {bookingError && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg text-sm text-red-800 dark:text-red-400 flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p>{bookingError}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                  <Calendar className="w-4 h-4 inline mr-2 text-primary dark:text-blue-400" />
                  Choose Date
                </label>
                <Input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="border-border dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              {formData.appointmentDate && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-305">
                      <Clock className="w-4 h-4 inline mr-2 text-primary dark:text-blue-400" />
                      Available Time Slots for {getDayOfWeek(formData.appointmentDate)}
                    </label>
                    {holdExpiry && (
                      <span className="text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-400 font-semibold border border-blue-200 dark:border-blue-900/30 rounded-full px-2.5 py-0.5 flex items-center gap-1.5 animate-pulse">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Hold: {countdown}
                      </span>
                    )}
                  </div>

                  <SlotGrid
                    slots={slots}
                    selectedTime={formData.appointmentTime}
                    onSelectTime={handleSelectSlot}
                    loading={loadingSlots}
                    dayName={getDayOfWeek(formData.appointmentDate)}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 cursor-pointer active:scale-95 transition-all"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!formData.appointmentDate || !formData.appointmentTime}
                  className="flex-1 bg-primary hover:bg-primary/95 text-white dark:bg-blue-600 dark:hover:bg-blue-700 font-semibold cursor-pointer active:scale-95 transition-all shadow-sm"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Patient Details & Healthcare Fields */}
          {step === 3 && (
            <div className="space-y-4">
              {bookingError && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg text-sm text-red-800 dark:text-red-400 flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold">Booking Exception:</p>
                    <p className="mt-0.5">{bookingError}</p>
                  </div>
                </div>
              )}

              {holdExpiry && (
                <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/20 rounded-lg text-xs text-blue-800 dark:text-blue-400 flex justify-between items-center font-medium">
                  <span>Your selected slot is reserved. Complete details before expiry.</span>
                  <span className="bg-blue-100 dark:bg-blue-950/40 px-2 py-0.5 rounded text-blue-750 dark:text-blue-400 font-bold">{countdown}</span>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  name="patientName"
                  placeholder="Full Name *"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  className="border-border dark:border-slate-800 bg-white dark:bg-slate-900"
                />
                <Input
                  type="email"
                  name="patientEmail"
                  placeholder="Email Address *"
                  value={formData.patientEmail}
                  onChange={handleInputChange}
                  className="border-border dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  type="tel"
                  name="patientPhone"
                  placeholder="Phone Number *"
                  value={formData.patientPhone}
                  onChange={handleInputChange}
                  className="border-border dark:border-slate-800 bg-white dark:bg-slate-900"
                />
                <Input
                  type="number"
                  name="patientAge"
                  placeholder="Age"
                  value={formData.patientAge}
                  onChange={handleInputChange}
                  className="border-border dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>

              {/* Healthcare Specific Fields */}
              <div className="grid md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Appointment Type *</label>
                  <select
                    name="appointmentType"
                    value={formData.appointmentType}
                    onChange={handleInputChange}
                    className="w-full border border-border dark:border-slate-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                  >
                    <option value="consultation">General Consultation</option>
                    <option value="follow_up">Follow-Up Review</option>
                    <option value="telemedicine">Video Consultation</option>
                    <option value="home_visit">Home Visit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Reason for Visit</label>
                  <Input
                    type="text"
                    name="visitReason"
                    placeholder="e.g. Eye checkup, follow-up prescription"
                    value={formData.visitReason}
                    onChange={handleInputChange}
                    className="border-border dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
                  />
                </div>
              </div>

              <Textarea
                name="symptomsDescription"
                placeholder="Describe your symptoms or medical concerns (optional)"
                value={formData.symptomsDescription}
                onChange={handleInputChange}
                className="border-border dark:border-slate-800 min-h-24 bg-white dark:bg-slate-900"
              />

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1 cursor-pointer active:scale-95 transition-all"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 bg-primary hover:bg-primary/95 text-white dark:bg-blue-600 dark:hover:bg-blue-700 font-semibold cursor-pointer active:scale-95 transition-all shadow-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Securing Slot...
                    </>
                  ) : (
                    'Confirm Booking Request'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Success & Calendar Sync */}
          {step === 4 && createdAppointment && (
            <div className="text-center py-6 space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 dark:bg-emerald-950/20 rounded-full text-green-600 dark:text-emerald-400 mb-2">
                <CheckCircle className="w-10 h-10" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Appointment Request Received!</h3>
                <p className="text-muted-foreground max-w-md mx-auto text-sm">
                  We have registered your details. A pending receipt alert has been dispatched to <strong>{formData.patientEmail}</strong>.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl p-4 max-w-md mx-auto text-left space-y-2 text-sm shadow-sm">
                <p className="font-bold text-slate-800 dark:text-slate-200">Booking Summary:</p>
                <div className="grid grid-cols-3 gap-y-1.5 text-slate-600 dark:text-slate-350">
                  <span className="font-semibold">Doctor:</span>
                  <span className="col-span-2">Dr. {createdAppointment.doctorName} ({createdAppointment.doctorSpecialization})</span>
                  
                  <span className="font-semibold">Scheduled Date:</span>
                  <span className="col-span-2">{new Date(createdAppointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  
                  <span className="font-semibold">Time Slot:</span>
                  <span className="col-span-2">{createdAppointment.time} (30 mins)</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Save to your device planner</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                  <a
                    href={getGoogleCalendarUrl(createdAppointment)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-lg transition-colors bg-white dark:bg-slate-900 shadow-sm cursor-pointer"
                  >
                    <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Google Calendar
                  </a>
                  <button
                    onClick={() => downloadIcsFile(createdAppointment)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-800 hover:border-primary dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-lg transition-colors bg-white dark:bg-slate-900 shadow-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-primary dark:text-blue-400" />
                    Download Invite (.ics)
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-border dark:border-slate-800 max-w-md mx-auto">
                <Button onClick={handleCloseAndReset} className="w-full bg-primary dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold h-11 cursor-pointer active:scale-95 transition-all rounded-lg shadow-sm">
                  Finish
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
