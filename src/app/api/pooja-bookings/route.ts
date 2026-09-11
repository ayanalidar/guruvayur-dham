import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff, generateRef } from "@/lib/auth";

const PoojaBookingStatusEnum = z.enum([
  "SCHEDULED",
  "AT_TEMPLE",
  "COMPLETED",
  "PRASADAM_READY",
  "PICKED_UP",
  "CANCELLED",
]);

const CreatePoojaBookingSchema = z.object({
  poojaId: z.string().min(1),
  poojaName: z.string().min(1).max(200),
  guestName: z.string().min(1).max(200),
  guestPhone: z.string().min(1).max(30),
  guestEmail: z.string().email().optional(),
  preferredDate: z.string().min(1),
  amount: z.coerce.number().min(0),
  notes: z.string().optional(),
});

const UpdatePoojaBookingSchema = z.object({
  id: z.string().min(1),
  status: PoojaBookingStatusEnum,
  prasadamNote: z.string().optional(),
});

// GET /api/pooja-bookings · list all pooja bookings
export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const status = req.nextUrl.searchParams.get("status");
  const where: any = {};
  if (status) where.status = status;
  const bookings = await db.poojaBooking.findMany({
    where,
    orderBy: { preferredDate: "asc" },
  });
  return NextResponse.json({ bookings });
}

// POST /api/pooja-bookings · create a pooja booking
export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = CreatePoojaBookingSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { poojaId, poojaName, guestName, guestPhone, guestEmail, preferredDate, amount, notes } = parsed.data;
  const ref = generateRef("PB");
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
  return NextResponse.json({ booking, message: `Pooja booked · reference ${ref}` });
}

// PATCH /api/pooja-bookings · update pooja status (e.g., SCHEDULED → AT_TEMPLE → COMPLETED → PRASADAM_READY)
export async function PATCH(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = UpdatePoojaBookingSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { id, status, prasadamNote } = parsed.data;
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
