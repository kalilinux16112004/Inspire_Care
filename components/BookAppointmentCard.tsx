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
    department: defaultDepartment || '',
    preferredDate: '',
    patientEmail: '',
    preferredTime: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((s) => ({ ...s, [name]: value }))
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    setMessage(null)
    if (!form.patientName || !form.phone || !form.department || !form.preferredDate || !form.patientEmail) {
      setMessage('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('appointments').insert({
        patient_name: form.patientName,
        patient_email: form.patientEmail,
        patient_phone: form.phone,
        department: form.department,
        appointment_date: form.preferredDate,
        appointment_time: form.preferredTime || null,
        status: 'pending',
      })

      if (error) throw error

      setMessage('Appointment request submitted — we will contact you to confirm.')
      setForm({ patientName: '', phone: '', department: defaultDepartment || '', preferredDate: '', patientEmail: '', preferredTime: '' })
    } catch (err) {
      console.error('[v0] Error submitting appointment:', err)
      setMessage('Failed to submit appointment. Please try again.')
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
          <Input name="patientName" value={form.patientName} onChange={handleChange} placeholder="Full name" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <Input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="Mobile number" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Department</label>
          <select name="department" value={form.department} onChange={handleChange} className="w-full border border-border rounded-lg p-2">
            <option value="">Select department</option>
            <option>General</option>
            <option>Cardiology</option>
            <option>Dermatology</option>
            <option>Pediatrics</option>
            <option>Orthopedics</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Preferred Date</label>
          <Input name="preferredDate" type="date" value={form.preferredDate} onChange={handleChange} />
        </div>

        {/* <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Preferred Time</label>
            <Input name="preferredTime" type="time" value={form.preferredTime} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input name="patientEmail" type="email" value={form.patientEmail} onChange={handleChange} placeholder="you@example.com" />
          </div>
        </div> */}

        {message && <p className="text-sm text-center text-muted-foreground">{message}</p>}

        <div>
          <Button type="submit" className="w-full bg-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </form>
    </div>
  )
}
