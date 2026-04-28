import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware is intentionally pass-through for now.
 * It exists to reserve the routing hook for future auth and role-based protection.
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