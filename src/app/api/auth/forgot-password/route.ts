import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateToken } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limiter";

/**
 * POST /api/auth/forgot-password
 * body: { email }
 * Generates a reset token and queues a reset email.
 *
 * SECURITY:
 * - Always returns the same response shape — does NOT reveal whether the
 *   email exists (prevents enumeration).
 * - Rate limited: 3 requests/hour per IP (prevents enumeration + spam).
 * - demoResetUrl returned ONLY in dev/demo (NODE_ENV !== "production").
 *   In production, the reset URL is only in the queued notification (which
 *   requires staff auth to read via /api/notifications).
 */
export async function POST(req: NextRequest) {
  // Rate limit — prevents enumeration + spam.
  const rl = await rateLimit(req, { window: 3600, max: 3, key: "auth:forgot" });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many reset requests. Please wait an hour." },
      { status: 429 }
    );
  }

  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal whether email exists — same response as success path.
    return NextResponse.json({ ok: true, message: "If an account with that email exists, a reset link has been sent." });
  }

  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1-hour expiry

  await db.passwordReset.create({
    data: { userId: user.id, token, expiresAt },
  });

  const resetUrl = `${req.nextUrl.origin}/#/reset-password?token=${token}`;

  // Queue the reset email. The notification body contains the reset URL, but
  // /api/notifications now requires staff auth (Phase A C4 fix).
  await db.notification.create({
    data: {
      type: "EMAIL",
      recipient: email,
      subject: "Password Reset · Guruvayur Dham",
      body: `Namaskaram ${user.name},\n\nWe received a request to reset your password. Click the link below to set a new password:\n\n${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.\n\nGuruvayur Dham Team`,
      status: "QUEUED",
      relatedRef: `RESET-${token.slice(0, 8)}`,
    },
  });

  const isDev = process.env.NODE_ENV !== "production";
  const res: any = {
    ok: true,
    message: "If an account with that email exists, a reset link has been sent.",
  };
  // Only return the reset URL in dev/demo — NEVER in production.
  if (isDev) {
    res.demoResetUrl = resetUrl;
    res.demo = true;
  }

  return NextResponse.json(res);
}

