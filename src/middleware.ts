// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Role-based protected paths
const protectedPaths = {
  patient: [
    '/user-dashboard',
    '/appointments',
    '/medical-reports',
    '/doctors',
    '/settings',
  ],
  doctor: [
    '/doctor-dashboard',
    '/doctor-appointments',
    '/doctor-patients',
    '/doctor-schedule',
  ],
  admin: [
    '/admin-dashboard',
    '/admin-appointments',
    '/admin-patients',
    '/admin-departments',
    '/admin-permissions',
    '/admin-settings',
    '/admin-users',
    '/admin-doctors',
    '/admin-reports',
  ]
};

// All protected paths combined
const allProtectedPaths = [
  ...protectedPaths.patient,
  ...protectedPaths.doctor,
  ...protectedPaths.admin
];

export function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;
  
  // Check if the current path is any protected path
  const isProtectedPath = allProtectedPaths.some(path => 
    currentPath === path || currentPath.startsWith(`${path}/`)
  );

  // If it's not a protected path, allow the request
  if (!isProtectedPath) {
    return NextResponse.next();
  }

  // Check for the access token in cookies
  const accessToken = request.cookies.get('accessToken')?.value;

  // If there's no token and the path is protected, redirect to login
  if (!accessToken && isProtectedPath) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If there is a token, check if the user has access to the specific path
  try {
    // Get user data from cookies - in a real implementation, you would verify the token
    const userDataCookie = request.cookies.get('userData')?.value;
    
    if (userDataCookie) {
      const userData = JSON.parse(userDataCookie);
      const userRole = userData.role;

      // Check path access based on role
      const isPatientPath = protectedPaths.patient.some(path => 
        currentPath === path || currentPath.startsWith(`${path}/`)
      );
      const isDoctorPath = protectedPaths.doctor.some(path => 
        currentPath === path || currentPath.startsWith(`${path}/`)
      );
      const isAdminPath = protectedPaths.admin.some(path => 
        currentPath === path || currentPath.startsWith(`${path}/`)
      );

      // Redirect to appropriate dashboard if trying to access wrong area
      if (
        (userRole === 'patient' && (isDoctorPath || isAdminPath)) || 
        (userRole === 'doctor' && (isPatientPath || isAdminPath)) ||
        (userRole === 'admin' && (isPatientPath || isDoctorPath))
      ) {
        // Redirect to appropriate dashboard based on role
        let redirectUrl;
        switch (userRole) {
          case 'admin':
            redirectUrl = new URL('/admin-dashboard', request.url);
            break;
          case 'doctor':
            redirectUrl = new URL('/doctor-dashboard', request.url);
            break;
          default:
            redirectUrl = new URL('/user-dashboard', request.url);
        }
        return NextResponse.redirect(redirectUrl);
      }
    }
  } catch (error) {
    console.error('Error checking role access:', error);
    // On error, redirect to login
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Allow the request if everything is ok
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /fonts, /icons (static files)
     * 4. /favicon.ico, /sitemap.xml (static files)
     * 5. /login, /register, /forgot-password (auth routes)
     */
    '/((?!api|_next|fonts|icons|favicon.ico|sitemap.xml|login|register|forgot-password).*)',
  ],
}; 