import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

const HousekeepingStatusEnum = z.enum([
  "READY",
  "OCCUPIED",
  "DIRTY",
  "CLEANING",
  "INSPECT",
  "MAINTENANCE",
]);

const UpdateHousekeepingSchema = z.object({
  roomNumber: z.string().min(1).max(50),
  status: HousekeepingStatusEnum,
  assignedTo: z.string().max(200).optional(),
  notes: z.string().optional(),
});

const BulkUpdateHousekeepingSchema = z.object({
  fromStatus: HousekeepingStatusEnum,
  toStatus: HousekeepingStatusEnum,
  assignedTo: z.string().max(200).optional(),
});

// GET /api/housekeeping · list all rooms with status
export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const status = req.nextUrl.searchParams.get("status");
  const where: any = {};
  if (status) where.status = status;
  const rooms = await db.housekeepingStatus.findMany({
    where,
    orderBy: { roomNumber: "asc" },
  });
  return NextResponse.json({ rooms });
}

// PATCH /api/housekeeping · update room status
// body: { roomNumber, status, assignedTo?, notes? }
export async function PATCH(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = UpdateHousekeepingSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { roomNumber, status, assignedTo, notes } = parsed.data;
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

// POST /api/housekeeping · bulk update (e.g., mark all dirty rooms as cleaning)
export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = BulkUpdateHousekeepingSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { fromStatus, toStatus, assignedTo } = parsed.data;
  const result = await db.housekeepingStatus.updateMany({
    where: { status: fromStatus },
    data: { status: toStatus, assignedTo: assignedTo || null, lastCleanedAt: toStatus === "READY" ? new Date() : undefined },
  });
  return NextResponse.json({ updated: result.count });
}
