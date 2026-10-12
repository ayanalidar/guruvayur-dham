import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ROOMS, SITE } from "@/lib/site-data";

export const dynamic = "force-dynamic";

/**
 * GET /api/ical/availability
 * GET /api/ical/availability?room=deluxe-room
 * GET /api/ical/availability?combined=true
 *
 * Generates an iCal feed of BOOKED dates for OTA extranet import.
 *
 * OTAs (Booking.com, Agoda, Airbnb, Expedia) import this URL into their
 * extranet calendar → they see which dates are blocked → they don't
 * sell rooms that are already booked → prevents overbooking.
 *
 * Setup:
 *   1. Go to Booking.com Extranet → Rates & Availability → Calendar
 *      → Import calendar → paste this URL
 *   2. Go to Agoda Extranet → Calendar → Import iCal → paste this URL
 *   3. Go to Airbnb → Listings → Calendar → Import → paste this URL
 *
 * The feed contains VEVENT blocks for each booking:
 *   BEGIN:VEVENT
 *     UID:booking-GD-ABC123-20261115@guruvayurdham.co.in
 *     DTSTART;VALUE=DATE:20261115
 *     DTEND;VALUE=DATE:20261117
 *     SUMMARY:Booked
 *   END:VEVENT
 *
 * Per-room feeds (?room=deluxe-room) only show bookings for that room
 * type — useful if OTAs have separate listings per room.
 *
 * Combined feed (default, no ?room param) shows ALL bookings across
 * ALL room types — OTAs can use this to see total property availability.
 */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("room");

  // Fetch all confirmed bookings (not cancelled)
  const where: any = {
    status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] },
  };

  // If a specific room slug is requested, filter by room
  if (slug) {
    const room = await db.room.findUnique({ where: { slug } });
    if (!room) {
      return new NextResponse("Room not found", { status: 404 });
    }
    where.roomId = room.id;
  }

  const bookings = await db.booking.findMany({
    where,
    include: { room: true },
    orderBy: { checkIn: "asc" },
    take: 500, // limit to prevent huge feeds
  });

  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  // Generate iCal VEVENT for each booking
  const events = bookings.map((b) => {
    const dtStart = b.checkIn.toISOString().slice(0, 10).replace(/-/g, "");
    const dtEnd = b.checkOut.toISOString().slice(0, 10).replace(/-/g, "");
    const uid = `booking-${b.reference}-${dtStart}@${SITE.domain}`;

    return `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART;VALUE=DATE:${dtStart}
DTEND;VALUE=DATE:${dtEnd}
SUMMARY:Booked
DESCRIPTION:${b.guestName} - ${b.room.name} - Ref: ${b.reference}
END:VEVENT`;
  }).join("\r\n");

  const calendarName = slug
    ? `${SITE.name} - ${ROOMS.find(r => r.slug === slug)?.name || slug}`
    : `${SITE.name} - All Rooms`;

  const ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//${SITE.name}//Availability//EN
X-WR-CALNAME:${calendarName}
X-WR-TIMEZONE:Asia/Kolkata
CALSCALE:GREGORIAN
METHOD:PUBLISH
${events}
END:VCALENDAR`;

  return new NextResponse(ical, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="${slug || "availability"}.ics"`,
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
