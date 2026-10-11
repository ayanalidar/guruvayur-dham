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
  let filterRooms;
  if (slug) {
    const room = await db.room.findUnique({ where: { slug } });
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
    where.roomId = room.id;
    filterRooms = [room];
  } else {
    filterRooms = await db.room.findMany({ where: { active: true } });
  }

  const availability = await db.availability.findMany({
    where,
    include: { room: true },
    orderBy: { date: "asc" },
  });

  // Group by room — include ALL active rooms (even if no availability
  // rows exist for them, which means they're fully available)
  const byRoom: Record<string, any> = {};

  // First, initialize all rooms with default "fully available" status
  for (const r of filterRooms) {
    byRoom[r.slug] = {
      roomSlug: r.slug,
      roomName: r.name,
      totalUnits: r.totalUnits,
      days: [],
    };
  }

  // Then, overlay actual availability data where it exists
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

  // For rooms with no availability rows, add a "fully available" day entry
  // so the frontend shows them as bookable (not "SOLD OUT")
  for (const slug of Object.keys(byRoom)) {
    const room = byRoom[slug];
    if (room.days.length === 0) {
      room.days.push({
        date: today.toISOString().slice(0, 10),
        available: room.totalUnits,
        isAvailable: true,
      });
    }
  }

  return NextResponse.json({
    availability: slug ? byRoom[slug] : Object.values(byRoom),
  }, { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } });
});
