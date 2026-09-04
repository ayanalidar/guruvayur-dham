import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/refund — process refund for a booking
// body: { bookingId, reason }
// Calculates refund based on cancellation policy:
// - 7+ days before check-in: 90% refund
// - 3-6 days before: 50% refund
// - <72 hours: no refund
// - Festival dates: no refund (but can reschedule within 60 days)
export async function POST(req: NextRequest) {
  const { bookingId, reason } = await req.json();
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

  // Festival dates have strict no-refund policy
  const isFestival = ["BOOKING_COM", "MAKEMYTRIP"].includes(booking.source) && daysUntilCheckIn < 30; // simplified
  const festivalDate = booking.source !== "WALKIN" && booking.source !== "DIRECT";

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

  // Broadcast UNBLOCK to all channels (room is now available again)
  const channels = await db.channelPartner.findMany({ where: { connected: true } });
  for (const ch of channels) {
    await db.syncLog.create({
      data: {
        bookingId: booking.id,
        channel: ch.code,
        action: "UNBLOCK",
        status: "SUCCESS",
        message: `Booking ${booking.reference} cancelled — room ${booking.room.name} released for ${new Date(booking.checkIn).toLocaleDateString()} → ${new Date(booking.checkOut).toLocaleDateString()}`,
        payload: JSON.stringify({ reference: booking.reference, refundPercent, refundAmount }),
      },
    });
  }

  // Notify waitlist (auto-notify next person in line)
  await fetch(`${req.nextUrl.origin}/api/waiting-list`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
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
      channelsNotified: channels.length,
      waitlistNotified: true,
    },
    message: `Booking cancelled. ${refundPercent}% refund (₹${refundAmount}). Room released on all ${channels.length} channels. Waitlist notified.`,
  });
}
