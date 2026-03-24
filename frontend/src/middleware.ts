import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware for route protection
 * - Only ADMIN users can access /admin/fuel/* routes
 * - Non-admin users are redirected to /
 * - Public routes: /, /auth/*
 */

export function middleware(request: NextRequest) {
  // Middleware disabled - allowing all access for development/testing
  // In production, implement proper JWT validation and role-based access control
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
