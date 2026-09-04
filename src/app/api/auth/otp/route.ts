import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/auth/otp
 * Sends an OTP to the given phone number (simulated — logs to notification table)
 * body: { phone }
 * returns: { sent: true, otp: "1234" } (in production, OTP would not be returned)
 */
export async function POST(req: NextRequest) {
  const { phone } = await req.json();
  if (!phone) {
    return NextResponse.json({ error: "Phone required" }, { status: 400 });
  }

  // Generate 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // Store OTP in notification table (simulating SMS send)
  await db.notification.create({
    data: {
      type: "SMS",
      recipient: phone,
      body: `Your Guruvayur Dham OTP is ${otp}. Valid for 5 minutes.`,
      status: "SENT",
      sentAt: new Date(),
    },
  });

  // In demo mode, return the OTP so the UI can auto-fill it
  // In production, this would be sent via real SMS and NOT returned
  return NextResponse.json({
    sent: true,
    otp, // DEMO ONLY — remove in production
    message: `OTP sent to ${phone}`,
  });
}
