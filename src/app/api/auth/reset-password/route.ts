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
  // SECURITY (Round 3 M5 fix): use the same strong password policy as register
  // (was: only 6-char minimum — could reset to "123456" defeating registration policy).
  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return NextResponse.json({ error: "Password must contain both letters and numbers" }, { status: 400 });
  }
  const COMMON_PASSWORDS = ["password", "password1", "password123", "12345678", "qwerty", "letmein"];
  if (COMMON_PASSWORDS.includes(newPassword.toLowerCase())) {
    return NextResponse.json({ error: "Password is too common — choose a stronger one" }, { status: 400 });
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
    data: {
      passwordHash: await hashPassword(newPassword),
      // SECURITY (Phase C M5): set tokensInvalidatedAt so any pre-existing
      // sessions (e.g. attacker's session if password was compromised) are
      // rejected at the getUserFromRequest layer. Belt-and-braces on top
      // of the explicit session.deleteMany in C13.
      tokensInvalidatedAt: new Date(),
    },
  });

  // Mark token as used
  await db.passwordReset.update({
    where: { id: reset.id },
    data: { used: true },
  });

  // CRITICAL: invalidate all pre-existing sessions for this user before
  // creating a new one. If the password was reset because of a compromise,
  // the attacker's old session(s) must be revoked. (Phase A C13 fix.)
  await db.session.deleteMany({ where: { userId: reset.userId } }).catch(() => {});

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
