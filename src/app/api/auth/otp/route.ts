import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import { rateLimit } from "@/lib/rate-limiter";

/**
 * POST /api/auth/otp
 * Sends an OTP to the given phone number.
 *
 * SECURITY:
 * - OTP generated with crypto.randomInt (NOT Math.random — that's predictable).
 * - OTP returned in response ONLY in dev/demo (NODE_ENV !== "production").
 *   In production, OTP is never returned — must be read from SMS.
 * - Rate limited: 3 OTPs per 10 minutes per IP (prevents SMS bombing).
 *
 * body: { phone }
 * returns: { sent: true, message } (+ otp in dev only)
 */
export async function POST(req: NextRequest) {
  // Rate limit — SMS bombing protection.
  const rl = rateLimit(req, { window: 600, max: 3, key: "auth:otp" });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many OTP requests. Please wait 10 minutes." },
      { status: 429 }
    );
  }

  const { phone } = await req.json();
  if (!phone || typeof phone !== "string") {
    return NextResponse.json({ error: "Phone required" }, { status: 400 });
  }

  // Cryptographically secure 6-digit OTP.
  const otp = crypto.randomInt(0, 1000000).toString().padStart(6, "0");

  // Store OTP in notification table (simulates SMS send).
  // The notification body contains the OTP — this is fine because
  // /api/notifications now requires staff auth (Phase A C4 fix).
  await db.notification.create({
    data: {
      type: "SMS",
      recipient: phone,
      body: `Your Guruvayur Dham OTP is ${otp}. Valid for 5 minutes. Do not share with anyone.`,
      status: "SENT",
      sentAt: new Date(),
    },
  });

  const isDev = process.env.NODE_ENV !== "production";
  const res: any = {
    sent: true,
    message: `OTP sent to ${phone}`,
  };
  // Only return the OTP in dev/demo — NEVER in production.
  if (isDev) {
    res.otp = otp;
    res.demo = true;
  }

  return NextResponse.json(res);
}
