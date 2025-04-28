'use client';

import React, { useState } from 'react';
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

// User interface navigation items
const navigation = [
  { name: 'Dashboard', href: '/user-dashboard', icon: LayoutDashboard },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  // Sample user profile
  const userProfile = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Patient'
  };

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
      {/* Use the UserSidebar component */}
      <UserSidebar 
        navigationItems={navigation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userProfile={userProfile}
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