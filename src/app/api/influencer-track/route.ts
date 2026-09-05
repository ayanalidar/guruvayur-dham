import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/influencer-track?code=GDRAJ42
 * Tracks a click from an influencer's unique link.
 * Called when someone visits the site with ?ref=INFLUENCER_CODE
 * Increments click count + logs click details.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "code required" }, { status: 400 });
  }

  const influencer = await db.influencer.findUnique({ where: { uniqueCode: code } });
  if (!influencer) {
    return NextResponse.json({ error: "Invalid code" }, { status: 404 });
  }
  if (influencer.status !== "APPROVED") {
    return NextResponse.json({ error: "This influencer account is not active" }, { status: 403 });
  }

  // Log the click
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ua = req.headers.get("user-agent") || null;
  const ref = req.headers.get("referer") || null;

  await db.influencerClick.create({
    data: {
      influencerId: influencer.id,
      ipAddress: ip,
      userAgent: ua,
      referrer: ref,
    },
  });

  // Increment click count
  await db.influencer.update({
    where: { id: influencer.id },
    data: { totalClicks: { increment: 1 } },
  });

  return NextResponse.json({
    tracked: true,
    influencer: { name: influencer.name, code: influencer.uniqueCode },
    redirect: "/",
  });
}

/**
 * POST /api/influencer-track
 * Mark a click as converted to a booking
 * body: { code, bookingRef }
 */
export async function POST(req: NextRequest) {
  const { code, bookingRef } = await req.json();

  const influencer = await db.influencer.findUnique({ where: { uniqueCode: code } });
  if (!influencer) {
    return NextResponse.json({ error: "Invalid code" }, { status: 404 });
  }

  // Find the most recent unconverted click from this influencer
  const click = await db.influencerClick.findFirst({
    where: {
      influencerId: influencer.id,
      convertedToBooking: false,
    },
    orderBy: { createdAt: "desc" },
  });

  if (click) {
    await db.influencerClick.update({
      where: { id: click.id },
      data: { convertedToBooking: true, bookingRef },
    });
  }

  // Increment booking count + calculate commission
  const booking = await db.booking.findUnique({ where: { reference: bookingRef } });
  const commission = booking ? Math.round(booking.amount * influencer.commissionRate) : 0;

  await db.influencer.update({
    where: { id: influencer.id },
    data: {
      totalBookings: { increment: 1 },
      totalCommission: { increment: commission },
    },
  });

  return NextResponse.json({
    converted: true,
    commission,
    influencer: { name: influencer.name, totalBookings: influencer.totalBookings + 1, totalCommission: influencer.totalCommission + commission },
  });
}
