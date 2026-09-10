import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/channel-inbox
 * Simulates a booking coming IN from a channel partner (Booking.com, MakeMyTrip, etc.)
 * When a channel partner makes a booking, they POST to this endpoint.
 * We then create the booking AND broadcast BLOCK to all OTHER channels.
 *
 * In production, each channel partner would have their own webhook URL
 * (e.g. /api/webhooks/booking-com, /api/webhooks/makemytrip)
 * with proper authentication.
 *
 * body: {
 *   channelCode: "BOOKING_COM" | "MAKEMYTRIP" | "GOIBIBO" | "AGODA",
 *   channelBookingId: string,
 *   roomSlug: string,
 *   guestName: string,
 *   guestPhone: string,
 *   guestEmail?: string,
 *   checkIn: string,
 *   checkOut: string,
 *   guests: number,
 *   amount: number (already calculated by channel)
 * }
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    channelCode, channelBookingId, roomSlug,
    guestName, guestPhone, guestEmail,
    checkIn, checkOut, guests = 2, amount,
  } = body;

  // Validate channel
  const channel = await db.channelPartner.findUnique({ where: { code: channelCode } });
  if (!channel || !channel.connected) {
    return NextResponse.json({ error: `Channel ${channelCode} not connected` }, { status: 400 });
  }

  // Check for duplicate
  const existing = channelBookingId
    ? await db.booking.findFirst({ where: { channelBookingId } })
    : null;
  if (existing) {
    return NextResponse.json({
      message: "Booking already imported",
      booking: { reference: existing.reference },
    });
  }

  const room = await db.room.findUnique({ where: { slug: roomSlug } });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const ci = new Date(checkIn);
  const co = new Date(checkOut);
  ci.setHours(0, 0, 0, 0);
  co.setHours(0, 0, 0, 0);
  const nights = Math.round((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24));

  // Check availability
  for (let i = 0; i < nights; i++) {
    const d = new Date(ci);
    d.setDate(d.getDate() + i);
    const av = await db.availability.findUnique({ where: { roomId_date: { roomId: room.id, date: d } } });
    if (!av || av.available <= 0) {
      // CHANNEL CONFLICT · room is already booked
      // In production, we'd return 409 and the channel partner would show "sold out" on their side
      return NextResponse.json({
        error: "ROOM_SOLD_OUT",
        message: `Room ${room.name} is sold out for ${d.toDateString()}`,
        date: d.toISOString(),
      }, { status: 409 });
    }
  }

  // Create the booking
  const ref = "GD-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const finalAmount = amount || Math.round(room.price * (channelCode === "BOOKING_COM" ? 1.18 : channelCode === "MAKEMYTRIP" ? 1.15 : 1.12) * nights);

  const booking = await db.booking.create({
    data: {
      reference: ref,
      roomId: room.id,
      guestName, guestPhone, guestEmail: guestEmail || null,
      checkIn: ci, checkOut: co,
      nights, guests,
      amount: finalAmount,
      source: channelCode,
      channelBookingId,
      status: "CONFIRMED",
      notes: `Imported from ${channel.name} via webhook`,
    },
  });

  // Block availability
  for (let i = 0; i < nights; i++) {
    const d = new Date(ci);
    d.setDate(d.getDate() + i);
    await db.availability.update({
      where: { roomId_date: { roomId: room.id, date: d } },
      data: {
        available: { decrement: 1 },
        lockedBy: booking.reference,
      },
    });
  }

  // Update channel stats
  await db.channelPartner.update({
    where: { code: channelCode },
    data: { lastSyncAt: new Date(), totalBookings: { increment: 1 } },
  });

  // Log the inbound booking
  await db.syncLog.create({
    data: {
      bookingId: booking.id,
      channel: channelCode,
      action: "BOOKING_RECEIVED",
      status: "SUCCESS",
      message: `Booking received from ${channel.name} (${channelBookingId}) · auto-created ${ref}`,
      payload: JSON.stringify({ channelBookingId, reference: ref, guestName }),
    },
  });

  // ===== BROADCAST BLOCK TO ALL OTHER CHANNELS =====
  const otherChannels = await db.channelPartner.findMany({
    where: { connected: true, code: { not: channelCode } },
  });

  for (const ch of otherChannels) {
    await new Promise((r) => setTimeout(r, 100 + Math.random() * 200));
    const success = Math.random() > 0.05;

    await db.syncLog.create({
      data: {
        bookingId: booking.id,
        channel: ch.code,
        action: "BLOCK",
        status: success ? "SUCCESS" : "FAILED",
        message: success
          ? `Inventory blocked on ${ch.name} (sync from ${channel.name} booking ${channelBookingId})`
          : `Failed to sync to ${ch.name}`,
        payload: JSON.stringify({
          sourceChannel: channelCode,
          sourceBookingId: channelBookingId,
          reference: ref,
          roomSlug: room.slug,
          checkIn: ci,
          checkOut: co,
        }),
      },
    });
  }

  return NextResponse.json({
    booking: { ...booking, reference: ref },
    syncResults: {
      inboundFrom: channelCode,
      broadcastTo: otherChannels.map((c) => c.code),
      totalBroadcast: otherChannels.length,
    },
    message: `Booking from ${channel.name} imported. Room blocked on all ${otherChannels.length} other channels.`,
  });
}
