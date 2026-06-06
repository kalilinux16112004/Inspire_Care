'use client'

import { useState, useEffect } from 'react'
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
    startTime: '',
    endTime: '',
    doctorId: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([])
  const [loadingDoctors, setLoadingDoctors] = useState(false)

  // Predefined time slots
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']

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
      const dayOfWeek = getDayOfWeek(date)
      
      // Fetch all doctors
      const { data, error } = await supabase
        .from('doctors')
        .select('id, name, specialization, availability')

      if (error) {
        console.error('Error fetching doctors:', error.message)
        setAvailableDoctors([])
      } else {
        // Filter doctors based on availability
        const filtered = (data || []).filter((doctor: any) => {
          try {
            // Check if availability exists
            if (!doctor.availability) {
              console.warn(`Doctor ${doctor.id} has no availability data`)
              return false
            }

            let availability
            
            // Try to parse as JSON first
            if (typeof doctor.availability === 'string') {
              try {
                availability = JSON.parse(doctor.availability)
              } catch (parseError) {
                // If JSON parsing fails, treat as simple text format (e.g., "Monday-Wed", "Mon,Tue,Wed")
                const availabilityText = doctor.availability.toLowerCase()
                const dayOfWeekLower = dayOfWeek.toLowerCase()
                
                // Check if day is mentioned in the availability text
                if (availabilityText.includes(dayOfWeekLower) || 
                    availabilityText.includes(dayOfWeekLower.substring(0, 3))) {
                  return true
                }
                return false
              }
            } else {
              availability = doctor.availability
            }

            // If we have JSON object, validate it
            if (typeof availability === 'object' && availability !== null) {
              // Check if doctor is available on the selected day
              const dayAvailability = availability[dayOfWeek]
              if (!dayAvailability || !dayAvailability.enabled) {
                return false
              }

              // Check if the selected time slot falls within doctor's availability
              const doctorStart = dayAvailability.start
              const doctorEnd = dayAvailability.end

              if (!doctorStart || !doctorEnd) {
                console.warn(`Doctor ${doctor.id} missing start/end times for ${dayOfWeek}`)
                return false
              }

              return start >= doctorStart && end <= doctorEnd
            }

            return false
          } catch (e) {
            console.error(`Error parsing doctor ${doctor.id} availability:`, e)
            return false
          }
        })

        setAvailableDoctors(filtered)
        setForm((s) => ({ ...s, doctorId: '' }))
      }
    } catch (err: any) {
      console.error('Error fetching doctors:', err.message)
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

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((s) => ({ ...s, [name]: value }))
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    setMessage(null)
    
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

    // Validate that end time is after start time
    if (form.endTime <= form.startTime) {
      setMessage('End time must be after start time')
      return
    }

    setLoading(true)
    try {
      console.log('Submitting appointment:', form)
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_name: form.patientName,
          patient_email: form.email || 'not-provided@clinic.com',
          patient_phone: form.phone,
          appointment_date: form.preferredDate,
          appointment_time: form.startTime,
          doctor_id: form.doctorId,
          status: 'pending',
        })
        .select()

      if (appointmentError) {
        console.error('Supabase error:', appointmentError.message, appointmentError.code, appointmentError.details)
        throw new Error(appointmentError.message || 'Failed to create appointment')
      }

      console.log('Appointment created:', appointmentData)

      // Create admin notification
      const appointmentId = appointmentData?.[0]?.id
      if (appointmentId) {
        const { error: notificationError } = await supabase
          .from('admin_notifications')
          .insert({
            appointment_id: appointmentId,
            patient_name: form.patientName,
            patient_email: form.email || 'not-provided@clinic.com',
            patient_phone: form.phone,
            appointment_date: form.preferredDate,
            appointment_time: form.startTime,
            appointment_end_time: form.endTime,
            doctor_id: form.doctorId,
            notification_type: 'new_appointment',
            status: 'unread',
          })
        
        if (notificationError) {
          console.warn('Failed to create admin notification:', notificationError)
        }
      }

      setMessage('success')
      setForm({ patientName: '', phone: '', email: '', preferredDate: '', startTime: '', endTime: '', doctorId: '' })
    } catch (err: any) {
      console.error('Error submitting appointment:', err.message || err)
      setMessage('error')
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
          <label className="block text-sm font-medium mb-1">Start Time</label>
          <select
            name="startTime"
            value={form.startTime}
            onChange={handleSelectChange}
            className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
          <label className="block text-sm font-medium mb-1">End Time</label>
          <select
            name="endTime"
            value={form.endTime}
            onChange={handleSelectChange}
            disabled={!form.startTime}
            className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
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

        <div>
          <label className="block text-sm font-medium mb-1">Doctor</label>
          <select
            name="doctorId"
            value={form.doctorId}
            onChange={handleSelectChange}
            disabled={!form.startTime || !form.endTime || loadingDoctors || availableDoctors.length === 0}
            className="w-full px-3 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <option value="">
              {loadingDoctors ? 'Loading doctors...' : availableDoctors.length === 0 ? 'No doctors available' : 'Select a doctor'}
            </option>
            {availableDoctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} - {doctor.specialization}
              </option>
            ))}
          </select>
        </div>

        {message && (
          <div className={`p-4 rounded-lg border-l-4 ${
            message === 'success'
              ? 'bg-green-50 border-green-500 text-green-800'
              : message === 'error'
              ? 'bg-red-50 border-red-500 text-red-800'
              : 'bg-blue-50 border-blue-500 text-blue-800'
          }`}>
            {message === 'success' ? (
              <>
                <p className="font-semibold">Appointment Request Submitted!</p>
                <p className="text-sm mt-1">We'll get back to you shortly. Your appointment request has been received and will be reviewed by our team.</p>
              </>
            ) : message === 'error' ? (
              <p className="text-sm">Failed to submit appointment. Please try again.</p>
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
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </div>
  )
}
