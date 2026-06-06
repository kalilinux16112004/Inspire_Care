import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import BookingOverlay from '@/components/BookingOverlay'
import EmergencyButton from '@/components/EmergencyButton'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Team Inspire Care - Multispeciality Hospital',
  description: 'Team Inspire Care Multispeciality Hospital - Caring with Compassion. Book appointments with top doctors. OPD, ICU, General, Surgical, Gynac, Ortho, Paediatric, Respiratory departments available.',
  generator: 'v0.app',
  openGraph: {
    title: 'Team Inspire Care - Multispeciality Hospital',
    description: 'Professional healthcare services with appointment booking system',
    type: 'website',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <BookingOverlay />
        <EmergencyButton />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
