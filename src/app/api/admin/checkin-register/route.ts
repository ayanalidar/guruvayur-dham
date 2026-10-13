import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

/**
 * GET /api/admin/checkin-register
 * Returns all checked-in bookings with their check-in register data.
 * Used by the /admin/checkin-register page to display the digital
 * guest register + export for police/FRRO submission.
 *
 * Query: ?export=csv → returns CSV file for police submission
 */
export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  // Get all bookings that have been checked in (CHECKED_IN or CHECKED_OUT)
  const bookings = await db.booking.findMany({
    where: {
      status: { in: ["CHECKED_IN", "CHECKED_OUT"] },
    },
    include: { room: true },
    orderBy: { checkIn: "desc" },
    take: 500,
  });

  // Parse check-in register data from booking notes
  const records = bookings.map((b) => {
    let registerData: any = {};
    try {
      const notes = JSON.parse(b.notes || "{}");
      registerData = notes.checkInDetails || {};
    } catch {}

    return {
      reference: b.reference,
      guestName: b.guestName,
      guestPhone: b.guestPhone,
      guestEmail: b.guestEmail || "",
      roomName: b.room.name,
      roomNumber: b.roomNumber || "",
      checkIn: b.checkIn.toISOString().slice(0, 10),
      checkOut: b.checkOut.toISOString().slice(0, 10),
      nights: b.nights,
      guests: b.guests,
      status: b.status,
      // Check-in register fields (from notes JSON)
      idType: registerData.idType || "",
      idNumber: registerData.idNumber || "",
      nationality: registerData.nationality || "Indian",
      arrivalFrom: registerData.arrivalFrom || "",
      departureTo: registerData.departureTo || "",
      vehicleNumber: registerData.vehicleNumber || "",
      companions: registerData.companions || 0,
      registerComplete: !!registerData.idType,
    };
  });

  // CSV export
  if (req.nextUrl.searchParams.get("export") === "csv") {
    const headers = ["Ref", "Guest Name", "Phone", "Room", "Room No", "Check-in", "Check-out", "Nights", "Guests", "ID Type", "ID Number", "Nationality", "Arrival From", "Departure To", "Vehicle No", "Companions", "Status"];
    const rows = records.map(r => [
      r.reference, r.guestName, r.guestPhone, r.roomName, r.roomNumber,
      r.checkIn, r.checkOut, r.nights, r.guests,
      r.idType, r.idNumber, r.nationality, r.arrivalFrom, r.departureTo,
      r.vehicleNumber, r.companions, r.status,
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));

    const csv = [headers.join(","), ...rows].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="checkin-register-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({ records, total: records.length });
}

/**
 * PATCH /api/admin/checkin-register
 * Updates the check-in register data for a booking (stored as JSON
 * in the booking's notes field).
 *
 * Body: { bookingId, idType, idNumber, nationality, arrivalFrom, departureTo, vehicleNumber, companions }
 */
export async function PATCH(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const body = await req.json();
  const { bookingId, ...registerData } = body;

  if (!bookingId) {
    return NextResponse.json({ error: "bookingId required" }, { status: 400 });
  }

  // Look up by reference (GD-XXXXXX) — frontend passes reference, not Prisma ID
  const booking = await db.booking.findFirst({ where: { reference: bookingId } });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Parse existing notes (might have other data like parentReference etc.)
  let notes: any = {};
  try { notes = JSON.parse(booking.notes || "{}"); } catch {}

  // Merge check-in register data
  notes.checkInDetails = {
    idType: registerData.idType || "",
    idNumber: registerData.idNumber || "",
    nationality: registerData.nationality || "Indian",
    arrivalFrom: registerData.arrivalFrom || "",
    departureTo: registerData.departureTo || "",
    vehicleNumber: registerData.vehicleNumber || "",
    companions: registerData.companions || 0,
    completedAt: new Date().toISOString(),
  };

  await db.booking.update({
    where: { id: bookingId },
    data: { notes: JSON.stringify(notes) },
  });

  return NextResponse.json({ ok: true, message: "Check-in register updated" });
}
