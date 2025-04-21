import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Authentication | Clinic Appointment System',
  description: 'Login or create an account to manage your medical appointments',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700 p-4 relative overflow-hidden">
      {/* Background circles */}
      <div className="absolute w-[800px] h-[800px] rounded-full bg-white/10 -bottom-[300px] -left-[300px] z-0" />
      <div className="absolute w-[1000px] h-[1000px] rounded-full bg-white/10 -top-[400px] -right-[400px] z-0" />
      
      {/* Content */}
      <div className="w-full max-w-md z-10">
        <Link 
          href="/" 
          className="block mx-auto w-12 h-12 mb-8 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg"
        >
          <span className="text-xl font-bold">C</span>
        </Link>
        
        {children}
      </div>
    </div>
  );
}