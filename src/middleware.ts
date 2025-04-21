import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const publicPaths = ['/login', '/register', '/forgot-password'];

// Dashboard routes are all under the (dashboard) group
// The root path is also public during development
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
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
  
  // If user is authenticated, proceed to the requested page
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except for static files, api routes, and _next
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};