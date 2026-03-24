import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("auth_token")?.value;
    const pathname = new URL(request.url).pathname;

   //public route
    const publicRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  //protected route
    const protectedRoutes = ["/dashboard", "/blogs", "/inquiries", "/analytics", "/users", "/roles", "/profile"];
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

    // If user is on a protected route without token, redirect to login
    if (isProtectedRoute && !token) {
        const loginUrl = new URL("/login", request.url);
        // Add redirect parameter to return user after login
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If user is on a public route (like login) with a valid token, redirect to dashboard
    if (isPublicRoute && token) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Allow the request to proceed
    return NextResponse.next();
}


export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
