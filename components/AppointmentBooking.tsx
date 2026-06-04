'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import { Loader2, X, Calendar, Clock, User } from 'lucide-react';

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
  });

  useEffect(() => {
    if (isOpen && step === 1) {
      fetchDoctors();
    }
  }, [isOpen, step]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.selectedDoctor || !formData.patientName || !formData.patientEmail || !formData.patientPhone) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('appointments').insert({
        doctor_id: formData.selectedDoctor,
        appointment_date: formData.appointmentDate,
        appointment_time: formData.appointmentTime,
        patient_name: formData.patientName,
        patient_email: formData.patientEmail,
        patient_phone: formData.patientPhone,
        patient_age: formData.patientAge ? parseInt(formData.patientAge) : null,
        symptoms_description: formData.symptomsDescription,
        status: 'pending',
      });

      if (error) throw error;

      alert('Appointment booked successfully! We will confirm shortly.');
      onClose();
      setStep(1);
      setFormData({
        selectedDoctor: '',
        appointmentDate: '',
        appointmentTime: '',
        patientName: '',
        patientEmail: '',
        patientPhone: '',
        patientAge: '',
        symptomsDescription: '',
      });
    } catch (error) {
      console.error('[v0] Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-primary text-white px-6 py-4 flex items-center justify-between border-b">
          <h2 className="text-2xl font-bold">Book an Appointment</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
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
                  <User className="w-4 h-4 inline mr-2" />
                  Select Doctor
                </label>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <select
                    name="selectedDoctor"
                    value={formData.selectedDoctor}
                    onChange={handleInputChange}
                    className="w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Choose a doctor...</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!formData.selectedDoctor}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Date and Time */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Appointment Date
                  </label>
                  <Input
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Appointment Time
                  </label>
                  <Input
                    type="time"
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleInputChange}
                    className="border-border"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!formData.appointmentDate || !formData.appointmentTime}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Patient Details */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  name="patientName"
                  placeholder="Full Name *"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  className="border-border"
                />
                <Input
                  type="email"
                  name="patientEmail"
                  placeholder="Email *"
                  value={formData.patientEmail}
                  onChange={handleInputChange}
                  className="border-border"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  type="tel"
                  name="patientPhone"
                  placeholder="Phone *"
                  value={formData.patientPhone}
                  onChange={handleInputChange}
                  className="border-border"
                />
                <Input
                  type="number"
                  name="patientAge"
                  placeholder="Age"
                  value={formData.patientAge}
                  onChange={handleInputChange}
                  className="border-border"
                />
              </div>

              <Textarea
                name="symptomsDescription"
                placeholder="Describe your symptoms or medical concern"
                value={formData.symptomsDescription}
                onChange={handleInputChange}
                className="border-border min-h-24"
              />

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Book Appointment'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
