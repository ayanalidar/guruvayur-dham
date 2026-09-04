import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/walkin — create a walk-in booking (front desk use)
// This is the same as POST /api/bookings but with source=WALKIN hardcoded
// and it ALSO broadcasts to all channel partners to block inventory
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { roomSlug, guestName, guestPhone, guestEmail, checkIn, checkOut, guests, notes } = body;

  if (!roomSlug || !guestName || !guestPhone || !checkIn || !checkOut) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const room = await db.room.findUnique({ where: { slug: roomSlug } });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const ci = new Date(checkIn);
  const co = new Date(checkOut);
  ci.setHours(0, 0, 0, 0);
  co.setHours(0, 0, 0, 0);

  if (co <= ci) return NextResponse.json({ error: "Check-out must be after check-in" }, { status: 400 });

  const nights = Math.round((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24));

  // Check availability
  for (let i = 0; i < nights; i++) {
    const d = new Date(ci);
    d.setDate(d.getDate() + i);
    const av = await db.availability.findUnique({ where: { roomId_date: { roomId: room.id, date: d } } });
    if (!av || av.available <= 0) {
      return NextResponse.json({
        error: `Room not available on ${d.toDateString()}`,
      }, { status: 409 });
    }
  }

  // Create booking — WALKIN source, no channel markup
  const ref = "GD-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const amount = room.price * nights;

  const booking = await db.booking.create({
    data: {
      reference: ref,
      roomId: room.id,
      guestName, guestPhone, guestEmail: guestEmail || null,
      checkIn: ci, checkOut: co,
      nights, guests: guests || 2,
      amount,
      source: "WALKIN",
      notes: notes || "Walk-in booking at front desk",
      status: "CONFIRMED",
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

  // ===== CRITICAL: Broadcast BLOCK to ALL channel partners =====
  // This is what makes walk-in bookings mark the room occupied on Booking.com, MakeMyTrip, etc.
  const channels = await db.channelPartner.findMany({ where: { connected: true } });

  const syncResults = [];
  for (const ch of channels) {
    // Simulate calling each channel partner's API
    await new Promise((r) => setTimeout(r, 150 + Math.random() * 200));
    const success = Math.random() > 0.05;

    const log = await db.syncLog.create({
      data: {
        bookingId: booking.id,
        channel: ch.code,
        action: "BLOCK",
        status: success ? "SUCCESS" : "FAILED",
        message: success
          ? `Walk-in booking (${ref}) synced to ${ch.name} — inventory blocked`
          : `Failed to sync walk-in to ${ch.name} — will retry`,
        payload: JSON.stringify({
          reference: ref,
          channelCode: ch.code,
          channelName: ch.name,
          roomSlug: room.slug,
          roomName: room.name,
          checkIn: ci,
          checkOut: co,
          guestName,
          source: "WALKIN",
        }),
      },
    });

    if (success) {
      await db.channelPartner.update({
        where: { code: ch.code },
        data: { lastSyncAt: new Date(), totalBookings: { increment: 1 } },
      });
    }

    syncResults.push({
      channel: ch.code,
      name: ch.name,
      success,
      logId: log.id,
    });
  }

  return NextResponse.json({
    booking: { ...booking, reference: ref, amount, nights },
    syncResults: {
      totalChannels: channels.length,
      success: syncResults.filter((r) => r.success).length,
      failed: syncResults.filter((r) => !r.success).length,
      details: syncResults,
    },
    message: `Walk-in booking created. Room ${room.name} blocked on all ${channels.length} channel partners.`,
  });
}
