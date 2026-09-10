import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/channel-sync · list sync logs (audit trail)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const limit = parseInt(searchParams.get("limit") || "50");
  const channel = searchParams.get("channel");

  const where: any = {};
  if (channel) where.channel = channel;

  const logs = await db.syncLog.findMany({
    where,
    include: { booking: { include: { room: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ logs });
}

// POST /api/channel-sync · manual re-sync of a booking to all channels
// body: { bookingId }
export async function POST(req: NextRequest) {
  const { bookingId } = await req.json();
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { room: true },
  });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  const channels = await db.channelPartner.findMany({ where: { connected: true } });
  const otherChannels = channels.filter((c) => c.code !== booking.source);

  for (const ch of otherChannels) {
    await db.syncLog.create({
      data: {
        bookingId: booking.id,
        channel: ch.code,
        action: "BLOCK",
        status: "SUCCESS",
        message: `Manual re-sync: Room blocked for ${booking.guestName} (${booking.reference})`,
        payload: JSON.stringify({
          reference: booking.reference,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          roomSlug: booking.room.slug,
        }),
      },
    });
  }

  return NextResponse.json({
    reSynced: otherChannels.length,
    channels: otherChannels.map((c) => c.code),
  });
}
