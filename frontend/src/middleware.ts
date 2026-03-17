import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that do not require authentication
const PUBLIC_ROUTES = ["/auth/login", "/auth/forgot-password", "/auth/set-password"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Always allow public routes
    if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Check for JWT token stored in cookie (set by client on login)
    const token = request.cookies.get("auth_token")?.value;

    // If no token, redirect to login
    if (!token && !pathname.startsWith("/auth")) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};

