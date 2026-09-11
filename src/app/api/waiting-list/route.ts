import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

const CreateWaitingListSchema = z.object({
  roomSlug: z.string().min(1).max(200),
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
  guestName: z.string().min(1).max(200),
  guestPhone: z.string().min(1).max(30),
  guestEmail: z.string().email().optional(),
  guests: z.coerce.number().int().min(1).optional(),
});

const NotifyWaitingListSchema = z.object({
  roomSlug: z.string().min(1).max(200),
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
});

// GET /api/waiting-list · list all waitlist entries
export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const status = req.nextUrl.searchParams.get("status");
  const where: any = {};
  if (status) where.status = status;
  const entries = await db.waitingList.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ entries });
}

// POST /api/waiting-list · join waitlist
export async function POST(req: NextRequest) {
  const parsed = CreateWaitingListSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { roomSlug, checkIn, checkOut, guestName, guestPhone, guestEmail, guests } = parsed.data;
  const entry = await db.waitingList.create({
    data: {
      roomSlug,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guestName, guestPhone, guestEmail: guestEmail || null,
      guests: guests || 2,
    },
  });
  // Create notification log
  await db.notification.create({
    data: {
      type: "WHATSAPP",
      recipient: guestPhone,
      body: `You've been added to the waiting list for ${roomSlug} (${new Date(checkIn).toLocaleDateString()} → ${new Date(checkOut).toLocaleDateString()}). We'll notify you immediately if a room becomes available.`,
      status: "QUEUED",
      relatedRef: `WL-${entry.id.slice(-6)}`,
    },
  });
  return NextResponse.json({ entry, message: "Added to waiting list. We'll WhatsApp you if a room opens up." });
}

// PATCH /api/waiting-list · notify next person in waitlist (when cancellation happens)
// body: { roomSlug, checkIn, checkOut }
export async function PATCH(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = NotifyWaitingListSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { roomSlug, checkIn, checkOut } = parsed.data;
  // Find the next person in line for this room/date range
  const next = await db.waitingList.findFirst({
    where: {
      roomSlug,
      status: "WAITING",
      checkIn: { lte: new Date(checkOut) },
      checkOut: { gte: new Date(checkIn) },
    },
    orderBy: { createdAt: "asc" },
  });
  if (!next) {
    return NextResponse.json({ message: "No one on the waiting list for these dates" });
  }
  // Mark as notified
  await db.waitingList.update({
    where: { id: next.id },
    data: { status: "NOTIFIED", notifiedAt: new Date() },
  });
  // Send notification
  await db.notification.create({
    data: {
      type: "WHATSAPP",
      recipient: next.guestPhone,
      body: `Good news! A ${roomSlug} room just became available for ${new Date(checkIn).toLocaleDateString()} → ${new Date(checkOut).toLocaleDateString()}. You have 2 hours to confirm. Reply YES to book.`,
      status: "QUEUED",
      relatedRef: `WL-${next.id.slice(-6)}`,
    },
  });
  return NextResponse.json({ notified: next, message: `Notified ${next.guestName} · they have 2 hours to confirm` });
}
