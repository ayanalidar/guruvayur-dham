import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { sendEmailViaHostinger, isHostingerMailConfigured } from "@/lib/email";

const TestEmailSchema = z.object({
  to: z.string().email(),
});

/**
 * POST /api/email/test
 *
 * Sends a real test email to the supplied address via Hostinger Mail API.
 * If Hostinger Mail is not configured, returns a clear "not configured"
 * error so the admin can see they need to set the env vars first.
 *
 * This is wired to the "Send Test Email" button in Admin → Settings → Integration.
 *
 * Body: { to: "any@email.com" }
 */
export async function POST(req: NextRequest) {
  // Any staff can send a test email (not just MANAGER) — useful for
  // receptionists to verify email is working before a shift.
  const { error } = await requireStaff(req);
  if (error) return error;

  try {
    const parsed = TestEmailSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const { to } = parsed.data;

    if (!(await isHostingerMailConfigured())) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Hostinger Mail not configured. Set HOSTINGER_MAIL_TOKEN + HOSTINGER_MAILBOX_ID in Admin → Settings → Integration first.",
        },
        { status: 400 },
      );
    }

    const subject = "Guruvayur Dham · Test Email";
    const text = `Namaskaram!

This is a test email from the Guruvayur Dham booking platform.

If you're reading this, the Hostinger Mail API integration is working correctly. Booking-confirmation emails will be sent through the same channel.

— Guruvayur Dham
Mata Pathwari Mandir, Natwar Nagar, Dholi Pyau, Mathura 281001
+91-90908 20208 · bookings@guruvayurdham.co.in`;

    const html = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1f1f1f;">
  <p>Namaskaram!</p>
  <p>This is a <strong>test email</strong> from the Guruvayur Dham booking platform.</p>
  <p>If you're reading this, the <strong>Hostinger Mail API</strong> integration is working correctly. Booking-confirmation emails will be sent through the same channel.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
  <p style="font-size: 12px; color: #666;">
    Guruvayur Dham<br />
    Mata Pathwari Mandir, Natwar Nagar, Dholi Pyau, Mathura 281001<br />
    <a href="tel:+919090820208">+91-90908 20208</a> ·
    <a href="mailto:bookings@guruvayurdham.co.in">bookings@guruvayurdham.co.in</a>
  </p>
</div>`;

    const result = await sendEmailViaHostinger({
      to,
      subject,
      text,
      html,
    });

    if (result.ok) {
      return NextResponse.json({
        ok: true,
        message: `Test email sent to ${to} via Hostinger Mail API`,
        method: result.method,
        responseStatus: result.responseStatus,
      });
    }

    return NextResponse.json(
      {
        ok: false,
        error: result.message,
        method: result.method,
        responseStatus: result.responseStatus,
        responseBody: result.responseBody,
      },
      { status: 502 },
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Test email send failed" },
      { status: 500 },
    );
  }
}
