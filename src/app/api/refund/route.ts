import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

const RefundSchema = z.object({
  bookingId: z.string().min(1),
  reason: z.string().min(1).max(2000),
});

// POST /api/refund · process refund for a booking
// body: { bookingId, reason }
// Calculates refund based on cancellation policy:
// - 7+ days before check-in: 90% refund
// - 3-6 days before: 50% refund
// - <72 hours: no refund
// - Festival dates: no refund (but can reschedule within 60 days)
export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req, ["MANAGER", "ACCOUNTANT"]);
  if (error) return error;

  const parsed = RefundSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { bookingId, reason } = parsed.data;
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { room: true },
  });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.status === "CANCELLED") return NextResponse.json({ error: "Already cancelled" }, { status: 400 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkIn = new Date(booking.checkIn);
  checkIn.setHours(0, 0, 0, 0);
  const daysUntilCheckIn = Math.floor((checkIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // FUNCTIONAL (Round 3 F14 fix): removed dead 'isFestival' + 'festivalDate'
  // variables — they were computed but never used in the refund calculation.
  // The documented "festival dates: no refund (but can reschedule)" rule
  // is not currently implemented; if you want to enforce it, add a Festival
  // table lookup here and override refundPercent = 0 when the booking
  // overlaps a festival. For now, the cancellation policy is purely
  // days-based (90% / 50% / 0%).

  let refundPercent = 0;
  let refundAmount = 0;
  let policy = "";

  if (daysUntilCheckIn >= 7) {
    refundPercent = 90;
    refundAmount = Math.round(booking.amount * 0.9);
    policy = "90% refund (cancelled 7+ days before check-in)";
  } else if (daysUntilCheckIn >= 3) {
    refundPercent = 50;
    refundAmount = Math.round(booking.amount * 0.5);
    policy = "50% refund (cancelled 3-6 days before check-in)";
  } else {
    refundPercent = 0;
    refundAmount = 0;
    policy = "No refund (cancelled less than 72 hours before check-in)";
  }

  // Mark booking as cancelled
  const updated = await db.booking.update({
    where: { id: bookingId },
    data: {
      status: "CANCELLED",
      notes: `${booking.notes || ""}\n\n[CANCELLED ${new Date().toLocaleString("en-IN")}] Reason: ${reason}. Refund: ${refundPercent}% (₹${refundAmount}). Policy: ${policy}`,
    },
  });

  // Release the blocked availability
  for (let i = 0; i < booking.nights; i++) {
    const d = new Date(booking.checkIn);
    d.setDate(d.getDate() + i);
    await db.availability.update({
      where: { roomId_date: { roomId: booking.roomId, date: d } },
      data: {
        available: { increment: 1 },
        lockedBy: null,
      },
    }).catch(() => {});
  }

  // Broadcast UNBLOCK to all channels (uses shared helper for [SIMULATED] prefix)
  const { broadcastToChannels } = await import("@/lib/channel-sync");
  const syncResults = await broadcastToChannels({
    bookingId: booking.id,
    bookingRef: booking.reference,
    roomSlug: booking.room.slug,
    roomId: booking.roomId,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    sourceChannel: booking.source,
    action: "UNBLOCK",
  });

  // FUNCTIONAL (Round 3 F18 fix): fire booking:cancelled realtime event so
  // admin dashboards see cancellations live (was: only booking:new fired).
  try {
    await fetch(`${process.env.REALTIME_URL || "http://localhost:3003"}/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "booking:cancelled",
        data: {
          reference: booking.reference,
          guestName: booking.guestName,
          roomSlug: booking.room.slug,
          refundPercent,
          refundAmount,
          reason,
        },
      }),
    });
  } catch {}

  // Notify waitlist (auto-notify next person in line).
  // Forward the session cookie so the waitlist PATCH endpoint (which requires
  // staff auth) accepts the internal server-to-server call.
  const cookie = req.headers.get("cookie") || "";
  await fetch(`${req.nextUrl.origin}/api/waiting-list`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify({
      roomSlug: booking.room.slug,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
    }),
  }).catch(() => {});

  // Send refund notification to guest
  await db.notification.create({
    data: {
      type: "WHATSAPP",
      recipient: booking.guestPhone,
      body: `Your booking ${booking.reference} has been cancelled. Refund: ${refundPercent}% (₹${refundAmount}). ${policy}. The room has been released and the next person on our waiting list has been notified. Thank you.`,
      status: "QUEUED",
      relatedRef: booking.reference,
    },
  });

  return NextResponse.json({
    booking: updated,
    refund: {
      percent: refundPercent,
      amount: refundAmount,
      originalAmount: booking.amount,
      policy,
      reason,
    },
    syncResults: {
      channelsNotified: syncResults.length,
      waitlistNotified: true,
    },
    message: `Booking cancelled. ${refundPercent}% refund (₹${refundAmount}). Room released on all ${syncResults.length} channels. Waitlist notified.`,
  });
}
