import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/pooja-bookings — list all pooja bookings
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const where: any = {};
  if (status) where.status = status;
  const bookings = await db.poojaBooking.findMany({
    where,
    orderBy: { preferredDate: "asc" },
  });
  return NextResponse.json({ bookings });
}

// POST /api/pooja-bookings — create a pooja booking
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { poojaId, poojaName, guestName, guestPhone, guestEmail, preferredDate, amount, notes } = body;
  if (!poojaId || !poojaName || !guestName || !guestPhone || !preferredDate || !amount) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const ref = "PB-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const booking = await db.poojaBooking.create({
    data: {
      reference: ref,
      poojaId, poojaName,
      guestName, guestPhone, guestEmail: guestEmail || null,
      preferredDate: new Date(preferredDate),
      amount,
      notes: notes || null,
      status: "SCHEDULED",
    },
  });
  // Create reminder for pooja day
  const poojaDate = new Date(preferredDate);
  pooyaReminder(poojaDate, guestName, guestPhone, poojaName, ref);
  // Send notification
  await db.notification.create({
    data: {
      type: "WHATSAPP",
      recipient: guestPhone,
      body: `Your ${poojaName} pooja is booked for ${new Date(preferredDate).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}. Reference: ${ref}. Prasadam will be delivered to your room after the pooja.`,
      status: "QUEUED",
      relatedRef: ref,
    },
  });
  return NextResponse.json({ booking, message: `Pooja booked — reference ${ref}` });
}

// PATCH /api/pooja-bookings — update pooja status (e.g., SCHEDULED → AT_TEMPLE → COMPLETED → PRASADAM_READY)
export async function PATCH(req: NextRequest) {
  const { id, status, prasadamNote } = await req.json();
  const booking = await db.poojaBooking.update({
    where: { id },
    data: { status, prasadamNote: prasadamNote || undefined },
  });
  // If status → PRASADAM_READY, notify guest
  if (status === "PRASADAM_READY") {
    await db.notification.create({
      data: {
        type: "WHATSAPP",
        recipient: booking.guestPhone,
        body: `Your ${booking.poojaName} prasadam is ready! Please collect it from the reception. Reference: ${booking.reference}`,
        status: "QUEUED",
        relatedRef: booking.reference,
      },
    });
  }
  return NextResponse.json({ booking });
}

async function pooyaReminder(date: Date, guestName: string, phone: string, poojaName: string, ref: string) {
  // Reminder 30 min before pooja
  const reminderTime = new Date(date.getTime() - 30 * 60 * 1000);
  await db.reminder.create({
    data: {
      type: "POOJA",
      bookingRef: ref,
      guestName, guestPhone: phone,
      message: `Reminder: Your ${poojaName} pooja is in 30 minutes. Please be ready at the temple.`,
      scheduledFor: reminderTime,
      channel: "WHATSAPP",
    },
  });
}
