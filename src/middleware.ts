import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ["/login", "/register", "/api/auth", "/api/test"];
    
    // Check if it's a public route
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    
    // Allow static files and Next.js internals
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.startsWith("/media") ||
        pathname.includes(".") // static files
    ) {
        return NextResponse.next();
    }

    // API routes: Check for API key or session
    if (pathname.startsWith("/api/")) {
        // Skip auth endpoints
        if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/test")) {
            return NextResponse.next();
        }

        // Check for API key in header
        const apiKey = request.headers.get("x-api-key");
        if (apiKey) {
            // API key auth will be validated in the route handler
            // Just pass through here, route handler will validate
            return NextResponse.next();
        }

        // Check for session auth
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        return NextResponse.next();
    }

    // Dashboard routes: Require login
    if (pathname.startsWith("/dashboard")) {
        const session = await auth();
        
        if (!session?.user) {
            // Redirect to login page
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(loginUrl);
        }

        return NextResponse.next();
    }

    // Root path: redirect to dashboard if logged in, login if not
    if (pathname === "/") {
        const session = await auth();
        if (session?.user) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Public routes
    if (isPublicRoute) {
        return NextResponse.next();
    }

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
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
