import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

/**
 * GET /api/admin/reservations?startDate=2026-09-29&days=7
 *
 * Returns reservation calendar data:
 *   - rooms: list of 15 room numbers with type mapping
 *   - bookings: bookings overlapping the date range, with room assignments
 *   - stats: arrivals, departures, in-house, available counts
 *
 * Auth: any staff role.
 */

const ROOMS = [
  { number: "101", floor: 1, type: "deluxe-room", typeName: "Family Suit / Quad" },
  { number: "102", floor: 1, type: "super-deluxe-room", typeName: "King Deluxe" },
  { number: "103", floor: 1, type: "super-deluxe-room", typeName: "King Deluxe" },
  { number: "104", floor: 1, type: "superior-room", typeName: "Premium Double Bed" },
  { number: "105", floor: 1, type: "superior-room", typeName: "Premium Double Bed" },
  { number: "106", floor: 1, type: "family-comfort-triple-room", typeName: "Family Comfort Triple" },
  { number: "107", floor: 1, type: "family-comfort-triple-room", typeName: "Family Comfort Triple" },
  { number: "201", floor: 2, type: "deluxe-room", typeName: "Family Suit / Quad" },
  { number: "202", floor: 2, type: "super-deluxe-room", typeName: "King Deluxe" },
  { number: "203", floor: 2, type: "super-deluxe-room", typeName: "King Deluxe" },
  { number: "204", floor: 2, type: "super-deluxe-room", typeName: "King Deluxe" },
  { number: "205", floor: 2, type: "superior-room", typeName: "Premium Double Bed" },
  { number: "206", floor: 2, type: "superior-room", typeName: "Premium Double Bed" },
  { number: "207", floor: 2, type: "gvd-suite", typeName: "Privilege Suite" },
  { number: "208", floor: 2, type: "gvd-suite", typeName: "Privilege Suite" },
];

export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const startDateStr = req.nextUrl.searchParams.get("startDate") || new Date().toISOString().slice(0, 10);
  const days = Math.min(parseInt(req.nextUrl.searchParams.get("days") || "7"), 31);

  const startDate = new Date(startDateStr);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + days);

  try {
    const bookings = await db.booking.findMany({
      where: {
        AND: [
          { checkIn: { lt: endDate } },
          { checkOut: { gt: startDate } },
          { status: { not: "CANCELLED" } },
        ],
      },
      include: { room: true },
      orderBy: { checkIn: "asc" },
    });

    const assignedBookings = bookings.map(b => {
      let roomNumber = b.roomNumber;
      if (!roomNumber) {
        const roomsOfType = ROOMS.filter(r => r.type === b.room?.slug);
        for (const r of roomsOfType) {
          const conflict = bookings.some(other =>
            other.id !== b.id &&
            other.roomNumber === r.number &&
            other.checkIn < b.checkOut &&
            other.checkOut > b.checkIn
          );
          if (!conflict) { roomNumber = r.number; break; }
        }
      }
      return {
        id: b.id,
        reference: b.reference,
        guestName: b.guestName,
        guestPhone: b.guestPhone,
        checkIn: b.checkIn.toISOString(),
        checkOut: b.checkOut.toISOString(),
        nights: b.nights,
        amount: b.amount,
        status: b.status,
        source: b.source,
        roomNumber: roomNumber || "UNASSIGNED",
        roomType: b.room?.name || "Unknown",
        roomSlug: b.room?.slug || "",
      };
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [arrivals, departures, inHouse] = await Promise.all([
      db.booking.count({ where: { checkIn: { gte: today, lt: tomorrow }, status: { in: ["CONFIRMED", "CHECKED_IN"] } } }),
      db.booking.count({ where: { checkOut: { gte: today, lt: tomorrow }, status: { in: ["CHECKED_IN", "CHECKED_OUT"] } } }),
      db.booking.count({ where: { checkIn: { lt: tomorrow }, checkOut: { gt: today }, status: { in: ["CONFIRMED", "CHECKED_IN"] } } }),
    ]);

    const dates: Array<{ date: string; dayName: string; dayNum: number; isToday: boolean }> = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      dates.push({
        date: d.toISOString().slice(0, 10),
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        dayNum: d.getDate(),
        isToday: d.getTime() === todayDate.getTime(),
      });
    }

    return NextResponse.json({
      rooms: ROOMS,
      dates,
      bookings: assignedBookings,
      stats: { arrivals, departures, inHouse, available: ROOMS.length - inHouse, totalRooms: ROOMS.length },
    });
  } catch (e: any) {
    console.error("[reservations] Error:", e?.message);
    return NextResponse.json({ error: "Failed to load reservations", message: e?.message }, { status: 500 });
  }
}
