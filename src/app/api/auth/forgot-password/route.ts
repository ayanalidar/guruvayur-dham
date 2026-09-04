import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateToken } from "@/lib/auth";

/**
 * POST /api/auth/forgot-password
 * body: { email }
 * Generates a reset token and sends a reset link via email (simulated).
 */
export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal whether email exists · security best practice
    return NextResponse.json({ ok: true, message: "If an account with that email exists, a reset link has been sent." });
  }

  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1-hour expiry

  await db.passwordReset.create({
    data: { userId: user.id, token, expiresAt },
  });

  const resetUrl = `${req.nextUrl.origin}/#/reset-password?token=${token}`;

  // Log the reset email (simulated)
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

  // In demo mode, return the reset URL so the UI can show it
  return NextResponse.json({
    ok: true,
    message: "If an account with that email exists, a reset link has been sent.",
    demoResetUrl: resetUrl, // DEMO ONLY · remove in production
  });
}
