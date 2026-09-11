import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { generateRef } from "@/lib/auth";

const ItineraryItemSchema = z.object({
  day: z.coerce.number().int().min(1).optional(),
  time: z.string().max(50).optional(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  type: z.string().max(50).optional(),
});

const CreateItinerarySchema = z.object({
  guestName: z.string().min(1).max(200),
  guestPhone: z.string().min(1).max(30),
  days: z.coerce.number().int().min(1),
  startDate: z.string().min(1),
  items: z.array(ItineraryItemSchema),
  totalEstimate: z.coerce.number().min(0).optional(),
});

// GET /api/itinerary · list itineraries
export async function GET() {
  const items = await db.itinerary.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ itineraries: items.map(i => ({ ...i, items: JSON.parse(i.items) })) });
}

// POST /api/itinerary · create itinerary
// body: { guestName, guestPhone, days, startDate, items: [{day, time, title, description, type}], totalEstimate }
export async function POST(req: NextRequest) {
  const parsed = CreateItinerarySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const body = parsed.data;
  const ref = generateRef("IT");
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
