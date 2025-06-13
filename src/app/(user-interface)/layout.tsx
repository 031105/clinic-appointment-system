'use client';

import React, { useState, useEffect } from 'react';
import { UserSidebar } from '@/components/user';
import { 
  LayoutDashboard,
  Calendar,
  Clock,
  Settings,
  Menu
} from 'lucide-react';
import { Toaster } from '@/components/ui/Toaster';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { useSession } from '@/contexts/auth/SessionContext';
import patientClient from '@/lib/api/patient-client';

// User interface navigation items
const navigation = [
  { name: 'Dashboard', href: '/user-dashboard', icon: LayoutDashboard },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'Settings', href: '/settings', icon: Settings },
];

// Patient profile interface
interface PatientProfile {
  id: number;
  userId: number;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profile_image_blob?: string;
  };
  dateOfBirth?: string;
  bloodGroup?: string;
  height?: number;
  weight?: number;
  allergies?: any[];
  emergencyContacts?: any[];
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { logout, data, status } = useSession();
  
  // State for real patient profile data
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch real patient profile data
  useEffect(() => {
    const fetchPatientProfile = async () => {
      if (status === 'authenticated' && data.user) {
        try {
          setLoading(true);
          // Get real patient profile data from API
          const profileData = await patientClient.getProfile();
          console.log('Patient profile data:', profileData);
          setPatientProfile(profileData as PatientProfile);
        } catch (error) {
          console.error('Error fetching patient profile:', error);
          // If API fails, we can still show basic user info from session
          setPatientProfile(null);
        } finally {
          setLoading(false);
        }
      } else if (status === 'unauthenticated') {
        // Redirect to login if not authenticated
        router.push('/login');
      }
    };

    fetchPatientProfile();
  }, [status, data.user, router]);

  // Create user profile from session data (fallback if patient profile API fails)
  const userProfile = data.user ? {
    name: data.user.name || 'User',
    email: data.user.email || '',
    role: 'Patient'
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Use the UserSidebar component */}
      <UserSidebar 
        navigationItems={navigation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userProfile={userProfile}
        patientProfile={patientProfile}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <div className="lg:pl-16">
        {/* Sticky top bar */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow-sm border-b border-gray-200 lg:hidden">
          {/* Mobile menu button - Only shown on small screens */} 
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <main className="flex-1 py-4 px-4">
          <div className="mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}