import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://your-domain.com'),
  title: {
    template: '%s | Clinic Appointment System',
    default: 'Clinic Appointment System',
  },
  description: 'Book medical appointments online with top healthcare providers. Easy scheduling and management of your healthcare visits.',
  keywords: ['clinic', 'medical appointment', 'doctor booking', 'healthcare', 'online scheduling'],
  authors: [{ name: 'Your Clinic Name' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Clinic Appointment System',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
} 