'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function Page() {
  const [form, setForm] = useState({
    patientName: '',
    phone: '',
    department: '',
    preferredDate: '',
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((s) => ({ ...s, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.patientName || !form.phone || !form.department || !form.preferredDate) {
      alert('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('appointments').insert({
        patient_name: form.patientName,
        patient_phone: form.phone,
        department: form.department,
        appointment_date: form.preferredDate,
        status: 'pending',
      })

      if (error) throw error

      alert('Appointment request submitted — we will contact you to confirm.')
      setForm({ patientName: '', phone: '', department: '', preferredDate: '' })
    } catch (err) {
      console.error('[v0] Error submitting appointment:', err)
      alert('Failed to submit appointment. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-6xl mx-auto py-20 px-4 flex justify-center">
      <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-border dark:border-slate-800 shadow-sm w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4">Book Appointment</h1>

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
          <select name="department" value={form.department} onChange={handleChange} className="w-full border border-border dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary">
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

        <div>
          <Button type="submit" className="bg-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
        </form>
      </div>
    </main>
  )
}
