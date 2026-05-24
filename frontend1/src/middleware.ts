import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * PLACEHOLDER MIDDLEWARE — currently passes all requests through.
 * Kiruthiyan (feature/auth-rbac-protection) will add route protection here.
 * Other team members: do NOT modify this file on your feature branches.
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
