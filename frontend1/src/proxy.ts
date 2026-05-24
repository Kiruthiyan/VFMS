import { NextRequest, NextResponse } from "next/server";

/**
 * Global proxy entry point.
 *
 * Access control is currently handled inside the application UI and auth
 * actions, so proxy intentionally passes requests through unchanged.
 */
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};