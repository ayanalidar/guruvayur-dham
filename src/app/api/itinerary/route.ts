import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/itinerary · list itineraries
export async function GET() {
  const items = await db.itinerary.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ itineraries: items.map(i => ({ ...i, items: JSON.parse(i.items) })) });
}

// POST /api/itinerary · create itinerary
// body: { guestName, guestPhone, days, startDate, items: [{day, time, title, description, type}], totalEstimate }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const ref = "IT-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const itinerary = await db.itinerary.create({
    data: {
      reference: ref,
      guestName: body.guestName,
      guestPhone: body.guestPhone,
      days: body.days,
      startDate: new Date(body.startDate),
      items: JSON.stringify(body.items),
      totalEstimate: body.totalEstimate || 0,
    },
  });
  return NextResponse.json({ itinerary: { ...itinerary, items: body.items } });
}
