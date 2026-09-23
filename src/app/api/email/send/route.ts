import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { withRetry } from "@/lib/retry";
import { sendEmailViaHostinger, isHostingerMailConfigured } from "@/lib/email";

const SendEmailSchema = z.object({
  to: z.string().min(1).max(500),
  subject: z.string().min(1).max(500),
  body: z.string().min(1),
  type: z.string().max(50).optional(),
});

/**
 * POST /api/email/send
 *
 * Sends an email notification. Tries Hostinger Mail API first (preferred —
 * 1 token + mailbox ID, no SMTP config, no DKIM/SPF to manage). Falls back
 * to nodemailer SMTP if Hostinger Mail is not configured but SMTP vars are.
 *
 * Body: { to, subject, body, type? }
 *
 * Settings (preferred path — Hostinger Mail API):
 *   - HOSTINGER_MAIL_TOKEN     (Bearer token from hPanel → Agentic Mail → API)
 *   - HOSTINGER_MAILBOX_ID     (mailboxResourceId, found via /api/email/mailboxes)
 *   - HOSTINGER_MAIL_DISPLAY_NAME (optional — defaults to "Guruvayur Dham")
 *
 * Settings (fallback path — SMTP via nodemailer):
 *   - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL
 */
export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  try {
    const parsed = SendEmailSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { to, subject, body, type = "GENERAL" } = parsed.data;

    // Log to Notifications table — track every email attempt regardless of method
    const notification = await db.notification.create({
      data: { type: "EMAIL", recipient: to, subject, body, status: "QUEUED" },
    });

    // ── Path 1: Hostinger Mail API (preferred) ──────────────────────────
    if (await isHostingerMailConfigured()) {
      const result = await sendEmailViaHostinger({
        to,
        subject,
        text: body,
        // SECURITY: HTML-escape body before injecting <br> tags so a
        // customer-supplied value can't XSS the recipient's mail client.
        html: escapeHtml(body).replace(/\n/g, "<br>"),
      });
      if (result.ok) {
        await db.notification.update({
          where: { id: notification.id },
          data: { status: "SENT", sentAt: new Date() },
        });
        return NextResponse.json({
          success: true,
          method: "hostinger-mail",
          message: "Email sent via Hostinger Mail API",
          notificationId: notification.id,
        });
      }
      // Hostinger failed — fall through to SMTP if available, otherwise mark FAILED
      console.error("Hostinger Mail send failed:", result.message);
    }

    // ── Path 2: SMTP via nodemailer (fallback) ──────────────────────────
    const smtpHost = await getSetting("SMTP_HOST");
    const smtpUser = await getSetting("SMTP_USER");
    const smtpPass = await getSetting("SMTP_PASS");
    const fromEmail = (await getSetting("FROM_EMAIL")) || "bookings@guruvayurdham.co.in";
    const smtpPortStr = await getSetting("SMTP_PORT");

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const nodemailer = await import("nodemailer" as string).catch(() => null) as any;
        if (nodemailer) {
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(smtpPortStr || "587"),
            secure: smtpPortStr === "465",
            auth: { user: smtpUser, pass: smtpPass },
          });
          await withRetry(
            () => transporter.sendMail({
              from: `"Guruvayur Dham" <${fromEmail}>`,
              to, subject, text: body,
              html: escapeHtml(body).replace(/\n/g, "<br>"),
            }),
            { maxRetries: 2, circuitBreakerKey: "smtp" },
          );
          await db.notification.update({
            where: { id: notification.id },
            data: { status: "SENT", sentAt: new Date() },
          });
          return NextResponse.json({
            success: true,
            method: "smtp",
            message: "Email sent via SMTP (Hostinger Mail not configured)",
            notificationId: notification.id,
          });
        }
      } catch (smtpError: any) {
        console.error("SMTP send failed:", smtpError.message);
      }
    }

    // Neither method worked — leave as QUEUED for manual processing
    return NextResponse.json({
      success: true, queued: true, notificationId: notification.id,
      message:
        "Email queued. Configure Hostinger Mail API (HOSTINGER_MAIL_TOKEN + HOSTINGER_MAILBOX_ID) or SMTP (SMTP_HOST/USER/PASS/FROM_EMAIL) in Admin → Settings to enable sending.",
    });
  } catch (error: any) {
    console.error("Email send error:", error.message);
    return NextResponse.json({ error: "Email send failed" }, { status: 500 });
  }
}

/**
 * Escape HTML special characters to prevent XSS in email HTML bodies.
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** GET /api/email/send — list recent email notifications */
export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const notifications = await db.notification.findMany({
    where: { type: "EMAIL" },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, recipient: true, subject: true, status: true, sentAt: true, createdAt: true },
  });
  return NextResponse.json({ notifications });
}
