import { NextResponse } from "next/server";
import { oauthConfigured } from "@/lib/oauth";

/**
 * GET /api/oauth-status
 * Returns which OAuth providers are configured.
 * Frontend uses this to show/hide Google/Facebook login buttons.
 */
export async function GET() {
  return NextResponse.json({
    google: oauthConfigured.google,
    facebook: oauthConfigured.facebook,
    any: oauthConfigured.any,
    demoMode: !oauthConfigured.any,
    message: oauthConfigured.any
      ? "OAuth providers configured."
      : "Demo mode — add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET to .env for real OAuth.",
  });
}
