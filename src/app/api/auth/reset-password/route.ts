import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth";

/**
 * POST /api/auth/reset-password
 * body: { token, newPassword }
 * Validates the reset token and sets a new password.
 */
export async function POST(req: NextRequest) {
  const { token, newPassword } = await req.json();

  if (!token || !newPassword) {
    return NextResponse.json({ error: "Token and new password required" }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const reset = await db.passwordReset.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!reset || reset.used || reset.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
  }

  // Update password
  await db.user.update({
    where: { id: reset.userId },
    data: { passwordHash: hashPassword(newPassword) },
  });

  // Mark token as used
  await db.passwordReset.update({
    where: { id: reset.id },
    data: { used: true },
  });

  // Create a new session (auto-login)
  const session = await createSession(reset.userId, reset.user.role);
  const res = NextResponse.json({
    ok: true,
    user: { id: reset.user.id, name: reset.user.name, email: reset.user.email, role: reset.user.role },
    message: "Password reset successfully! You are now logged in.",
  });
  res.headers.set("Set-Cookie", setSessionCookie(session.token));
  return res;
}
