import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { broadcastToChannels } from "@/lib/channel-sync";

/**
 * Channel Partner Webhook — receives bookings from OTAs.
 *
 * Each channel partner POSTs their bookings to this endpoint:
 *   POST /api/channel-webhook/BOOKING_COM
 *   POST /api/channel-webhook/MAKEMYTRIP
 *   POST /api/channel-webhook/GOIBIBO
 *   POST /api/channel-webhook/AGODA
 *
 * Authentication: Bearer token in the Authorization header.
 * The token must match the `webhookUrl` field's query param
 * ?key=XXXX set in the ChannelPartner config, OR the `apiKey` field
 * on the ChannelPartner record (when added).
 *
 * For simplicity, we check the `X-Channel-Key` header against the
 * channel's `webhookUrl` ?key= param. Set this in /admin/settings.
 *
 * Body (from channel partner):
 *   {
 *     channelBookingId: string,
 *     roomSlug: string,
 *     guestName: string,
 *     guestPhone: string,
 *     guestEmail?: string,
 *     checkIn: string (ISO date),
 *     checkOut: string (ISO date),
 *     guests: number,
 *     amount: number (already calculated by channel)
 *   }
 *
 * Response:
 *   200 — booking imported, inventory blocked on all other channels
 *   409 — room sold out for those dates (double-booking prevented)
 *   401 — invalid API key
 *   404 — channel not found
 */

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const channelCode = params.code.toUpperCase();

  // Find the channel
  const channel = await db.channelPartner.findUnique({
    where: { code: channelCode },
  });

  if (!channel) {
    return NextResponse.json(
      { error: `Channel ${channelCode} not found` },
      { status: 404 }
    );
  }

  if (!channel.connected) {
    return NextResponse.json(
      { error: `Channel ${channelCode} is not connected` },
      { status: 403 }
    );
  }

  // Authenticate: check X-Channel-Key header against the webhookUrl ?key= param
  const authHeader = req.headers.get("x-channel-key") || req.headers.get("authorization")?.replace("Bearer ", "");
  const expectedKey = new URL(channel.webhookUrl).searchParams.get("key");

  if (expectedKey && authHeader !== expectedKey) {
    return NextResponse.json(
      { error: "Invalid API key" },
      { status: 401 }
    );
  }

  // Parse the booking payload
  const body = await req.json();
  const {
    channelBookingId,
    roomSlug,
    guestName,
    guestPhone,
    guestEmail,
    checkIn,
    checkOut,
    guests = 2,
    amount,
  } = body;

  // Validate required fields
  if (!channelBookingId || !roomSlug || !guestName || !guestPhone || !checkIn || !checkOut) {
    return NextResponse.json(
      { error: "Missing required fields: channelBookingId, roomSlug, guestName, guestPhone, checkIn, checkOut" },
      { status: 400 }
    );
  }

  // Check for duplicate (idempotency)
  const existing = await db.booking.findFirst({ where: { channelBookingId } });
  if (existing) {
    return NextResponse.json({
      message: "Booking already imported",
      booking: { reference: existing.reference },
    });
  }

  // Find the room
  const room = await db.room.findUnique({ where: { slug: roomSlug } });
  if (!room) {
    return NextResponse.json(
      { error: `Room ${roomSlug} not found` },
      { status: 404 }
    );
  }

  // Parse dates
  const ci = new Date(checkIn);
  const co = new Date(checkOut);
  ci.setHours(0, 0, 0, 0);
  co.setHours(0, 0, 0, 0);
  const nights = Math.round((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24));

  if (nights <= 0) {
    return NextResponse.json(
      { error: "Check-out must be after check-in" },
      { status: 400 }
    );
  }

  // Check availability for each night
  for (let i = 0; i < nights; i++) {
    const d = new Date(ci);
    d.setDate(d.getDate() + i);
    const av = await db.availability.findUnique({
      where: { roomId_date: { roomId: room.id, date: d } },
    });
    if (!av || av.available <= 0) {
      // Room sold out — return 409 so the channel shows "sold out"
      return NextResponse.json({
        error: "ROOM_SOLD_OUT",
        message: `Room ${room.name} is sold out for ${d.toDateString()}`,
        date: d.toISOString(),
      }, { status: 409 });
    }
  }

  // Create the booking
  const ref = "GD-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const finalAmount = amount || Math.round(room.price * nights);

  const booking = await db.booking.create({
    data: {
      reference: ref,
      roomId: room.id,
      guestName,
      guestPhone,
      guestEmail: guestEmail || null,
      checkIn: ci,
      checkOut: co,
      nights,
      guests,
      amount: finalAmount,
      source: channelCode,
      channelBookingId,
      status: "CONFIRMED",
      notes: `Imported from ${channel.name} via webhook`,
    },
  });

  // Block availability in our DB
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

  // Broadcast BLOCK to all OTHER channels
  const syncResults = await broadcastToChannels({
    bookingId: booking.id,
    bookingRef: ref,
    roomSlug: room.slug,
    roomId: room.id,
    checkIn: ci,
    checkOut: co,
    sourceChannel: channelCode,
    action: "BLOCK",
  });

  return NextResponse.json({
    booking: { reference: ref, amount: finalAmount, nights },
    syncResults: {
      inboundFrom: channelCode,
      broadcastTo: syncResults.map((s) => s.channel),
      successCount: syncResults.filter((s) => s.success).length,
      failedCount: syncResults.filter((s) => !s.success).length,
      details: syncResults,
    },
    message: `Booking from ${channel.name} imported. Inventory blocked on ${syncResults.filter((s) => s.success).length}/${syncResults.length} other channels.`,
  });
}

/**
 * GET /api/channel-webhook/[code] — health check for a channel.
 * Returns the channel's connection status + last sync time.
 * Useful for verifying the webhook URL is correct before configuring
 * it in Booking.com / MakeMyTrip partner dashboards.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const channelCode = params.code.toUpperCase();
  const channel = await db.channelPartner.findUnique({
    where: { code: channelCode },
  });

  if (!channel) {
    return NextResponse.json(
      { error: `Channel ${channelCode} not found` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    code: channel.code,
    name: channel.name,
    connected: channel.connected,
    lastSyncAt: channel.lastSyncAt,
    totalBookings: channel.totalBookings,
    webhookUrl: channel.webhookUrl,
    setup: {
      instructions: `Configure this webhook URL in your ${channel.name} partner dashboard:`,
      url: `https://guruvayurdham.com/api/channel-webhook/${channelCode}`,
      method: "POST",
      headers: channel.webhookUrl.includes("key=")
        ? { "X-Channel-Key": "<the key from your admin settings>" }
        : { note: "No API key set. Go to /#/admin/settings → Channel Partners to set one." },
    },
  });
}
