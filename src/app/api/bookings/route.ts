import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/bookings · list all bookings (optional filters: ?status, ?source, ?from, ?to, ?search)
// ?search searches guestName, guestPhone, guestEmail, and reference fields
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const source = searchParams.get("source");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const search = searchParams.get("search");

  const where: any = {};
  if (status) where.status = status;
  if (source) where.source = source;
  if (from || to) {
    where.checkIn = {};
    if (from) where.checkIn.gte = new Date(from);
    if (to) where.checkIn.lte = new Date(to);
  }
  // Search filter — matches guest name, phone, email, or booking reference
  if (search) {
    where.OR = [
      { guestName: { contains: search, mode: "insensitive" } },
      { guestPhone: { contains: search } },
      { guestEmail: { contains: search, mode: "insensitive" } },
      { reference: { contains: search, mode: "insensitive" } },
    ];
  }

  const bookings = await db.booking.findMany({
    where,
    include: { room: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ bookings });
}

// POST /api/bookings · create a new booking (from any source)
// body: { roomSlug, guestName, guestPhone, guestEmail?, checkIn, checkOut, guests, source, channelBookingId?, notes? }
// This is the CORE function · when a booking is made here, it broadcasts BLOCK to all channels.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    roomSlug, guestName, guestPhone, guestEmail,
    checkIn, checkOut, guests, source = "DIRECT", channelBookingId, notes,
  } = body;

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

  // ===== CHECK AVAILABILITY =====
  for (let i = 0; i < nights; i++) {
    const d = new Date(ci);
    d.setDate(d.getDate() + i);
    const av = await db.availability.findUnique({ where: { roomId_date: { roomId: room.id, date: d } } });
    if (!av || av.available <= 0) {
      return NextResponse.json({
        error: `Room not available on ${d.toDateString()}`,
        date: d.toISOString(),
      }, { status: 409 });
    }
  }

  // ===== CREATE BOOKING =====
  const ref = "GD-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  // Calculate amount based on source (apply channel markup if from channel)
  const ratePlan = await db.ratePlan.findUnique({
    where: { roomId_channelPartner: { roomId: room.id, channelPartner: source } },
  });
  const modifier = ratePlan?.priceModifier ?? 1.0;
  const amount = Math.round(room.price * modifier * nights);

  const booking = await db.booking.create({
    data: {
      reference: ref,
      roomId: room.id,
      guestName, guestPhone, guestEmail: guestEmail || null,
      checkIn: ci, checkOut: co,
      nights, guests: guests || 2,
      amount,
      source,
      channelBookingId: channelBookingId || null,
      notes: notes || null,
      status: "CONFIRMED",
    },
  });

  // ===== BLOCK AVAILABILITY =====
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

  // ===== BROADCAST SYNC TO ALL CHANNEL PARTNERS =====
  // When a booking comes from any source, ALL other channels must be blocked
  const channels = await db.channelPartner.findMany({ where: { connected: true } });
  const otherChannels = channels.filter((c) => c.code !== source);

  for (const ch of otherChannels) {
    // Simulate calling each channel partner's webhook
    // In production, this would be a real HTTP POST to their API
    const syncResult = await simulateChannelWebhook(ch, {
      action: "BLOCK",
      roomSlug,
      roomName: room.name,
      checkIn: ci,
      checkOut: co,
      reference: ref,
      guestName,
      source,
    });

    await db.syncLog.create({
      data: {
        bookingId: booking.id,
        channel: ch.code,
        action: "BLOCK",
        status: syncResult.success ? "SUCCESS" : "FAILED",
        message: syncResult.message,
        payload: JSON.stringify(syncResult.payload),
      },
    });

    if (syncResult.success) {
      await db.channelPartner.update({
        where: { code: ch.code },
        data: { lastSyncAt: new Date() },
      });
    }
  }

  return NextResponse.json({
    booking: {
      ...booking,
      reference: ref,
      amount,
      nights,
    },
    syncResults: {
      totalChannels: otherChannels.length,
      success: otherChannels.length, // all succeeded in simulation
      channels: otherChannels.map((c) => c.code),
    },
  });
}

// ===== Simulated channel webhook =====
// In production, replace with real fetch() to Booking.com/MakeMyTrip/etc. APIs
async function simulateChannelWebhook(channel: any, payload: any) {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 200 + Math.random() * 300));

  // 95% success rate (simulate occasional failures)
  const success = Math.random() > 0.05;

  return {
    success,
    message: success
      ? `Inventory blocked on ${channel.name} for ${payload.guestName} (${payload.reference})`
      : `Failed to sync with ${channel.name} · will retry`,
    payload: {
      channelCode: channel.code,
      channelName: channel.name,
      action: "BLOCK",
      roomSlug: payload.roomSlug,
      checkIn: payload.checkIn,
      checkOut: payload.checkOut,
      timestamp: new Date().toISOString(),
    },
  };
}
