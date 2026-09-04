import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/early-bird — list active campaigns
export async function GET() {
  const campaigns = await db.earlyBirdCampaign.findMany({ orderBy: { startDate: "desc" } });
  return NextResponse.json({ campaigns });
}

// POST /api/early-bird — create campaign
export async function POST(req: NextRequest) {
  const body = await req.json();
  const campaign = await db.earlyBirdCampaign.create({
    data: {
      name: body.name,
      festivalName: body.festivalName,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      discountPercent: body.discountPercent || 15,
      bookingWindowStart: new Date(body.bookingWindowStart),
      bookingWindowEnd: new Date(body.bookingWindowEnd),
    },
  });
  return NextResponse.json({ campaign });
}
