import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

// GET /api/reminders · list pending reminders
export async function GET(req: NextRequest) {
  const sent = req.nextUrl.searchParams.get("sent") === "true";
  const where: any = {};
  if (req.nextUrl.searchParams.get("sent") !== null) where.sent = sent;
  const reminders = await db.reminder.findMany({
    where,
    orderBy: { scheduledFor: "asc" },
    take: 100,
  });
  return NextResponse.json({ reminders });
}

// POST /api/reminders · create a reminder
export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const body = await req.json();
  const { type, bookingRef, guestName, guestPhone, message, scheduledFor, channel } = body;
  const reminder = await db.reminder.create({
    data: {
      type, bookingRef, guestName, guestPhone, message,
      scheduledFor: new Date(scheduledFor),
      channel: channel || "WHATSAPP",
    },
  });
  return NextResponse.json({ reminder });
}

// PATCH /api/reminders · mark as sent (and create notification log)
export async function PATCH(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const { id } = await req.json();
  const reminder = await db.reminder.update({
    where: { id },
    data: { sent: true, sentAt: new Date() },
  });
  await db.notification.create({
    data: {
      type: reminder.channel,
      recipient: reminder.guestPhone,
      body: reminder.message,
      status: "SENT",
      sentAt: new Date(),
      relatedRef: reminder.bookingRef,
    },
  });
  return NextResponse.json({ reminder });
}

// PUT /api/reminders/process · process all due reminders (called by cron).
// CRON_SECRET-protected — prevents anyone from triggering mass WhatsApp sends.
export async function PUT(req: NextRequest) {
  // CRON_SECRET check — fail-closed.
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "Server misconfiguration: CRON_SECRET not set. Reminder processing disabled." },
      { status: 503 }
    );
  }
  const authHeader = req.headers.get("authorization") || "";
  const queryKey = req.nextUrl.searchParams.get("key") || "";
  if (authHeader !== `Bearer ${cronSecret}` && queryKey !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const due = await db.reminder.findMany({
    where: { sent: false, scheduledFor: { lte: now } },
    take: 50,
  });
  let processed = 0;
  for (const r of due) {
    await db.reminder.update({ where: { id: r.id }, data: { sent: true, sentAt: now } });
    await db.notification.create({
      data: {
        type: r.channel,
        recipient: r.guestPhone,
        body: r.message,
        status: "SENT",
        sentAt: now,
        relatedRef: r.bookingRef,
      },
    });
    processed++;
  }
  return NextResponse.json({ processed, total: due.length });
}
