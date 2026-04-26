import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Global middleware entry point for request preprocessing.
 *
 * This middleware currently forwards requests without mutation while route-level
 * guards handle access control in the application layer.
 */
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};