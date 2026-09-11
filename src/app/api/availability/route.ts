import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandler } from "@/lib/api-safe";

// GET /api/availability?roomSlug=deluxe-ac-room&days=30
// Returns availability for next N days for a room (or all rooms if no slug)
// FUNCTIONAL (Round 3 F17 fix): wrapped in withErrorHandler so DB blips return
// a proper JSON error instead of a raw 500 HTML page. Also caps `days` to 365
// to prevent unbounded scans (Round 3 M16 fix).
export const GET = withErrorHandler(async (req: NextRequest) => {
  const { searchParams } = req.nextUrl;
  const slug = searchParams.get("roomSlug");
  // M16 fix: cap days to prevent DoS via ?days=999999
  const days = Math.min(parseInt(searchParams.get("days") || "30"), 365);

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
});
