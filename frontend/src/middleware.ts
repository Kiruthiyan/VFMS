import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Redirect legacy routes
    if (pathname === "/login") {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    if (pathname === "/signup") {
        return NextResponse.redirect(new URL("/auth/signup", request.url));
    }

    // Allow access to auth pages
    if (pathname.startsWith("/auth")) {
        return NextResponse.next();
    }

    // Protect admin routes
    if (pathname.startsWith("/admin")) {
        const token = request.cookies.get("auth_token")?.value;
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/login", "/signup", "/auth/:path*"],
};

