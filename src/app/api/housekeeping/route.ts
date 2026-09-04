import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/housekeeping — list all rooms with status
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const where: any = {};
  if (status) where.status = status;
  const rooms = await db.housekeepingStatus.findMany({
    where,
    orderBy: { roomNumber: "asc" },
  });
  return NextResponse.json({ rooms });
}

// PATCH /api/housekeeping — update room status
// body: { roomNumber, status, assignedTo?, notes? }
export async function PATCH(req: NextRequest) {
  const { roomNumber, status, assignedTo, notes } = await req.json();
  const data: any = { status };
  if (assignedTo !== undefined) data.assignedTo = assignedTo;
  if (notes !== undefined) data.notes = notes;
  if (status === "READY") data.lastCleanedAt = new Date();
  const room = await db.housekeepingStatus.update({
    where: { roomNumber },
    data,
  });
  return NextResponse.json({ room });
}

// POST /api/housekeeping — bulk update (e.g., mark all dirty rooms as cleaning)
export async function POST(req: NextRequest) {
  const { fromStatus, toStatus, assignedTo } = await req.json();
  const result = await db.housekeepingStatus.updateMany({
    where: { status: fromStatus },
    data: { status: toStatus, assignedTo: assignedTo || null, lastCleanedAt: toStatus === "READY" ? new Date() : undefined },
  });
  return NextResponse.json({ updated: result.count });
}
