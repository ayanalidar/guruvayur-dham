import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/audit-log
 * Returns audit log entries (admin only)
 * Query: ?limit=50, ?entity=BOOKING, ?userId=xxx
 */
export async function GET(req: NextRequest) {
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
  const { userId, userName, action, entity, entityId, details } = await req.json();

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
