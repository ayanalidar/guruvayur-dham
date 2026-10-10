import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/oauth";
import { setSessionCookie, detectHttps } from "@/lib/auth";

/**
 * GET /api/auth/bridge?next=/dashboard
 *
 * BRIDGE between NextAuth session and the app's own session system.
 *
 * PROBLEM:
 *   After Google OAuth succeeds, NextAuth:
 *     1. Creates a User + Session in the DB (via oauth.ts signIn callback)
 *     2. Sets the NextAuth JWT cookie (next-auth.session-token)
 *     3. Redirects to the callbackUrl (e.g. /dashboard)
 *
 *   But the app's own auth system (getUserFromRequest) reads the
 *   `session_token` cookie — NOT the NextAuth JWT. So after Google
 *   OAuth, the app thinks the user is NOT logged in and redirects
 *   back to /login.
 *
 * FIX:
 *   This endpoint:
 *     1. Reads the NextAuth session (via getServerSession)
 *     2. Extracts the appSessionToken (set by oauth.ts signIn callback)
 *     3. Sets the `session_token` cookie (so the app recognizes the user)
 *     4. Redirects to the `next` URL (default: /dashboard)
 *
 * USAGE:
 *   OAuthButtons.tsx sets callbackUrl to:
 *     /api/auth/bridge?next=/dashboard
 *   So after Google OAuth, NextAuth redirects here, we set the cookie,
 *   then redirect to /dashboard — and the app now recognizes the user.
 */
export async function GET(req: NextRequest) {
  const next = req.nextUrl.searchParams.get("next") || "/dashboard";
  const isHttps = detectHttps(req);

  try {
    // Read the NextAuth session (uses the next-auth JWT cookie)
    const session = await getServerSession(authOptions);

    if (session && (session as any).appSessionToken) {
      // NextAuth session has an appSessionToken (set by oauth.ts signIn
      // callback). Set it as the app's own session_token cookie.
      const token = (session as any).appSessionToken;
      const res = NextResponse.redirect(new URL(next, req.url));
      res.headers.set("Set-Cookie", setSessionCookie(token, isHttps));
      return res;
    }

    if (session?.user) {
      // NextAuth session exists but no appSessionToken — redirect to
      // the next URL anyway (the user has a NextAuth session).
      return NextResponse.redirect(new URL(next, req.url));
    }
  } catch (e: any) {
    console.error("[auth/bridge] Error:", e?.message || e);
  }

  // No NextAuth session — redirect to login
  return NextResponse.redirect(new URL("/login", req.url));
}
