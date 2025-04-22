'use client';

import React from 'react';
import Sidebar from './Sidebar';
import AIAssistant from '@/components/ui/AIAssistant';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 bottom-0">
        <Sidebar />
      </div>
      
      {/* Main Content with padding for sidebar */}
      <main className="flex-1 ml-20 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
          <AIAssistant />
        </div>
      </main>
    </div>
  );
}; 