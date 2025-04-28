import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

// FullCalendar CSS imports removed - will use custom CSS instead

import './globals.css'
import { AuthProvider } from '@/lib/contexts/auth-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Clinic Appointment System',
  description: 'Book appointments with your preferred doctors',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}