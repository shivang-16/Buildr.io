import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = [
  "/login",
  "/signup",
  "/verify",
  "/forgot-password",
  "/resetpassword",
];

// Auth routes - if logged in, redirect to /feed
const authRoutes = ["/login", "/signup", "/verify", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // If user is logged in and trying to access auth routes, redirect to /feed
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  // If user is not logged in and trying to access protected routes
  if (!token && !isPublicRoute) {
    // Store the original URL to redirect back after login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing root, redirect to /feed if logged in, else /login
  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/feed", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\..*|_next).*)",
  ],
};
