'use client';

// FullCalendar CSS imports removed - will be imported in global CSS
// import '@fullcalendar/core/main.css';
// import '@fullcalendar/daygrid/main.css';
// import '@fullcalendar/timegrid/main.css';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar';
import { 
  LayoutDashboard,
  Calendar,
  Users,
  Building2,
  UserCog,
  Settings,
  Menu,
  UserCheck,
  FileText
} from 'lucide-react';
import { Toaster } from '@/components/ui/Toaster';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { useSession } from '@/contexts/auth/SessionContext';

// Admin interface navigation items
const navigation = [
  { name: 'Dashboard', href: '/admin-dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/admin-users', icon: Users },
  { name: 'Appointments', href: '/admin-appointments', icon: Calendar },
  { name: 'Departments', href: '/admin-departments', icon: Building2 },
  { name: 'Reports', href: '/admin-reports', icon: FileText },
  { name: 'Settings', href: '/admin-settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { logout } = useSession();

  // Sample user profile
  const userProfile = {
    name: 'Admin User',
    email: 'admin@clinic.com'
  };

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
      {/* Use the new AdminSidebar component */}
      <AdminSidebar 
        navigationItems={navigation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userProfile={userProfile}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Sticky top bar */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow lg:hidden">
          {/* Mobile menu button - Only shown on small screens now */} 
          <button
            onClick={() => setSidebarOpen(true)}
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <main className="flex-1 pt-4 lg:pt-0"> {/* Adjust padding for main content */}
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}