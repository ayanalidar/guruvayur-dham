import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateRoomPrice, validateCoupon, markCouponUsed, checkEarlyBirdCampaign } from "@/lib/pricing";

// GET /api/pricing?roomSlug=xxx&checkIn=2026-09-10&checkOut=2026-09-12
// Returns the dynamic price breakdown for a room
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const roomSlug = searchParams.get("roomSlug");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");

  if (!roomSlug || !checkIn || !checkOut) {
    return NextResponse.json({ error: "roomSlug, checkIn, checkOut required" }, { status: 400 });
  }

  const ci = new Date(checkIn);
  const co = new Date(checkOut);
  ci.setHours(0, 0, 0, 0);
  co.setHours(0, 0, 0, 0);

  const pricing = await calculateRoomPrice(roomSlug, ci, co);
  const earlyBird = await checkEarlyBirdCampaign(ci);

  let finalTotal = pricing.totalPrice;
  let earlyBirdDiscount = 0;
  if (earlyBird.active) {
    earlyBirdDiscount = Math.round((finalTotal * earlyBird.discountPercent) / 100);
    finalTotal -= earlyBirdDiscount;
  }

  return NextResponse.json({
    roomSlug,
    checkIn: ci,
    checkOut: co,
    nights: pricing.perNightPrices.length,
    perNightPrices: pricing.perNightPrices,
    baseTotal: pricing.breakdown.reduce((s, b) => s + b.basePrice, 0),
    dynamicTotal: pricing.totalPrice,
    earlyBird: { active: earlyBird.active, discountPercent: earlyBird.discountPercent, discount: earlyBirdDiscount, campaignName: earlyBird.campaignName },
    finalTotal,
    breakdown: pricing.breakdown,
  });
}

// POST /api/pricing/validate-coupon · validate a coupon against an amount
export async function POST(req: NextRequest) {
  const { code, bookingAmount } = await req.json();
  const result = await validateCoupon(code, bookingAmount);
  return NextResponse.json(result);
}

export { markCouponUsed };
