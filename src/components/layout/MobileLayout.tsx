import { ReactNode } from 'react';
import MobileNavbar from './MobileNavbar';

interface MobileLayoutProps {
  children: ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <main className="pb-16">{children}</main>
        <MobileNavbar />
      </div>
    </div>
  );
} 