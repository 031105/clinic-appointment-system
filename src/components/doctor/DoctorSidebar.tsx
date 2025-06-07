'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DoctorImage from '@/components/DoctorImage';

// Define interface for the navigation items
interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

// Update props interface to include doctor profile data
interface DoctorSidebarProps {
  navigationItems: NavigationItem[];
  isOpen: boolean;
  onClose: () => void;
  userProfile?: {
    name: string;
    email: string;
    department?: string;
    avatar?: string;
  };
  doctorProfile?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    departmentName?: string;
  } | null;
  onLogout?: () => void;
}

export const DoctorSidebar: React.FC<DoctorSidebarProps> = ({
  navigationItems,
  isOpen,
  onClose,
  userProfile,
  doctorProfile,
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
          <span className="ml-2 text-lg font-semibold">Doctor Portal</span>
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
        
        {/* User Profile for Desktop */}
        {(userProfile || doctorProfile) && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div>
                {doctorProfile ? (
                  <DoctorImage
                    userId={doctorProfile.id}
                    profileImageBlob={doctorProfile.profilePicture}
                    size="sm"
                    rounded="full"
                    className="mr-3"
                  />
                ) : userProfile?.avatar ? (
                  <img
                    className="h-10 w-10 rounded-full"
                    src={userProfile.avatar}
                    alt={userProfile.name}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {((doctorProfile && doctorProfile.firstName) || userProfile?.name)?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {doctorProfile 
                    ? `Dr. ${doctorProfile.firstName} ${doctorProfile.lastName}`
                    : userProfile?.name
                  }
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {doctorProfile?.email || userProfile?.email}
                </p>
                {(doctorProfile?.departmentName || userProfile?.department) && (
                  <p className="text-xs text-blue-600 truncate">
                    {doctorProfile?.departmentName || userProfile?.department}
                  </p>
                )}
              </div>
            </div>
            
            {onLogout && (
              <button
                onClick={onLogout}
                className="mt-4 group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
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

  // Mobile sidebar (shown when isOpen is true)
  const MobileSidebar = () => (
    <div className={`lg:hidden ${isOpen ? 'fixed inset-0 z-40 flex' : 'hidden'}`}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
      
      {/* Sidebar */}
      <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <button
            onClick={onClose}
            className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
          <div className="flex flex-shrink-0 items-center px-4">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">
              C
            </div>
            <span className="ml-2 text-lg font-semibold">Doctor Portal</span>
          </div>
          <nav className="mt-5 space-y-1 px-2">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-md px-2 py-2 text-base font-medium ${
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={onClose}
              >
                <item.icon
                  className={`mr-4 h-6 w-6 flex-shrink-0 ${
                    pathname === item.href ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Mobile User Profile */}
        {(userProfile || doctorProfile) && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div>
                {doctorProfile ? (
                  <DoctorImage
                    userId={doctorProfile.id}
                    profileImageBlob={doctorProfile.profilePicture}
                    size="sm"
                    rounded="full"
                    className="mr-3"
                  />
                ) : userProfile?.avatar ? (
                  <img
                    className="h-10 w-10 rounded-full"
                    src={userProfile.avatar}
                    alt={userProfile.name}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {((doctorProfile && doctorProfile.firstName) || userProfile?.name)?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-base font-medium text-gray-900 truncate">
                  {doctorProfile 
                    ? `Dr. ${doctorProfile.firstName} ${doctorProfile.lastName}`
                    : userProfile?.name
                  }
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {doctorProfile?.email || userProfile?.email}
                </p>
                {(doctorProfile?.departmentName || userProfile?.department) && (
                  <p className="text-sm text-blue-600 truncate">
                    {doctorProfile?.departmentName || userProfile?.department}
                  </p>
                )}
              </div>
            </div>
            
            {onLogout && (
              <button
                onClick={onLogout}
                className="mt-4 group flex w-full items-center rounded-md px-2 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-4 h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}; 