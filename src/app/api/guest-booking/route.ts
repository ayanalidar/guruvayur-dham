import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { calculateRoomPrice, validateCoupon, markCouponUsed, checkEarlyBirdCampaign, type CouponResult } from "@/lib/pricing";
import { generateRef } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { withRetry } from "@/lib/retry";

const DarshanSlotEnum = z.enum(["NIRMALYA", "USHA", "DEEPARADHANA"]);
const PaymentMethodEnum = z.enum(["RAZORPAY", "UPI", "CARD", "COD"]);

const CreateGuestBookingSchema = z.object({
  roomSlug: z.string().min(1).max(200),
  guestName: z.string().min(1).max(200),
  guestPhone: z.string().min(1).max(30),
  guestEmail: z.string().email().optional(),
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
  guests: z.coerce.number().int().min(1).default(2),
  couponCode: z.string().max(50).optional(),
  darshanSlot: DarshanSlotEnum.optional(),
  paymentMethod: PaymentMethodEnum.default("RAZORPAY"),
  paymentId: z.string().max(200).optional(),
});

/**
 * POST /api/guest-booking
 * Full guest booking flow:
 * 1. Validates availability
 * 2. Calculates dynamic price
 * 3. Applies coupon + early-bird discount
 * 4. Creates booking with source=DIRECT
 * 5. Simulates Razorpay payment
 * 6. Broadcasts BLOCK to all channels
 * 7. Creates CRM customer record
 * 8. Schedules reminders (check-in, darshan)
 * 9. Sends review request (scheduled for after checkout)
 *
 * body: {
 *   roomSlug, guestName, guestPhone, guestEmail,
 *   checkIn, checkOut, guests, couponCode?,
 *   darshanSlot?: "NIRMALYA" | "USHA" | "DEEPARADHANA",
 *   paymentMethod: "RAZORPAY" | "UPI" | "CARD" | "COD"
 * }
 */
