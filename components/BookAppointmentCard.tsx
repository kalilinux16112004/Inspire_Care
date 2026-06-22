'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { CalendarDays, Download, AlertTriangle, ShieldCheck } from 'lucide-react'
import { createAppointmentTransaction, createSlotHold, releaseSlotHold } from '@/lib/booking'
import { getGoogleCalendarUrl, downloadIcsFile } from '@/lib/calendar'

export default function BookAppointmentCard({ defaultDepartment }: { defaultDepartment?: string }) {
  const supabase = createClient()
  const [form, setForm] = useState({
    patientName: '',
    phone: '',
    email: '',
    preferredDate: '',
    startTime: '',
    endTime: '',
    doctorId: '',
    appointmentType: 'consultation',
    visitReason: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([])
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [createdApt, setCreatedApt] = useState<any>(null)

  // Slot Hold Expiration Tracker
  const [userId, setUserId] = useState('')
  const [holdExpiry, setHoldExpiry] = useState<number | null>(null)
  const [countdown, setCountdown] = useState('')
  const [activeHold, setActiveHold] = useState<{ doctorId: string; date: string; slotId: string } | null>(null)

  // Predefined time slots
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']

  // Generate or retrieve a persistent client session UUID
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('bookingUserId')
      if (!id) {
        id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)
        localStorage.setItem('bookingUserId', id)
      }
      setUserId(id)
    }
  }, [])

  // Countdown timer effect for slot holds
  useEffect(() => {
    if (!holdExpiry) return
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.round((holdExpiry - Date.now()) / 1000))
      if (remaining <= 0) {
        setHoldExpiry(null)
        setForm((prev) => ({ ...prev, doctorId: '' }))
        setBookingError('Your slot hold session has expired. Please select a doctor or time slot again.')
        if (form.preferredDate && form.startTime && form.endTime) {
          fetchAvailableDoctors(form.preferredDate, form.startTime, form.endTime)
        }
      } else {
        const mins = Math.floor(remaining / 60)
        const secs = remaining % 60
        setCountdown(`${mins}:${secs.toString().padStart(2, '0')}`)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [holdExpiry, form.preferredDate, form.startTime, form.endTime])

  // Release hold on unmount
  useEffect(() => {
    return () => {
      if (activeHold && userId) {
        releaseSlotHold({
          doctorId: activeHold.doctorId,
          appointmentDate: activeHold.date,
          slotId: activeHold.slotId,
          userId: userId,
        }).catch(err => console.warn('Clean up hold on unmount failed:', err))
      }
    }
  }, [activeHold, userId])

  // Slot hold trigger effect
  useEffect(() => {
    const triggerHold = async () => {
      // If we already had an active hold, release it first
      if (activeHold) {
        await releaseSlotHold({
          doctorId: activeHold.doctorId,
          appointmentDate: activeHold.date,
          slotId: activeHold.slotId,
          userId: userId,
        })
        setActiveHold(null)
        setHoldExpiry(null)
      }

      // Create a new hold if slot info is fully set
      if (form.doctorId && form.preferredDate && form.startTime && userId) {
        setBookingError(null)
        const result = await createSlotHold({
          doctorId: form.doctorId,
          appointmentDate: form.preferredDate,
          slotId: form.startTime,
          userId: userId,
        })

        if (!result.success) {
          setBookingError(result.error || 'Failed to place slot hold.')
          setForm((s) => ({ ...s, doctorId: '' }))
          // Refresh list to update status
          if (form.preferredDate && form.startTime && form.endTime) {
            fetchAvailableDoctors(form.preferredDate, form.startTime, form.endTime)
          }
        } else {
          setActiveHold({
            doctorId: form.doctorId,
            date: form.preferredDate,
            slotId: form.startTime,
          })
          setHoldExpiry(Date.now() + 5 * 60 * 1000)
        }
      }
    }

    triggerHold()
  }, [form.doctorId, form.preferredDate, form.startTime, userId])

  const getDayOfWeek = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00')
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[date.getDay()]
  }

  const fetchAvailableDoctors = async (date: string, start: string, end: string) => {
    if (!date || !start || !end) {
      setAvailableDoctors([])
      setForm((s) => ({ ...s, doctorId: '' }))
      return
    }

    setLoadingDoctors(true)
    try {
      const dateParts = date.split('-').map(Number)
      const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2])
      const weekday = dateObj.getDay()

      // 1. Fetch active doctors
      const { data: doctorsData, error: docErr } = await supabase
        .from('doctors')
        .select('id, name, specialization')
        .eq('is_active', true)

      if (docErr) throw docErr

      // 2. Fetch doctor availability plans for this weekday
      const { data: plansData, error: planErr } = await supabase
        .from('doctor_availability')
        .select('doctor_id, start_time, end_time, slot_duration, is_available')
        .eq('weekday', weekday)

      if (planErr) throw planErr

      // 3. Fetch leaves on this date
      const { data: leavesData, error: leaveErr } = await supabase
        .from('doctor_leaves')
        .select('doctor_id')
        .eq('leave_date', date)

      if (leaveErr) throw leaveErr

      // 4. Fetch availability exceptions on this date
      const { data: exceptionsData, error: exceptionErr } = await supabase
        .from('doctor_availability_exceptions')
        .select('*')
        .eq('exception_date', date)

      if (exceptionErr) throw exceptionErr

      // 5. Fetch existing active bookings at this start time slot (excluding soft-deleted)
      const { data: bookingsData, error: bookErr } = await supabase
        .from('appointments')
        .select('doctor_id')
        .eq('appointment_date', date)
        .eq('slot_id', start)
        .is('deleted_at', null)
        .neq('status', 'rejected')

      if (bookErr) throw bookErr

      // 6. Fetch active holds by other users
      const { data: holdsData, error: holdErr } = await supabase
        .from('appointment_holds')
        .select('doctor_id')
        .eq('appointment_date', date)
        .eq('slot_id', start)
        .gt('expires_at', new Date().toISOString())
        .neq('user_id', userId)

      if (holdErr) throw holdErr

      const leavesSet = new Set((leavesData || []).map((l: any) => l.doctor_id))
      const bookingsSet = new Set((bookingsData || []).map((b: any) => b.doctor_id))
      const holdsSet = new Set((holdsData || []).map((h: any) => h.doctor_id))

      const filtered = (doctorsData || []).filter((doctor: any) => {
        // A. Is doctor on leave?
        if (leavesSet.has(doctor.id)) return false

        // B. Is doctor already booked at this time slot?
        if (bookingsSet.has(doctor.id)) return false

        // C. Is slot held by another patient?
        if (holdsSet.has(doctor.id)) return false

        // D. Check for Availability Exception override first
        const exception = (exceptionsData || []).find((e: any) => e.doctor_id === doctor.id)
        let plan
        if (exception) {
          if (!exception.is_available) return false
          plan = exception
        } else {
          // E. Fallback to weekly schedule plan
          plan = (plansData || []).find((p: any) => p.doctor_id === doctor.id && p.is_available === true)
        }

        if (!plan) return false

        // Verify time boundaries
        const timeToSeconds = (t: string) => {
          const [h, m] = t.split(':').map(Number)
          return h * 3600 + m * 60
        }

        const selectStart = timeToSeconds(start)
        const selectEnd = timeToSeconds(end)
        const planStart = timeToSeconds(plan.start_time)
        const planEnd = timeToSeconds(plan.end_time)

        return selectStart >= planStart && selectEnd <= planEnd
      })

      setAvailableDoctors(filtered)
      setForm((s) => ({ ...s, doctorId: '' }))
    } catch (err: any) {
      console.error('Error querying available doctors:', err.message)
      setAvailableDoctors([])
    } finally {
      setLoadingDoctors(false)
    }
  }

  useEffect(() => {
    if (form.preferredDate && form.startTime && form.endTime) {
      fetchAvailableDoctors(form.preferredDate, form.startTime, form.endTime)
    }
  }, [form.preferredDate, form.startTime, form.endTime])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((s) => ({ ...s, [name]: value }))
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((s) => ({
      ...s,
      [name]: value,
      ...(name === 'preferredDate' || name === 'startTime' || name === 'endTime' ? { doctorId: '' } : {}),
    }))
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    setMessage(null)
    setBookingError(null)
    setCreatedApt(null)
    
    // Validation
    const errors = []
    if (!form.patientName) errors.push('Patient name is required')
    if (!form.phone) errors.push('Phone number is required')
    if (!form.preferredDate) errors.push('Date is required')
    if (!form.startTime) errors.push('Start time is required')
    if (!form.endTime) errors.push('End time is required')
    if (!form.doctorId) errors.push('Please select a doctor')

    if (errors.length > 0) {
      setMessage(errors.join(', '))
      return
    }

    if (form.endTime <= form.startTime) {
      setMessage('End time must be after start time')
      return
    }

    setLoading(true)
    try {
      // Dispatch via transaction action
      const result = await createAppointmentTransaction({
        doctorId: form.doctorId,
        appointmentDate: form.preferredDate,
        appointmentTime: form.startTime,
        patientName: form.patientName,
        patientEmail: form.email,
        patientPhone: form.phone,
        userId: userId,
        appointmentType: form.appointmentType,
        visitReason: form.visitReason,
      })

      if (!result.success) {
        setBookingError(result.error || 'Failed to book slot.')
        setHoldExpiry(null)
        setActiveHold(null)
        return
      }

      setHoldExpiry(null)
      setActiveHold(null)
      setCreatedApt(result.appointment)
      setMessage('success')
      setForm({
        patientName: '',
        phone: '',
        email: '',
        preferredDate: '',
        startTime: '',
        endTime: '',
        doctorId: '',
        appointmentType: 'consultation',
        visitReason: '',
      })
    } catch (err: any) {
      console.error('Error submitting appointment:', err.message || err)
      setBookingError(err.message || 'Failed to submit appointment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-border dark:border-slate-800 shadow-sm w-full max-w-lg">
      <h3 className="text-xl font-semibold mb-4 text-foreground">Book Appointment</h3>

      {bookingError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold">Booking Exception:</p>
            <p className="mt-0.5">{bookingError}</p>
          </div>
        </div>
      )}

      {holdExpiry && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex justify-between items-center font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            Your slot is reserved. Complete booking before expiry.
          </span>
          <span className="bg-blue-100 px-2 py-0.5 rounded text-blue-700 font-bold">{countdown}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-350">Patient Name</label>
          <Input 
            name="patientName" 
            value={form.patientName} 
            onChange={handleChange} 
            placeholder="Full name" 
            className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-355">Phone Number</label>
            <Input 
              name="phone" 
              type="tel" 
              value={form.phone} 
              onChange={handleChange} 
              placeholder="Mobile number" 
              className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-355">Email (Optional)</label>
            <Input 
              name="email" 
              type="email" 
              value={form.email} 
              onChange={handleChange} 
              placeholder="Email address" 
              className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-350">Preferred Date</label>
          <Input 
            name="preferredDate" 
            type="date" 
            value={form.preferredDate} 
            onChange={handleSelectChange}
            min={new Date().toISOString().split('T')[0]}
            className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800"
          />
          {form.preferredDate && (
            <p className="text-xs text-muted-foreground mt-1 font-semibold">
              {getDayOfWeek(form.preferredDate)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-350">Start Time</label>
            <select
              name="startTime"
              value={form.startTime}
              onChange={handleSelectChange}
              className="w-full px-3 py-2 border border-border dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select start time</option>
              {timeSlots.map((slot) => (
                <option key={`start-${slot}`} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-350">End Time</label>
            <select
              name="endTime"
              value={form.endTime}
              onChange={handleSelectChange}
              disabled={!form.startTime}
              className="w-full px-3 py-2 border border-border dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed"
            >
              <option value="">Select end time</option>
              {timeSlots
                .filter((slot) => slot > form.startTime)
                .map((slot) => (
                  <option key={`end-${slot}`} value={slot}>
                    {slot}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-350">Doctor</label>
          <select
            name="doctorId"
            value={form.doctorId}
            onChange={handleSelectChange}
            disabled={!form.startTime || !form.endTime || loadingDoctors || availableDoctors.length === 0}
            className="w-full px-3 py-2 border border-border dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed"
          >
            <option value="">
              {loadingDoctors 
                ? 'Loading doctors...' 
                : (!form.preferredDate || !form.startTime || !form.endTime) 
                ? 'Select date and time first' 
                : availableDoctors.length === 0 
                ? 'No doctors available at this time' 
                : 'Select a doctor'}
            </option>
            {availableDoctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} - {doctor.specialization}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-350">Appointment Type</label>
            <select
              name="appointmentType"
              value={form.appointmentType}
              onChange={handleSelectChange}
              className="w-full px-3 py-2 border border-border dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="consultation">General Consultation</option>
              <option value="follow_up">Follow-Up Review</option>
              <option value="telemedicine">Video Consultation</option>
              <option value="home_visit">Home Visit</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-350">Reason for Visit</label>
            <Input 
              name="visitReason" 
              value={form.visitReason} 
              onChange={handleChange} 
              placeholder="e.g. Eye checkup" 
              className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg border-l-4 ${
            message === 'success'
              ? 'bg-green-50 border-green-500 text-green-800'
              : 'bg-blue-50 border-blue-500 text-blue-800'
          }`}>
            {message === 'success' ? (
              <div className="space-y-3">
                <p className="font-semibold text-green-950">Appointment Request Submitted!</p>
                <p className="text-sm mt-1 text-green-800">Your request is received. You can now sync the appointment with your calendar:</p>
                
                {createdApt && (
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <a
                      href={getGoogleCalendarUrl(createdApt)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 text-xs font-semibold rounded bg-white shadow-sm transition"
                    >
                      <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
                      Google Calendar
                    </a>
                    <button
                      type="button"
                      onClick={() => downloadIcsFile(createdApt)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-primary hover:bg-blue-50 text-slate-700 text-xs font-semibold rounded bg-white shadow-sm transition"
                    >
                      <Download className="w-3.5 h-3.5 text-primary" />
                      Download .ics
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm">{message}</p>
            )}
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full bg-primary" 
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Booking'}
        </Button>
      </form>
    </div>
  )
}
