import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/reviews/checkout-funnel
 *
 * Post-stay review funnel — finds all bookings that checked out ~2 hours ago
 * and haven't been sent a review request yet. Creates a ReviewRequest row
 * and sends a WhatsApp message with a direct Google Reviews link.
 *
 * This endpoint is designed to be called by a cron job every 15 minutes.
 * On Vercel, use Vercel Cron (vercel.json). On Hostinger, use a system
 * crontab (every 15 min) hitting this URL via curl.
 *
 * Flow:
 *   1. Booking checks out at 11:00 AM
 *   2. At 1:00 PM (2hrs later), this endpoint finds the booking
 *   3. Creates a ReviewRequest row (status: PENDING)
 *   4. Sends WhatsApp message with Google Reviews link
 *   5. Marks ReviewRequest as SENT
 *   6. Guest clicks link → leaves review → Google notifies us
 *   7. Admin can mark as COMPLETED in the dashboard
 *
 * The Google Reviews link is editable via CMS content block
 * "reviews.googleLink" (default: https://g.page/r/GURUVAYUR_DHAM/review).
 *
 * Query params:
 *   - ?dryRun=1  — returns what would be sent without actually sending
 *   - ?hours=2   — override the hours-after-checkout window (default: 2)
 */

export async function POST(req: NextRequest) {
  // CRON_SECRET check — prevents unauthorized triggering
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization") || "";
    const queryKey = req.nextUrl.searchParams.get("key") || "";
    if (authHeader !== `Bearer ${cronSecret}` && queryKey !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  const hoursParam = req.nextUrl.searchParams.get("hours");
  const hoursAgo = hoursParam ? parseFloat(hoursParam) : 2;

  // Calculate the checkout window: bookings that checked out ~2 hours ago
  // We use a 15-minute buffer so the cron can run every 15 min without
  // missing any bookings.
  const now = new Date();
  const windowStart = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000 - 15 * 60 * 1000);
  const windowEnd = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

  // Find bookings that checked out in this window and are CONFIRMED/COMPLETED
  const eligibleBookings = await db.booking.findMany({
    where: {
      checkOut: {
        gte: windowStart,
        lte: windowEnd,
      },
      status: { in: ["CONFIRMED", "COMPLETED"] },
    },
  });

  // Filter out bookings that already have a ReviewRequest
  const results: Array<{ bookingRef: string; guestName: string; status: string }> = [];
  let sentCount = 0;
  let skippedCount = 0;

  for (const booking of eligibleBookings) {
    // Skip bookings without a valid phone number
    if (!booking.guestPhone || booking.guestPhone.trim().length < 10) {
      skippedCount++;
      results.push({
        bookingRef: booking.reference,
        guestName: booking.guestName,
        status: "skipped_no_phone",
      });
      continue;
    }
    // Check if we already sent a review request for this booking
    const existing = await db.reviewRequest.findFirst({
      where: { bookingRef: booking.reference },
    });

    if (existing) {
      skippedCount++;
      results.push({
        bookingRef: booking.reference,
        guestName: booking.guestName,
        status: "already_sent",
      });
      continue;
    }

    // Get the Google Reviews link from CMS content blocks (with fallback)
    let reviewLink = "https://g.page/r/GURUVAYUR_DHAM/review";
    try {
      const contentBlock = await db.contentBlock.findUnique({
        where: { key: "reviews.googleLink" },
      });
      if (contentBlock?.value) reviewLink = contentBlock.value;
    } catch {}

    if (dryRun) {
      results.push({
        bookingRef: booking.reference,
        guestName: booking.guestName,
        status: "would_send",
      });
      continue;
    }

    // Create the ReviewRequest record
    const reviewRequest = await db.reviewRequest.create({
      data: {
        bookingRef: booking.reference,
        guestName: booking.guestName,
        guestPhone: booking.guestPhone,
        guestEmail: booking.guestEmail || null,
        reviewLink,
        status: "PENDING",
      },
    });

    // Build the WhatsApp message
    const message = `Namaskaram ${booking.guestName}! 🙏

Thank you for choosing Guruvayur Dham for your stay. We hope you had a blessed visit! 🛕

Your feedback means the world to us. Would you take 60 seconds to share your experience on Google?

👉 ${reviewLink}

It helps other pilgrims find us and helps us serve you better next time.

With gratitude,
Guruvayur Dham Team 🙏`;

    // Try to send via WhatsApp Business API (if configured)
    const whatsappSent = await sendWhatsAppMessage(booking.guestPhone, message);

    // Log the notification
    await db.notification.create({
      data: {
        type: "WHATSAPP",
        recipient: booking.guestPhone,
        body: message,
        status: whatsappSent ? "SENT" : "QUEUED",
        sentAt: whatsappSent ? new Date() : null,
        relatedRef: booking.reference,
      },
    });

    // Update the ReviewRequest status
    await db.reviewRequest.update({
      where: { id: reviewRequest.id },
      data: {
        status: whatsappSent ? "SENT" : "PENDING",
        sentAt: whatsappSent ? new Date() : null,
      },
    });

    sentCount++;
    results.push({
      bookingRef: booking.reference,
      guestName: booking.guestName,
      status: whatsappSent ? "sent" : "queued",
    });
  }

  return NextResponse.json({
    window: {
      start: windowStart.toISOString(),
      end: windowEnd.toISOString(),
      hoursAfterCheckout: hoursAgo,
    },
    totalEligible: eligibleBookings.length,
    sent: sentCount,
    skipped: skippedCount,
    dryRun,
    results,
  });
}

/**
 * Send a WhatsApp message via Meta's WhatsApp Business API.
 * Returns true if sent, false if env vars not set (dev mode) or failed.
 */
async function sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.log("📱 [DEV] WhatsApp message not sent (env vars not set):", message.slice(0, 80));
    return false; // queued, not sent
  }

  // Format phone number (remove spaces, dashes, +; ensure country code)
  const formattedPhone = to.replace(/[^0-9]/g, "");

  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "text",
        text: { body: message },
      }),
    });
    return res.ok;
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error);
    return false;
  }
}