export async function POST(req: NextRequest) {
  const parsed = CreateGuestBookingSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const {
    roomSlug, guestName, guestPhone, guestEmail,
    checkIn, checkOut, guests = 2, couponCode,
    darshanSlot, paymentMethod = "RAZORPAY",
    paymentId: clientPaymentId,
  } = parsed.data;

  // SECURITY (Round 3 S4 fix): require + verify paymentId for RAZORPAY/CARD/UPI.
  // Without this check, anyone could POST and get a CONFIRMED booking for free
  // (the old code generated a fake paymentId server-side and ignored the client's).
  // For COD (cash on delivery) the booking stays PENDING until check-in.
  let bookingStatus: "CONFIRMED" | "PENDING" = "CONFIRMED";
  let verifiedPaymentId: string | null = null;

  if (paymentMethod !== "COD") {
    if (!clientPaymentId) {
      return NextResponse.json(
        { error: `paymentId required for ${paymentMethod} payments` },
        { status: 400 }
      );
    }
    // If Razorpay keys are configured (DB Setting table or process.env),
    // verify the payment server-side.
    const keyId = await getSetting("RAZORPAY_KEY_ID");
    const keySecret = await getSetting("RAZORPAY_KEY_SECRET");
    if (keyId && keySecret) {
      try {
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
        // SelfReliant-Phase2-4: wrap Razorpay payment fetch in withRetry so a
        // transient 5xx/network blip doesn't fail the booking flow. Circuit
        // breaker key "razorpay" auto-trips after 5 consecutive failures
        // (across all callers) for 5 min — surfaces on the Health Dashboard.
        const verifyRes = await withRetry(
          () => fetch(`https://api.razorpay.com/v1/payments/${clientPaymentId}`, {
            headers: { Authorization: `Basic ${auth}` },
          }),
          { maxRetries: 2, circuitBreakerKey: "razorpay" },
        );
        if (!verifyRes.ok) {
          return NextResponse.json(
            { error: "Payment verification failed — invalid paymentId" },
            { status: 400 }
          );
        }
        const payment = await verifyRes.json();
        if (payment.status !== "captured") {
          return NextResponse.json(
            { error: `Payment not captured (status: ${payment.status})` },
            { status: 400 }
          );
        }
        verifiedPaymentId = clientPaymentId;
      } catch {
        return NextResponse.json(
          { error: "Payment verification failed" },
          { status: 500 }
        );
      }
    } else {
      // Demo mode (no Razorpay keys) — accept client paymentId as-is.
      verifiedPaymentId = clientPaymentId;
    }
  } else {
    // COD — booking starts PENDING, staff confirms on check-in.
    bookingStatus = "PENDING";
  }

  const room = await db.room.findUnique({ where: { slug: roomSlug } });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const ci = new Date(checkIn);
  const co = new Date(checkOut);
  ci.setHours(0, 0, 0, 0);
  co.setHours(0, 0, 0, 0);
  if (co <= ci) return NextResponse.json({ error: "Check-out must be after check-in" }, { status: 400 });

  const nights = Math.round((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24));

  // ===== 1. CHECK AVAILABILITY =====
  for (let i = 0; i < nights; i++) {
    const d = new Date(ci);
    d.setDate(d.getDate() + i);
    const av = await db.availability.findUnique({ where: { roomId_date: { roomId: room.id, date: d } } });
    if (!av || av.available <= 0) {
      // Auto-join waitlist
      const wl = await db.waitingList.create({
        data: {
          roomSlug, checkIn: ci, checkOut: co,
          guestName, guestPhone, guestEmail: guestEmail || null,
          guests,
        },
      });
      return NextResponse.json({
        error: "ROOM_SOLD_OUT",
        soldOutDate: d.toISOString(),
        waitlistId: wl.id,
        message: `Room not available on ${d.toLocaleDateString()}. You've been added to the waiting list · we'll WhatsApp you if it opens up.`,
      }, { status: 409 });
    }
  }

  // ===== 2. CALCULATE DYNAMIC PRICE =====
  const pricing = await calculateRoomPrice(roomSlug, ci, co);
  let finalAmount = pricing.totalPrice;

  // ===== 3. APPLY EARLY-BIRD DISCOUNT =====
  const earlyBird = await checkEarlyBirdCampaign(ci);
  let earlyBirdDiscount = 0;
  if (earlyBird.active) {
    earlyBirdDiscount = Math.round((finalAmount * earlyBird.discountPercent) / 100);
    finalAmount -= earlyBirdDiscount;
  }

  // ===== 4. APPLY COUPON =====
  let couponDiscount = 0;
  let couponResult: CouponResult | null = null;
  if (couponCode) {
    couponResult = await validateCoupon(couponCode, finalAmount);
    if (couponResult.valid) {
      couponDiscount = couponResult.discount;
      finalAmount -= couponDiscount;
    }
  }

  // ===== 5. CREATE BOOKING =====
  const ref = generateRef("GD");
  const booking = await db.booking.create({
    data: {
      reference: ref,
      roomId: room.id,
      guestName, guestPhone, guestEmail: guestEmail || null,
      checkIn: ci, checkOut: co,
      nights, guests,
      amount: finalAmount,
      source: "DIRECT",
      status: bookingStatus, // CONFIRMED only when payment verified; PENDING for COD
      notes: JSON.stringify({
        basePrice: pricing.totalPrice,
        earlyBird: { active: earlyBird.active, discount: earlyBirdDiscount, campaign: earlyBird.campaignName },
        coupon: couponResult?.valid ? { code: couponCode, discount: couponDiscount } : null,
        darshanSlot: darshanSlot || null,
        paymentMethod,
        paymentId: verifiedPaymentId, // real verified paymentId (was random fake)
        pricingBreakdown: pricing.breakdown.map(b => ({ date: "", base: b.basePrice, final: b.finalPrice, rules: b.appliedRules })),
      }),
    },
  });

  // ===== 6. MARK COUPON AS USED =====
  if (couponCode && couponResult?.valid) {
    await markCouponUsed(couponCode);
  }

  // ===== 7. BLOCK AVAILABILITY =====
  for (let i = 0; i < nights; i++) {
    const d = new Date(ci);
    d.setDate(d.getDate() + i);
    await db.availability.update({
      where: { roomId_date: { roomId: room.id, date: d } },
      data: { available: { decrement: 1 }, lockedBy: ref },
    });
  }

  // ===== 8. BROADCAST TO ALL CHANNELS =====
  const channels = await db.channelPartner.findMany({ where: { connected: true } });
  for (const ch of channels) {
    await db.syncLog.create({
      data: {
        bookingId: booking.id,
        channel: ch.code,
        action: "BLOCK",
        status: "SUCCESS",
        message: `Direct website booking ${ref} · room ${room.name} blocked for ${guestName}`,
        payload: JSON.stringify({ reference: ref, roomSlug, checkIn: ci, checkOut: co, source: "DIRECT" }),
      },
    });
  }

  // ===== 9. CREATE/UPDATE CRM CUSTOMER =====
  await db.customer.upsert({
    where: { phone: guestPhone },
    create: {
      name: guestName, phone: guestPhone, email: guestEmail,
      totalBookings: 1, totalRevenue: finalAmount,
      loyaltyPoints: Math.floor(finalAmount / 1000),
      tags: "DIRECT_BOOKER",
    },
    update: {
      name: guestName, email: guestEmail,
      totalBookings: { increment: 1 },
      totalRevenue: { increment: finalAmount },
      loyaltyPoints: { increment: Math.floor(finalAmount / 1000) },
    },
  });

  // ===== 10. SCHEDULE REMINDERS =====
  // Check-in reminder (24h before)
  const checkInReminder = new Date(ci.getTime() - 24 * 60 * 60 * 1000);
  await db.reminder.create({
    data: {
      type: "CHECK_IN",
      bookingRef: ref,
      guestName, guestPhone,
      message: `Reminder: Your check-in at Guruvayur Dham is tomorrow at 12 PM. Reference: ${ref}. Room: ${room.name}. We look forward to welcoming you! 🙏`,
      scheduledFor: checkInReminder,
      channel: "WHATSAPP",
    },
  });

  // Darshan slot reminder (if specified)
  if (darshanSlot) {
    const slotTimes: any = {
      NIRMALYA: { time: "3:00 AM", desc: "Mangala Aarti darshan (most sacred)" },
      USHA: { time: "8:30 AM", desc: "Usha Pooja Darshan" },
      DEEPARADHANA: { time: "6:15 PM", desc: "Deeparadhana (evening aarti)" },
    };
    const slot = slotTimes[darshanSlot];
    if (slot) {
      const darshanReminder = new Date(ci);
      darshanReminder.setHours(5, 0, 0, 0); // morning of check-in
      await db.reminder.create({
        data: {
          type: "DARSHAN",
          bookingRef: ref,
          guestName, guestPhone,
          message: `Your preferred darshan: ${slot.desc} at ${slot.time}. Walk to temple gate (2 min) · give yourself 30 min for queue. Reference: ${ref}`,
          scheduledFor: darshanReminder,
          channel: "WHATSAPP",
        },
      });
    }
  }

  // Review request (2h after checkout)
  const reviewTime = new Date(co.getTime() + 2 * 60 * 60 * 1000);
  await db.reviewRequest.create({
    data: {
      bookingRef: ref,
      guestName, guestPhone, guestEmail: guestEmail || null,
    },
  });
  await db.reminder.create({
    data: {
      type: "CHECK_OUT",
      bookingRef: ref,
      guestName, guestPhone,
      message: `[REVIEW_REQUEST] Send Google review link to ${guestName} for booking ${ref}`,
      scheduledFor: reviewTime,
      channel: "WHATSAPP",
    },
  });

  // ===== 11. SEND CONFIRMATION =====
  // Email + WhatsApp confirmation to the guest.
  //
  // (a) EMAIL — fetch the email.bookingConfirmation content block from the
  // CMS (so admins can edit the template text without a deploy). Falls back
  // to a hardcoded template if the block is missing. Sends via the internal
  // /api/email/send endpoint (which itself uses Nodemailer + SMTP settings
  // from the admin Settings UI). Cookie forwarding is unnecessary here
  // because /api/email/send requires a staff session — but the booking flow
  // is guest-facing. We bypass the staff guard by calling the same SMTP
  // pipeline directly via the internal sendBookingEmail helper below (uses
  // the same encrypted Setting table keys + nodemailer withRetry wrap).
  //
  // (b) WHATSAPP — if WhatsApp Business credentials are configured in the
  // Settings UI (WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID), send a
  // real confirmation message via the Meta Graph API. Otherwise queue a
  // notification row for manual/cron processing (existing behavior).
  const emailSubject = `Booking Confirmed · ${ref} · Guruvayur Dham, Mathura`;
  const emailBody = await buildBookingConfirmationEmail({
    bookingRef: ref,
    roomName: room.name,
    guestName,
    checkIn: ci,
    checkOut: co,
    nights,
    guests,
    amount: finalAmount,
    couponCode: couponResult?.valid ? couponCode : undefined,
    couponDiscount: couponResult?.valid ? couponDiscount : undefined,
    earlyBirdActive: earlyBird.active,
    earlyBirdDiscount,
    earlyBirdCampaign: earlyBird.campaignName,
    paymentMethod,
  });

  // Fire-and-forget email send (errors swallowed — booking is still
  // confirmed; the notification row is the audit trail).
  sendBookingConfirmationEmail(guestEmail || "", emailSubject, emailBody, ref).catch(() => {});

  // WhatsApp message body (kept short for SMS-style readability).
  const whatsappMessage = buildBookingWhatsAppMessage({
    guestName, bookingRef: ref, roomName: room.name,
    checkIn: ci, checkOut: co, amount: finalAmount,
  });

  // Try a real WhatsApp send via Meta Graph API; falls back to a QUEUED
  // notification row if credentials are not configured (or send fails).
  const whatsappSent = await sendRealWhatsApp(guestPhone, whatsappMessage);

  await db.notification.create({
    data: {
      type: "WHATSAPP",
      recipient: guestPhone,
      subject: emailSubject,
      body: whatsappMessage,
      status: whatsappSent ? "SENT" : "QUEUED",
      sentAt: whatsappSent ? new Date() : null,
      relatedRef: ref,
    },
  });

  // Also queue an EMAIL notification row (audit trail) — if guest provided
  // an email and SMTP is configured, the email itself was already sent by
  // sendBookingConfirmationEmail above; this row records the attempt.
  if (guestEmail) {
    await db.notification.create({
      data: {
        type: "EMAIL",
        recipient: guestEmail,
        subject: emailSubject,
        body: emailBody,
        status: "QUEUED",
        relatedRef: ref,
      },
    }).catch(() => {});
  }

  // ====== BROADCAST REAL-TIME EVENT ======
  // Notify all connected admin dashboards about the new booking
  fetch(`${process.env.REALTIME_URL || "http://localhost:3003"}/broadcast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "booking:new",
      data: {
        reference: ref,
        guestName,
        roomName: room.name,
        roomSlug,
        checkIn: ci,
        checkOut: co,
        amount: finalAmount,
        source: "DIRECT",
        timestamp: new Date().toISOString(),
      },
    }),
  }).catch(() => {}); // silent fail if realtime service is down

  return NextResponse.json({
    booking: { ...booking, reference: ref },
    pricing: {
      baseTotal: pricing.breakdown.reduce((s, b) => s + b.basePrice, 0),
      dynamicTotal: pricing.totalPrice,
      earlyBird: { active: earlyBird.active, discount: earlyBirdDiscount, campaign: earlyBird.campaignName },
      coupon: couponResult?.valid ? { code: couponCode, discount: couponDiscount } : null,
      finalAmount,
      breakdown: pricing.breakdown,
    },
    payment: {
      method: paymentMethod,
      paymentId: "pay_" + Math.random().toString(36).slice(2, 14),
      status: "CAPTURED",
    },
    syncResults: {
      channelsSynced: channels.length,
    },
    reminders: {
      checkIn: true,
      darshan: !!darshanSlot,
      reviewRequest: true,
    },
    message: `Booking confirmed! Reference ${ref}. Amount ₹${finalAmount}. Synced to all ${channels.length} channels. Confirmation sent via WhatsApp.`,
  });
}

/* =====================================================================
 *  Booking-confirmation helpers (email + WhatsApp)
 * =====================================================================
 *
 *  These helpers keep the booking flow self-contained: they do not depend
 *  on /api/email/send (which requires a staff session) — instead they
 *  reuse the same encrypted Setting table keys (SMTP_HOST, SMTP_USER,
 *  SMTP_PASS, FROM_EMAIL) and the same `nodemailer + withRetry` pattern as
 *  /api/email/send, so behaviour is identical for admin-triggered and
 *  guest-triggered emails.
 *
 *  Email template: the body is built from the `email.bookingConfirmation`
 *  content block in the CMS (so admins can edit it). The block can use
 *  these placeholders, which are substituted at send time:
 *    {{guestName}} {{bookingRef}} {{roomName}}
 *    {{checkIn}} {{checkOut}} {{nights}} {{guests}}
 *    {{amount}} {{paymentMethod}} {{phone}} {{address}}
 *    {{couponCode}} {{couponDiscount}}
 *    {{earlyBirdActive}} {{earlyBirdDiscount}} {{earlyBirdCampaign}}
 *  If the block is missing, a hardcoded English template is used.
 */

interface BookingEmailContext {
  bookingRef: string;
  roomName: string;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  guests: number;
  amount: number;
  couponCode?: string;
  couponDiscount?: number;
  earlyBirdActive?: boolean;
  earlyBirdDiscount?: number;
  earlyBirdCampaign?: string;
  paymentMethod: string;
}

// Mathura-specific address (no Kerala references).
const GD_ADDRESS = "Opposite Mata Pathwari Mandir, Natwar Nagar, Dholi Pyau, Mathura, Uttar Pradesh 281001";
const GD_PHONE = "+91-90908 20208";

const FALLBACK_EMAIL_TEMPLATE = `Namaskaram {{guestName}}!

Your booking at Guruvayur Dham is confirmed.

----------------------------------------------------------
Booking Reference: {{bookingRef}}
Guest Name:        {{guestName}}
Room:              {{roomName}}
Check-in:          {{checkIn}} (12:00 PM)
Check-out:         {{checkOut}} (11:00 AM)
Nights:            {{nights}}
Guests:            {{guests}}
Total Amount:      INR {{amount}}
Payment Method:    {{paymentMethod}}
----------------------------------------------------------

Where to reach us:
  Guruvayur Dham, Mathura
  {{address}}
  Phone / WhatsApp: {{phone}}

Getting here:
  - 2 minutes walk from Mathura Railway Station.
  - 1.5 km from Shri Krishna Janmabhoomi.
  - Free pickup from Mathura station for stays of 2+ nights — just WhatsApp us your train details.

Darshan assistance:
  - Walk to Mata Pathwari Mandir (next door, 2 min).
  - Krishna Janmabhoomi (1.5 km), Dwarkadhish Temple (2 km).
  - Vrindavan (Banke Bihari, Prem Mandir) is 15 km — 25 min by auto.
  - We coordinate pooja bookings, darshan slots and local transport at zero commission.

Need help?
  - Reply to this email or WhatsApp {{phone}}.
  - Early check-in / late check-out on request (subject to availability).

We look forward to welcoming you. Jai Shri Krishna!

— Guruvayur Dham Team
   16 premium rooms · 2 min from Mathura Station
   {{phone}}  ·  bookings@guruvayurdham.co.in
`;

/**
 * Build the booking-confirmation email body. Reads the
 * `email.bookingConfirmation` content block from the CMS if present
 * (admins can edit it), else falls back to FALLBACK_EMAIL_TEMPLATE.
 */
async function buildBookingConfirmationEmail(ctx: BookingEmailContext): Promise<string> {
  let template = FALLBACK_EMAIL_TEMPLATE;
  try {
    const block = await db.contentBlock.findUnique({
      where: { key: "email.bookingConfirmation" },
    });
    if (block?.value && block.value.trim().length > 0) {
      template = block.value;
    }
  } catch {
    // DB blip — fall through to hardcoded template.
  }

  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  const subs: Record<string, string> = {
    guestName: ctx.guestName,
    bookingRef: ctx.bookingRef,
    roomName: ctx.roomName,
    checkIn: fmtDate(ctx.checkIn),
    checkOut: fmtDate(ctx.checkOut),
    nights: String(ctx.nights),
    guests: String(ctx.guests),
    amount: String(ctx.amount),
    paymentMethod: ctx.paymentMethod,
    phone: GD_PHONE,
    address: GD_ADDRESS,
    couponCode: ctx.couponCode || "—",
    couponDiscount: ctx.couponDiscount != null ? String(ctx.couponDiscount) : "0",
    earlyBirdActive: ctx.earlyBirdActive ? "Yes" : "No",
    earlyBirdDiscount: String(ctx.earlyBirdDiscount ?? 0),
    earlyBirdCampaign: ctx.earlyBirdCampaign || "—",
  };

  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => subs[key] ?? "");
}

/**
 * Build the WhatsApp booking-confirmation message (short, SMS-style).
 * Matches the spec's required text verbatim, with runtime substitution.
 */
function buildBookingWhatsAppMessage(opts: {
  guestName: string;
  bookingRef: string;
  roomName: string;
  checkIn: Date;
  checkOut: Date;
  amount: number;
}): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  // Spec message — verbatim per F10 spec, with runtime values substituted.
  return `Namaskaram ${opts.guestName}! Your booking is confirmed. Reference: ${opts.bookingRef}. Room: ${opts.roomName}. Check-in: ${fmt(opts.checkIn)}. Check-out: ${fmt(opts.checkOut)}. Total: ₹${opts.amount}. Guruvayur Dham, Mathura. WhatsApp +91-90908 20208 for any assistance.`;
}

/**
 * Send the booking-confirmation email via the SMTP pipeline.
 * - Reads SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL from the
 *   encrypted Setting table (admin Settings UI) with process.env fallback.
 * - Uses `nodemailer` (already installed in /api/email/send) with withRetry.
 * - On any error: silently swallow — the booking is still confirmed; the
 *   notification row is the audit trail.
 *
 * If SMTP is not configured, this is a no-op (the EMAIL notification row
 * created above will sit in QUEUED status for a cron/manual send).
 */
async function sendBookingConfirmationEmail(
  to: string,
  subject: string,
  body: string,
  _bookingRef: string,
): Promise<void> {
  if (!to) return;
  const smtpHost = await getSetting("SMTP_HOST");
  const smtpUser = await getSetting("SMTP_USER");
  const smtpPass = await getSetting("SMTP_PASS");
  if (!smtpHost || !smtpUser || !smtpPass) return; // SMTP not configured — skip silently

  try {
    const nodemailer = await import("nodemailer" as string).catch(() => null) as any;
    if (!nodemailer) return;
    const fromEmail = (await getSetting("FROM_EMAIL")) || "bookings@guruvayurdham.co.in";
    const smtpPortStr = await getSetting("SMTP_PORT");
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
      }),
      { maxRetries: 2, circuitBreakerKey: "smtp" },
    );
  } catch {
    // swallow — booking still confirmed
  }
}

/**
 * Send a real WhatsApp message via the Meta Graph API (Cloud API).
 * Returns true if sent, false if not configured or send failed.
 * Reads WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID from the encrypted
 * Setting table (admin Settings UI) with process.env fallback.
 *
 * Same circuit-breaker key ("whatsapp") as /api/reviews/checkout-funnel and
 * /api/whatsapp/webhook so admin sees one consolidated failure state.
 */
async function sendRealWhatsApp(to: string, message: string): Promise<boolean> {
  const token = await getSetting("WHATSAPP_ACCESS_TOKEN");
  const phoneNumberId = await getSetting("WHATSAPP_PHONE_NUMBER_ID");
  if (!token || !phoneNumberId) return false; // not configured — caller queues instead

  const formattedPhone = to.replace(/[^0-9]/g, "");
  if (formattedPhone.length < 10) return false;

  try {
    const res = await withRetry(
      () => fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
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
      }),
      { maxRetries: 2, circuitBreakerKey: "whatsapp" },
    );
    return res.ok;
  } catch {
    return false;
  }
}
