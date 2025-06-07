// app/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/contexts/auth/SessionContext';

export default function App() {
  const router = useRouter();
  const { status, data } = useSession();

  useEffect(() => {
    if (status === 'loading') {
      // Wait for authentication status to be determined
      return;
    }

    if (status === 'authenticated' && data.user) {
      // Redirect based on user role
      switch (data.user.role) {
        case 'admin':
          router.replace('/admin-dashboard');
          break;
        case 'doctor':
          router.replace('/doctor-dashboard');
          break;
        case 'patient':
        default:
          router.replace('/user-dashboard');
          break;
      }
    } else {
      // User is not logged in, redirect to login page
      router.replace('/login');
    }
  }, [status, router, data.user]);

  // Return a loading state or null while checking auth
  return null;
}
