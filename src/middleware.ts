import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const publicPaths = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // During development, bypass authentication checks
  // Comment out the next line and uncomment the authentication logic when ready
  return NextResponse.next();
  
  /* Authentication logic (commented out for development)
  // Check if path is public
  if (publicPaths.some(path => pathname.startsWith(path)) || pathname === '/') {
    return NextResponse.next();
  }
  
  // Get auth token from cookies
  const authToken = request.cookies.get('auth-token')?.value;
  
  // If no token is found and this is a protected route, redirect to login
  if (!authToken) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  */
}

export const config = {
  matcher: [
    // Match all paths except for static files, api routes, and _next
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};