import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js App Router Edge Middleware for Scrowpoint.
 *
 * Requirements (UI Context Spec 5, §3):
 * - Intercepts requests to protected routes: /dashboard, /escrow, /admin (and their nested paths).
 * - Checks for the presence of the secure HTTP-only JWT authentication cookie (e.g. `sp_token` or `auth_token`).
 * - If missing or empty, preserves the attempted destination URL via `?redirect=` and redirects to `/login`.
 * - Passes through all public routes, static assets, and auth flows without interruption.
 */

// Protected path prefixes
const PROTECTED_PREFIXES = ["/dashboard", "/escrow", "/admin"];

// Name of the HTTP-only cookie set by the Go core backend
const AUTH_COOKIE_NAME = "sp_token";
const FALLBACK_COOKIE_NAME = "auth_token";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Check if the current route is protected
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected) {
    const token =
      request.cookies.get(AUTH_COOKIE_NAME)?.value ||
      request.cookies.get(FALLBACK_COOKIE_NAME)?.value;

    // If no valid token cookie is present, redirect to /login with redirect parameter
    if (!token || token.trim() === "") {
      const loginUrl = new URL("/login", request.url);
      const originalPath = `${pathname}${search}`;
      loginUrl.searchParams.set("redirect", originalPath);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Continue to the requested route
  return NextResponse.next();
}

/**
 * Configure which paths the middleware executes on.
 * Matches all protected routes while excluding Next.js internals, static files, and media.
 */
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/escrow/:path*",
    "/admin/:path*",
  ],
};