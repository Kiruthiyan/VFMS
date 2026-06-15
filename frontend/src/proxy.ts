import { NextRequest, NextResponse } from "next/server";

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/dashboards/admin",
  APPROVER: "/dashboards/approver",
  SYSTEM_USER: "/dashboards/staff",
  DRIVER: "/dashboards/driver",
};

const PROTECTED_PREFIXES = ["/admin", "/dashboards"];

/**
 * Global proxy entry point.
 *
 * Most access control is handled inside the application UI and auth actions.
 * Driver management is approver-owned, so protect direct URL access here too.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected) {
    const token = request.cookies.get("vfms-token")?.value;
    if (!token) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname === "/drivers" || pathname.startsWith("/drivers/")) {
    const token = request.cookies.get("vfms-token")?.value;
    const role = request.cookies.get("vfms-role")?.value;

    if (!token || !role) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (role !== "APPROVER") {
      return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
