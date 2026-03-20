import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── ROUTE DEFINITIONS ─────────────────────────────────────────────────────

const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/signup",
  "/auth/verify-email",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// Routes that require authentication but no specific role
const AUTHENTICATED_ROUTES = ["/settings"];

// Role-specific route prefixes
const ROLE_ROUTES: Record<string, string[]> = {
  ADMIN: ["/admin"],
  APPROVER: ["/approvals"],
  SYSTEM_USER: ["/dashboard"],
  DRIVER: ["/driver"],
};

// Redirect map — where each role should go on login
const ROLE_HOME: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  APPROVER: "/approvals/dashboard",
  SYSTEM_USER: "/dashboard",
  DRIVER: "/driver/dashboard",
};

// ── HELPERS ───────────────────────────────────────────────────────────────

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "?")
  );
}

function isAuthenticatedRoute(pathname: string): boolean {
  return AUTHENTICATED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
}

function getRequiredRole(pathname: string): string | null {
  for (const [role, prefixes] of Object.entries(ROLE_ROUTES)) {
    if (prefixes.some((prefix) => pathname.startsWith(prefix))) {
      return role;
    }
  }
  return null;
}

// ── MIDDLEWARE ────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Always allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // 2. Read auth state from Zustand persisted cookie/storage
  // Zustand persist with localStorage is not readable in middleware (server-side)
  // We use a custom cookie set on login instead
  const authCookie = request.cookies.get("vfms-role")?.value;
  const tokenCookie = request.cookies.get("vfms-token")?.value;

  const isLoggedIn = !!tokenCookie;
  const userRole = authCookie ?? null;

  // 3. Not logged in — redirect to login
  if (!isLoggedIn) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Logged in — check role-specific routes
  const requiredRole = getRequiredRole(pathname);

  if (requiredRole && userRole !== requiredRole) {
    // Wrong role — redirect to their own dashboard
    const homeUrl = userRole
      ? ROLE_HOME[userRole] ?? "/auth/login"
      : "/auth/login";
    const redirectUrl = new URL(homeUrl, request.url);
    redirectUrl.searchParams.set("unauthorized", "1");
    return NextResponse.redirect(redirectUrl);
  }

  // 5. Authenticated route (no specific role needed)
  if (isAuthenticatedRoute(pathname) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};