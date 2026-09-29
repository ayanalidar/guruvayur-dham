import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { getSetting } from "@/lib/settings";

// Default room config (used if CMS doesn't have one)
const DEFAULT_ROOMS = [
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

/**
 * GET /api/admin/reservations?startDate=YYYY-MM-DD&days=7
 * Returns calendar data: rooms, dates, bookings (auto-assigned), stats.
 */
export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const startDateStr = req.nextUrl.searchParams.get("startDate") || new Date().toISOString().slice(0, 10);
  const days = Math.min(parseInt(req.nextUrl.searchParams.get("days") || "7"), 31);

  // Read room config from CMS (editable); fallback to defaults
  let ROOMS = DEFAULT_ROOMS;
  try {
    const cmsRooms = await getSetting("reservation.rooms");
    if (cmsRooms) {
      const parsed = JSON.parse(cmsRooms);
      if (Array.isArray(parsed) && parsed.length > 0) ROOMS = parsed;
    }
  } catch { /* use defaults */ }

  const startDate = new Date(startDateStr); startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(startDate); endDate.setDate(endDate.getDate() + days);

  try {
    const bookings = await db.booking.findMany({
      where: { AND: [{ checkIn: { lt: endDate } }, { checkOut: { gt: startDate } }, { status: { not: "CANCELLED" } }] },
      include: { room: true },
      orderBy: { checkIn: "asc" },
    });

    const assignedBookings = bookings.map(b => {
      let roomNumber = b.roomNumber;
      if (!roomNumber) {
        const roomsOfType = ROOMS.filter((r: any) => r.type === b.room?.slug);
        for (const r of roomsOfType) {
          const conflict = bookings.some(other => other.id !== b.id && other.roomNumber === r.number && other.checkIn < b.checkOut && other.checkOut > b.checkIn);
          if (!conflict) { roomNumber = r.number; break; }
        }
      }
      return {
        id: b.id, reference: b.reference, guestName: b.guestName, guestPhone: b.guestPhone,
        checkIn: b.checkIn.toISOString(), checkOut: b.checkOut.toISOString(), nights: b.nights,
        amount: b.amount, status: b.status, source: b.source,
        roomNumber: roomNumber || "UNASSIGNED", roomType: b.room?.name || "Unknown", roomSlug: b.room?.slug || "",
      };
    });

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const [arrivals, departures, inHouse] = await Promise.all([
      db.booking.count({ where: { checkIn: { gte: today, lt: tomorrow }, status: { in: ["CONFIRMED", "CHECKED_IN"] } } }),
      db.booking.count({ where: { checkOut: { gte: today, lt: tomorrow }, status: { in: ["CHECKED_IN", "CHECKED_OUT"] } } }),
      db.booking.count({ where: { checkIn: { lt: tomorrow }, checkOut: { gt: today }, status: { in: ["CONFIRMED", "CHECKED_IN"] } } }),
    ]);

    const dates: Array<{ date: string; dayName: string; dayNum: number; isToday: boolean }> = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate); d.setDate(d.getDate() + i);
      const td = new Date(); td.setHours(0, 0, 0, 0);
      dates.push({ date: d.toISOString().slice(0, 10), dayName: d.toLocaleDateString("en-US", { weekday: "short" }), dayNum: d.getDate(), isToday: d.getTime() === td.getTime() });
    }

    return NextResponse.json({ rooms: ROOMS, dates, bookings: assignedBookings, stats: { arrivals, departures, inHouse, available: ROOMS.length - inHouse, totalRooms: ROOMS.length } });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to load reservations", message: e?.message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/reservations
 *
 * Update a booking's room number and/or guest name.
 * Body: { bookingId, roomNumber?, guestName? }
 *
 * Auth: any staff role.
 */
const UpdateSchema = z.object({
  bookingId: z.string().min(1),
  roomNumber: z.string().max(10).optional(),
  guestName: z.string().max(200).optional(),
});

export async function PATCH(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = UpdateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { bookingId, roomNumber, guestName } = parsed.data;

  try {
    const data: any = {};
    if (roomNumber !== undefined) data.roomNumber = roomNumber || null;
    if (guestName !== undefined) data.guestName = guestName;

    const updated = await db.booking.update({
      where: { id: bookingId },
      data,
      select: {
        id: true, reference: true, guestName: true, roomNumber: true,
        checkIn: true, checkOut: true, status: true, source: true,
      },
    });

    return NextResponse.json({ ok: true, booking: updated });
  } catch (e: any) {
    console.error("[reservations PATCH] Error:", e?.message);
    return NextResponse.json({ error: "Failed to update booking", message: e?.message }, { status: 500 });
  }
}

/**
 * PUT /api/admin/reservations
 *
 * Update room configuration (the 15 room numbers + type mappings).
 * Body: { rooms: [{ number, floor, type, typeName }] }
 *
 * Stored as a CMS content block: reservation.rooms (JSON string).
 */
const RoomConfigSchema = z.object({
  rooms: z.array(z.object({
    number: z.string().max(10),
    floor: z.number().int(),
    type: z.string().max(200),
    typeName: z.string().max(200),
  })).min(1).max(100),
});

export async function PUT(req: NextRequest) {
  const { error } = await requireStaff(req, ["MANAGER"]);
  if (error) return error;

  const parsed = RoomConfigSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid room config", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const json = JSON.stringify(parsed.data.rooms);
    await db.contentBlock.upsert({
      where: { key: "reservation.rooms" },
      create: { key: "reservation.rooms", value: json, category: "reservation", label: "Room Configuration (15 rooms)" },
      update: { value: json },
    });

    return NextResponse.json({ ok: true, rooms: parsed.data.rooms });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to save room config", message: e?.message }, { status: 500 });
  }
}
