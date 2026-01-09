import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Allow access to login and signup pages
    if (pathname === "/login" || pathname === "/signup") {
        return NextResponse.next();
    }

    // Protect admin routes
    if (pathname.startsWith("/admin")) {
        const token = request.cookies.get("auth_token")?.value;
        
        // If no token in cookie, check if we can redirect
        // Note: We'll handle auth check in the component since localStorage is client-side
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/login", "/signup"],
};

