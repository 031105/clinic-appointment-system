'use client';

import React, { useState, useEffect } from 'react';
import { DoctorSidebar } from '@/components/doctor';
import { 
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Settings,
  Menu
} from 'lucide-react';
import { Toaster } from '@/components/ui/Toaster';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { useSession } from '@/contexts/auth/SessionContext';
import doctorSettingsClient, { DoctorProfile } from '@/lib/api/doctor-settings';

// Doctor interface navigation items
const navigation = [
  { name: 'Dashboard', href: '/doctor-dashboard', icon: LayoutDashboard },
  { name: 'Appointments', href: '/doctor-appointments', icon: Calendar },
  { name: 'Patients', href: '/doctor-patients', icon: Users },
  { name: 'Reports', href: '/doctor-reports', icon: FileText },
  { name: 'Settings', href: '/doctor-settings', icon: Settings },
];

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { logout, data, status } = useSession();
  
  // State for real doctor profile data
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch real doctor profile data
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (status === 'authenticated' && data.user) {
        try {
          setLoading(true);
          // Get real doctor profile data from API
          const profileData = await doctorSettingsClient.getProfile();
          setDoctorProfile(profileData);
        } catch (error) {
          console.error('Error fetching doctor profile:', error);
          // If API fails, we can still show basic user info from session
          setDoctorProfile(null);
        } finally {
          setLoading(false);
        }
      } else if (status === 'unauthenticated') {
        // Redirect to login if not authenticated
        router.push('/login');
      }
    };

    fetchDoctorProfile();
  }, [status, data.user, router]);

  // Create user profile from session data (fallback if doctor profile API fails)
  const userProfile = data.user ? {
    name: `Dr. ${data.user.name || 'Doctor'}`,
    email: data.user.email || '',
    department: 'Medicine' // Default department if not available
  } : undefined;

  // Enhanced logout handler using SessionContext
  const handleLogout = async () => {
    try {
      // Show loading state
      toast({
        title: "Logging out...",
        description: "Please wait while we securely log you out",
        variant: "default",
      });
      
      // Use the enhanced logout from SessionContext
      await logout();
      
      // Success message will be shown after redirect to login page
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show loading state while fetching user data
  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading doctor dashboard...</div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Use the DoctorSidebar component */}
      <DoctorSidebar 
        navigationItems={navigation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userProfile={userProfile}
        doctorProfile={doctorProfile}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Sticky top bar */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow lg:hidden">
          {/* Mobile menu button - Only shown on small screens */} 
          <button
            onClick={() => setSidebarOpen(true)}
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <main className="flex-1 pt-4 lg:pt-0">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
} 