import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clearSessionCookie, detectHttps } from "@/lib/auth";

/**
 * POST /api/auth/logout
 * Deletes the session and clears the cookie
 */
export async function POST(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";
  // Match both the new unprefixed name and the legacy __Host- prefixed name
  // (pre-cookie-fix sessions still use the prefix; we delete both for safety).
  const tokenMatch = cookie.match(/session_token=([^;]+)/)
    || cookie.match(/__Host-session_token=([^;]+)/);
  const token = tokenMatch?.[1];

  if (token) {
    await db.session.deleteMany({ where: { token } }).catch(() => {});
  }

  const res = NextResponse.json({ ok: true, message: "Logged out" });
  // Pass HTTPS flag so the clear cookie's flags exactly mirror the set
  // cookie's flags (otherwise the browser treats them as different
  // cookies and doesn't actually delete the original).
  res.headers.set("Set-Cookie", clearSessionCookie(detectHttps(req)));
  return res;
}
