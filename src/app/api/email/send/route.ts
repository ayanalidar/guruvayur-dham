import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/email/send
 * Sends an email notification. Uses Nodemailer if SMTP env vars are set,
 * otherwise queues to the Notifications table for manual processing.
 *
 * Body: { to, subject, body, type? }
 * Env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL
 */
export async function POST(req: NextRequest) {
  try {
    const { to, subject, body, type = "GENERAL" } = await req.json();
    if (!to || !subject || !body) {
      return NextResponse.json({ error: "to, subject, body are required" }, { status: 400 });
    }

    // Log to Notifications table
    const notification = await db.notification.create({
      data: { type: "EMAIL", recipient: to, subject, body, status: "QUEUED" },
    });

    // Try SMTP if configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const fromEmail = process.env.FROM_EMAIL || "stay@guruvayurdham.com";

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const nodemailer = await import("nodemailer" as string).catch(() => null) as any;
        if (nodemailer) {
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_PORT === "465",
            auth: { user: smtpUser, pass: smtpPass },
          });
          await transporter.sendMail({
            from: `"Guruvayur Dham" <${fromEmail}>`,
            to, subject, text: body,
            html: body.replace(/\n/g, "<br>"),
          });
          await db.notification.update({
            where: { id: notification.id },
            data: { status: "SENT", sentAt: new Date() },
          });
          return NextResponse.json({ success: true, message: "Email sent", notificationId: notification.id });
        }
      } catch (smtpError: any) {
        console.error("SMTP send failed:", smtpError.message);
      }
    }

    return NextResponse.json({
      success: true, queued: true, notificationId: notification.id,
      message: "Email queued. Set SMTP_HOST, SMTP_USER, SMTP_PASS, FROM_EMAIL env vars to enable sending.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/** GET /api/email/send — list recent email notifications */
export async function GET() {
  const notifications = await db.notification.findMany({
    where: { type: "EMAIL" },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, recipient: true, subject: true, status: true, sentAt: true, createdAt: true },
  });
  return NextResponse.json({ notifications });
}
