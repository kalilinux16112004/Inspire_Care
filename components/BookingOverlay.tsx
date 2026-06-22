'use client'

import { useEffect, useState } from 'react'
import BookAppointmentCard from './BookAppointmentCard'
import { X } from 'lucide-react'

import { usePathname } from 'next/navigation'

export default function BookingOverlay() {
  const [open, setOpen] = useState(false)
  const [doctorId, setDoctorId] = useState<string | undefined>(undefined)
  const pathname = usePathname()

  if (pathname?.startsWith('/admin')) {
    return null
  }

  useEffect(() => {
    const handler = (e: Event) => {
      const evt = e as CustomEvent
      setDoctorId(evt?.detail?.doctorId)
      setOpen(true)
      // prevent body scroll
      document.body.style.overflow = 'hidden'
    }

    window.addEventListener('openBooking', handler as EventListener)
    return () => window.removeEventListener('openBooking', handler as EventListener)
  }, [])

  const close = () => {
    setOpen(false)
    setDoctorId(undefined)
    document.body.style.overflow = ''
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      <div className="relative z-10 w-full max-w-lg">
        <div className="flex justify-end mb-2">
          <button onClick={close} className="w-11 h-11 rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent dark:border-slate-800 flex items-center justify-center active:scale-95 duration-150 cursor-pointer" aria-label="Close booking overlay">
            <X className="w-5 h-5" />
          </button>
        </div>
        <BookAppointmentCard defaultDepartment={undefined} />
      </div>
    </div>
  )
}
