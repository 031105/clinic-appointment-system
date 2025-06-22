'use client';

import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Building,
  BarChart,
  Settings,
  Shield,
  Eye,
} from 'lucide-react';
import { SessionProvider } from '@/contexts/auth/SessionContext';

// FullCalendar CSS imports removed - will use custom CSS instead

const inter = Inter({ subsets: ['latin'] })

const navigationItems = [
  { name: 'Dashboard', href: '/admin-dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/admin-users', icon: Users },
  { name: 'Appointments', href: '/admin-appointments', icon: Calendar },
  { name: 'Departments', href: '/admin-departments', icon: Building },
  { name: 'Reports', href: '/admin-reports', icon: BarChart },
  { name: 'Permissions', href: '/admin-permissions', icon: Shield },
  { name: 'Settings', href: '/admin-settings', icon: Settings },
  { name: 'Patient View', href: '/user-dashboard', icon: Eye },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <SessionProvider>
            {children}
          </SessionProvider>
        </Providers>
      </body>
    </html>
  )
}