import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Define types for navigation items
interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface AdminSidebarProps {
  navigationItems: NavigationItem[];
  isOpen: boolean;
  onClose: () => void;
  userProfile?: {
    name: string;
    email: string;
    avatar?: string;
  };
  notifications?: Array<{
    id: number | string;
    title: string;
    time: string;
  }>;
  onLogout?: () => void;
}

/**
 * AdminSidebar - Reusable sidebar component for admin interface
 * Includes responsive design for mobile and desktop views
 */
export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  navigationItems,
  isOpen,
  onClose,
  userProfile,
  notifications = [],
  onLogout,
}) => {
  const pathname = usePathname();

  // Desktop sidebar (always visible on large screens)
  const DesktopSidebar = () => (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-grow flex-col overflow-y-auto border-r border-gray-200 bg-white">
        <div className="flex h-16 flex-shrink-0 items-center px-4">
          <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">
            C
          </div>
          <span className="ml-2 text-lg font-semibold">Admin</span>
        </div>
        <div className="flex flex-1 flex-col">
          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    pathname === item.href ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* User Profile and Notifications for Desktop */}
        {userProfile && (
          <div className="p-4 border-t border-gray-200">
            <div className="mb-4 p-3 rounded-md bg-gray-50">
              <div className="flex items-center mb-2">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white mr-3">
                  {userProfile.avatar || userProfile.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{userProfile.name}</p>
                  <p className="text-xs text-gray-500">{userProfile.email}</p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <Link
                  href="/admin-profile"
                  className="flex items-center px-2 py-1.5 text-sm text-gray-700 rounded-md hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Your Profile
                </Link>
                <Link
                  href="/admin-setting"
                  className="flex items-center px-2 py-1.5 text-sm text-gray-700 rounded-md hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Link>
              </div>
            </div>
            
            {/* Notifications Section */}
            {notifications.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Notifications</p>
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {notifications.length}
                  </span>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1 bg-white rounded-md border border-gray-200 p-2">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="py-1 px-2 hover:bg-gray-50 rounded-md text-xs">
                      <p className="font-medium text-gray-800">{notification.title}</p>
                      <p className="text-gray-500 text-xs">{notification.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {onLogout && (
              <button
                onClick={onLogout}
                className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-gray-500 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Mobile sidebar (conditionally rendered based on isOpen state)
  const MobileSidebar = () => (
    <div className={`fixed inset-0 z-40 lg:hidden ${isOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose}></div>
      <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">
              C
            </div>
            <span className="ml-2 text-lg font-semibold">Admin</span>
          </div>
          <button onClick={onClose} className="p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="flex-1 space-y-1 px-2">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    pathname === item.href ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* Mobile User Profile Section */}
          {userProfile && (
            <div className="mt-6 px-2">
              <div className="mb-4 p-3 rounded-md bg-gray-50">
                <div className="flex items-center mb-2">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white mr-3">
                    {userProfile.avatar || userProfile.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{userProfile.name}</p>
                    <p className="text-xs text-gray-500">{userProfile.email}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <Link
                    href="/admin-profile"
                    className="flex items-center px-2 py-1.5 text-sm text-gray-700 rounded-md hover:bg-gray-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Your Profile
                  </Link>
                  <Link
                    href="/admin-setting"
                    className="flex items-center px-2 py-1.5 text-sm text-gray-700 rounded-md hover:bg-gray-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </Link>
                </div>
              </div>
              
              {/* Mobile Notifications Section */}
              {notifications.length > 0 && (
                <div className="mb-4 px-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">Notifications</p>
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      {notifications.length}
                    </span>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1 bg-white rounded-md border border-gray-200 p-2">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="py-1 px-2 hover:bg-gray-50 rounded-md text-xs">
                        <p className="font-medium text-gray-800">{notification.title}</p>
                        <p className="text-gray-500 text-xs">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="mt-2 flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default AdminSidebar; 