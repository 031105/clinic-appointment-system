import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
  }

  interface Session {
    user: User & {
      id: string;
      role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
    };
  }
} 