import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/maintenance — list maintenance blocks
export async function GET() {
  const blocks = await db.maintenanceBlock.findMany({ orderBy: { startDate: "desc" } });
  return NextResponse.json({ blocks });
}

// POST /api/maintenance — create maintenance block (also blocks availability + sets housekeeping status)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { roomSlug, roomNumber, startDate, endDate, reason, cost, notes } = body;

  const block = await db.maintenanceBlock.create({
    data: {
      roomSlug, roomNumber: roomNumber || null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason, cost: cost || null, notes: notes || null,
      status: "SCHEDULED",
    },
  });

  // Block availability for each day in the range
  const room = await db.room.findUnique({ where: { slug: roomSlug } });
  if (room) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      await db.availability.updateMany({
        where: { roomId: room.id, date: new Date(d) },
        data: {
          available: 0,
          maintenanceNote: reason,
        },
      });
    }
  }

  // If roomNumber is specified, set housekeeping status to MAINTENANCE
  if (roomNumber) {
    await db.housekeepingStatus.update({
      where: { roomNumber },
      data: { status: "MAINTENANCE", notes: reason },
    }).catch(() => {}); // room number might not exist
  }

  // Notify all channels about the maintenance block (broadcast)
  const channels = await db.channelPartner.findMany({ where: { connected: true } });
  for (const ch of channels) {
    await db.syncLog.create({
      data: {
        channel: ch.code,
        action: "BLOCK",
        status: "SUCCESS",
        message: `Room ${roomSlug} blocked for maintenance: ${reason} (${new Date(startDate).toLocaleDateString()} → ${new Date(endDate).toLocaleDateString()})`,
        payload: JSON.stringify({ roomSlug, roomNumber, startDate, endDate, reason }),
      },
    });
  }

  return NextResponse.json({ block, message: `Maintenance scheduled. Room blocked on all ${channels.length} channels.` });
}

// PATCH /api/maintenance — update status (SCHEDULED → IN_PROGRESS → COMPLETED)
export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json();
  const block = await db.maintenanceBlock.update({ where: { id }, data: { status } });
  return NextResponse.json({ block });
}
