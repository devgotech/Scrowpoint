import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js App Router Edge Middleware for Scrowpoint.
 *
 * SEC-07 Fix: Properly named middleware file exporting `middleware()` and `config.matcher`.
 * - Intercepts requests to protected account, checkout, escrow, and admin routes.
 * - Checks for frontend session cookies (sp_session, sp_token, auth_token).
 * - Redirects unauthenticated requests to /login?redirect=...
 */

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/seller",
  "/settings",
  "/notifications",
  "/checkout",
  "/escrow",
  "/admin",
  "/disputes",
  "/verify-identity",
];

const SESSION_COOKIE_NAME = "sp_session";
const AUTH_COOKIE_NAME = "sp_token";
const FALLBACK_COOKIE_NAME = "auth_token";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected) {
    const token =
      request.cookies.get(SESSION_COOKIE_NAME)?.value ||
      request.cookies.get(AUTH_COOKIE_NAME)?.value ||
      request.cookies.get(FALLBACK_COOKIE_NAME)?.value;

    if (!token || token.trim() === "") {
      const loginUrl = new URL("/login", request.url);
      const originalPath = `${pathname}${search}`;
      loginUrl.searchParams.set("redirect", originalPath);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/seller/:path*",
    "/settings/:path*",
    "/notifications/:path*",
    "/checkout/:path*",
    "/escrow/:path*",
    "/admin/:path*",
    "/disputes/:path*",
    "/verify-identity/:path*",
  ],
};
