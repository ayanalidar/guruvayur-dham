import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/availability?roomSlug=deluxe-ac-room&days=30
// Returns availability for next N days for a room (or all rooms if no slug)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const slug = searchParams.get("roomSlug");
  const days = parseInt(searchParams.get("days") || "30");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + days);

  const where: any = { date: { gte: today, lt: endDate } };
  if (slug) {
    const room = await db.room.findUnique({ where: { slug } });
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
    where.roomId = room.id;
  }

  const availability = await db.availability.findMany({
    where,
    include: { room: true },
    orderBy: { date: "asc" },
  });

  // Group by room
  const byRoom: Record<string, any> = {};
  for (const a of availability) {
    const key = a.room.slug;
    if (!byRoom[key]) {
      byRoom[key] = {
        roomSlug: key,
        roomName: a.room.name,
        totalUnits: a.room.totalUnits,
        days: [],
      };
    }
    byRoom[key].days.push({
      date: a.date.toISOString().slice(0, 10),
      available: a.available,
      isAvailable: a.available > 0,
    });
  }

  return NextResponse.json({
    availability: slug ? byRoom[slug] : Object.values(byRoom),
  });
}
