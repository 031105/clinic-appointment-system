'use client';

import React, { useState, useEffect } from 'react';
import { DoctorSidebar } from '@/components/doctor';
import { 
  LayoutDashboard,
  Calendar,
  Users,
  Clock,
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
  { name: 'Settings', href: '/doctor-settings', icon: Settings },
];

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { data, status } = useSession();
  
  // State for doctor profile - now using proper DoctorProfile type
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Fallback user profile for compatibility
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    department: ''
  });
  
  // Fetch doctor profile data
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (status === 'authenticated' && data.user) {
        try {
          setLoading(true);
          // Use the doctor settings API to get complete profile data
          const profileData = await doctorSettingsClient.getProfile();
          setDoctorProfile(profileData);
          
          // Also set fallback userProfile for compatibility
          setUserProfile({
            name: `Dr. ${profileData.firstName || ''} ${profileData.lastName || ''}`,
            email: profileData.email || data.user.email,
            department: profileData.departmentName || 'Cardiology'
          });
        } catch (error) {
          console.error('Error fetching doctor profile:', error);
          
          // Fallback to user data from session if API fails
          setUserProfile({
            name: `Dr. ${data.user.name || 'John Smith'}`,
            email: data.user.email || 'john.smith@healthclinic.com',
            department: 'Cardiology'
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDoctorProfile();
  }, [status, data.user]);

  // Handle logout
  const handleLogout = () => {
    // 清除用户角色信息
    localStorage.removeItem('clinic-user-role');
    
    // 显示登出成功提示
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
      variant: "default",
    });
    
    // 重定向到登录页面
    router.push('/login');
  };

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