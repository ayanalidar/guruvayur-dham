import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

const AuditLogEntityEnum = z.enum([
  "BOOKING",
  "CUSTOMER",
  "ROOM",
  "STAFF",
  "CMS",
  "PAYMENT",
  "REFUND",
  "CHANNEL",
  "INVENTORY",
  "REVIEW",
  "OTHER",
]);

const CreateAuditLogSchema = z.object({
  userId: z.string().max(200).optional(),
  userName: z.string().max(200).optional(),
  action: z.string().min(1).max(200),
  entity: AuditLogEntityEnum,
  entityId: z.string().max(200).optional(),
  details: z.string().optional(),
});

/**
 * GET /api/audit-log
 * Returns audit log entries (admin only)
 * Query: ?limit=50, ?entity=BOOKING, ?userId=xxx
 */
export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const limit = parseInt(searchParams.get("limit") || "50");
  const entity = searchParams.get("entity");
  const userId = searchParams.get("userId");

  const where: any = {};
  if (entity) where.entity = entity;
  if (userId) where.userId = userId;

  const logs = await db.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ logs });
}

/**
 * POST /api/audit-log
 * Creates an audit log entry (called by other API routes)
 * body: { userId, userName, action, entity, entityId?, details? }
 */
export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = CreateAuditLogSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { userId, userName, action, entity, entityId, details } = parsed.data;

  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const ua = req.headers.get("user-agent") || "unknown";

  const log = await db.auditLog.create({
    data: {
      userId: userId || null,
      userName: userName || null,
      action,
      entity,
      entityId: entityId || null,
      details: details || null,
      ipAddress: ip,
      userAgent: ua,
    },
  });

  return NextResponse.json({ log });
}
