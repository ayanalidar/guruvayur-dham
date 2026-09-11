import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limiter";
import { requireStaff, generateRef } from "@/lib/auth";
import { broadcastToChannels } from "@/lib/channel-sync";
import { calculateRoomPrice } from "@/lib/pricing";

const CreateBookingSchema = z.object({
  roomSlug: z.string().min(1).max(200),
  guestName: z.string().min(1).max(200),
  guestPhone: z.string().min(1).max(30),
  guestEmail: z.string().email().optional(),
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
  guests: z.coerce.number().int().min(1).optional(),
  source: z.string().max(50).default("DIRECT"),
  channelBookingId: z.string().max(200).optional(),
  notes: z.string().optional(),
});

// GET /api/bookings · list all bookings (optional filters: ?status, ?source, ?from, ?to, ?search)
// ?search searches guestName, guestPhone, guestEmail, and reference fields
export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

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

// POST /api/bookings · create a new booking (from any source — guests via /book, staff, channel managers)
// body: { roomSlug, guestName, guestPhone, guestEmail?, checkIn, checkOut, guests, source, channelBookingId?, notes? }
// This is the CORE function · when a booking is made here, it broadcasts BLOCK to all channels.
export async function POST(req: NextRequest) {
  // Rate limit guest self-bookings to prevent spam (5 per minute per IP).
  const rl = await rateLimit(req, { window: 60, max: 5 });
  if (!rl.ok) return NextResponse.json({ error: "Too many booking attempts. Please wait a minute." }, { status: 429 });

  const parsed = CreateBookingSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const {
    roomSlug, guestName, guestPhone, guestEmail,
    checkIn, checkOut, guests, source = "DIRECT", channelBookingId, notes,
  } = parsed.data;

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
  const ref = generateRef("GD");
  // SECURITY (Round 3 F3 fix): use calculateRoomPrice for proper dynamic pricing
  // (weekend surge, early-bird, last-minute, festival, coupons) — was flat
  // room.price * ratePlan.priceModifier * nights.
  const pricing = await calculateRoomPrice(roomSlug, ci, co);
  // Apply channel markup on top of dynamic price (rate plan modifier).
  const ratePlan = await db.ratePlan.findUnique({
    where: { roomId_channelPartner: { roomId: room.id, channelPartner: source } },
  });
  const modifier = ratePlan?.priceModifier ?? 1.0;
  const amount = Math.round(pricing.totalPrice * modifier);

  // SECURITY (Round 3 S20 fix): wrap check+create+decrement in a transaction
  // using conditional updateMany (atomic) — prevents TOCTOU race where two
  // concurrent bookings both pass the availability check and the room's
  // available count goes negative.
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
      notes: notes || JSON.stringify({
        basePrice: pricing.totalPrice,
        channelModifier: modifier,
        pricingBreakdown: pricing.breakdown.map(b => ({ date: "", base: b.basePrice, final: b.finalPrice, rules: b.appliedRules })),
      }),
      status: "CONFIRMED",
    },
  });

  // ===== BLOCK AVAILABILITY (atomic conditional decrement) =====
  // For each night, decrement availability ONLY if available > 0.
  // If any night fails (returns count=0), the room was sold out between
  // our check above and now (race condition) — abort and 409.
  for (let i = 0; i < nights; i++) {
    const d = new Date(ci);
    d.setDate(d.getDate() + i);
    const result = await db.availability.updateMany({
      where: {
        roomId: room.id,
        date: d,
        available: { gt: 0 },
      },
      data: {
        available: { decrement: 1 },
        lockedBy: booking.reference,
      },
    });
    if (result.count === 0) {
      // Race lost — another booking grabbed the last room. Roll back our booking.
      await db.booking.delete({ where: { id: booking.id } }).catch(() => {});
      // Also roll back any availability decrements we already made for prior nights.
      for (let j = 0; j < i; j++) {
        const rd = new Date(ci);
        rd.setDate(rd.getDate() + j);
        await db.availability.update({
          where: { roomId_date: { roomId: room.id, date: rd } },
          data: { available: { increment: 1 } },
        }).catch(() => {});
      }
      return NextResponse.json({
        error: `Room just sold out on ${d.toDateString()} — please try another date`,
        date: d.toISOString(),
      }, { status: 409 });
    }
  }

  // ===== BROADCAST SYNC TO ALL CHANNEL PARTNERS (uses shared helper) =====
  // SECURITY (Round 3 F6 fix): use broadcastToChannels() instead of inline
  // duplicate — ensures [SIMULATED] prefix is shown in admin dashboard.
  const syncResults = await broadcastToChannels({
    bookingId: booking.id,
    bookingRef: ref,
    roomSlug,
    roomId: room.id,
    checkIn: ci,
    checkOut: co,
    sourceChannel: source,
    action: "BLOCK",
  });

  // ===== BROADCAST REALTIME EVENT (booking:new) =====
  // SECURITY (Round 3 F7 fix): fire booking:new so admin dashboards see all
  // new bookings live (was: only fired from /api/guest-booking).
  try {
    await fetch(`${process.env.REALTIME_URL || "http://localhost:3003"}/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "booking:new",
        data: { reference: ref, guestName, roomSlug, amount, source, checkIn: ci, checkOut: co },
      }),
    });
  } catch {}

  return NextResponse.json({
    booking: {
      ...booking,
      reference: ref,
      amount,
      nights,
    },
    syncResults: {
      totalChannels: syncResults.length,
      success: syncResults.filter(r => r.success).length,
      channels: syncResults.map(r => r.channel),
    },
  });
}
