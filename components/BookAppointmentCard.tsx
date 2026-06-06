'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function BookAppointmentCard({ defaultDepartment }: { defaultDepartment?: string }) {
  const supabase = createClient()
  const [form, setForm] = useState({
    patientName: '',
    phone: '',
    email: '',
    preferredDate: '',
    preferredTime: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // Predefined time slots
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']

  const getDayOfWeek = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00')
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[date.getDay()]
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((s) => ({ ...s, [name]: value }))
  }

  const handleTimeSlotClick = (slot: string) => {
    setForm((s) => ({ ...s, preferredTime: slot }))
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    setMessage(null)
    if (!form.patientName || !form.phone || !form.email || !form.preferredDate || !form.preferredTime) {
      setMessage('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          patient_name: form.patientName,
          patient_email: form.email,
          patient_phone: form.phone,
          appointment_date: form.preferredDate,
          appointment_time: form.preferredTime,
          status: 'pending',
        })
        .select()

      if (error) {
        console.error('Supabase error:', error.message, error.code, error.details)
        throw new Error(error.message || 'Failed to create appointment')
      }

      setMessage('Appointment request submitted — we will contact you to confirm.')
      setForm({ patientName: '', phone: '', email: '', preferredDate: '', preferredTime: '' })
    } catch (err: any) {
      console.error('Error submitting appointment:', err.message || err)
      setMessage(err.message || 'Failed to submit appointment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-border shadow-sm w-full max-w-lg">
      <h3 className="text-xl font-semibold mb-4">Book Appointment</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Patient Name</label>
          <Input 
            name="patientName" 
            value={form.patientName} 
            onChange={handleChange} 
            placeholder="Full name" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <Input 
            name="phone" 
            type="tel" 
            value={form.phone} 
            onChange={handleChange} 
            placeholder="Mobile number" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <Input 
            name="email" 
            type="email" 
            value={form.email} 
            onChange={handleChange} 
            placeholder="your@email.com" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Preferred Date</label>
          <Input 
            name="preferredDate" 
            type="date" 
            value={form.preferredDate} 
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
          />
          {form.preferredDate && (
            <p className="text-xs text-muted-foreground mt-1">
              {getDayOfWeek(form.preferredDate)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Preferred Time Slot</label>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => handleTimeSlotClick(slot)}
                className={`p-2 rounded-lg border transition-all text-sm font-medium ${
                  form.preferredTime === slot
                    ? 'bg-primary text-white border-primary'
                    : 'border-border hover:border-primary hover:bg-gray-50'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {message && (
          <p className={`text-sm text-center ${message.includes('submitted') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        <Button 
          type="submit" 
          className="w-full bg-primary" 
          disabled={loading || !form.preferredTime || !form.patientName || !form.phone || !form.email}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </div>
  )
}
