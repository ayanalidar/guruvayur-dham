import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clearSessionCookie } from "@/lib/auth";

/**
 * POST /api/auth/logout
 * Deletes the session and clears the cookie
 */
export async function POST(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";
  const tokenMatch = cookie.match(/session_token=([^;]+)/);
  const token = tokenMatch?.[1];

  if (token) {
    await db.session.deleteMany({ where: { token } }).catch(() => {});
  }

  const res = NextResponse.json({ ok: true, message: "Logged out" });
  res.headers.set("Set-Cookie", clearSessionCookie());
  return res;
}
