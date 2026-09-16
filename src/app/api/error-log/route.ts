import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

/**
 * Error Log API
 *
 * GET  /api/error-log   — list recent errors (with filters)
 * POST /api/error-log   — mark an error as resolved
 *
 * Both MANAGER-only — error messages can leak infrastructure details.
 *
 * GET query params:
 *   ?route=/api/bookings     — filter by route prefix (case-sensitive)
 *   ?errorType=DB_ERROR      — filter by error type
 *   ?resolved=true|false     — filter by resolved state
 *   ?limit=50                — cap (default 50, max 500)
 */

const ErrorTypeEnum = z.enum([
  "DB_ERROR",
  "EXTERNAL_API",
  "VALIDATION",
  "AUTH",
  "UNKNOWN",
]);

const QuerySchema = z.object({
  route: z.string().max(200).optional(),
  errorType: ErrorTypeEnum.optional(),
  resolved: z.enum(["true", "false"]).optional(),
  limit: z.coerce.number().int().min(1).max(500).default(50),
});

const MarkResolvedSchema = z.object({
  id: z.string().min(1).max(200),
});

/**
 * GET /api/error-log
 * Returns recent errors, newest-first, filtered by optional query params.
 */
export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req, ["MANAGER"]);
  if (error) return error;

  const parsed = QuerySchema.safeParse({
    route: req.nextUrl.searchParams.get("route") || undefined,
    errorType: req.nextUrl.searchParams.get("errorType") || undefined,
    resolved: req.nextUrl.searchParams.get("resolved") || undefined,
    limit: req.nextUrl.searchParams.get("limit") || undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { route, errorType, resolved, limit } = parsed.data;

  const where: any = {};
  if (route) where.route = { contains: route };
  if (errorType) where.errorType = errorType;
  if (resolved === "true") where.resolved = true;
  if (resolved === "false") where.resolved = false;

  const errors = await db.errorLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ errors });
}

/**
 * POST /api/error-log
 * Mark an error as resolved. Idempotent.
 *
 * body: { id }
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requireStaff(req, ["MANAGER"]);
  if (error || !session) {
    return error || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = MarkResolvedSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { id } = parsed.data;

  const existing = await db.errorLog.findUnique({ where: { id }, select: { id: true, resolved: true } });
  if (!existing) {
    return NextResponse.json({ error: "Error log not found" }, { status: 404 });
  }
  if (existing.resolved) {
    return NextResponse.json({ ok: true, alreadyResolved: true });
  }

  await db.errorLog.update({ where: { id }, data: { resolved: true } });

  // Audit-log the resolution so we can see who closed what.
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const ua = req.headers.get("user-agent") || "unknown";
  await db.auditLog.create({
    data: {
      userId: session.user.id,
      userName: session.user.name || null,
      action: "UPDATE",
      entity: "ERROR_LOG",
      entityId: id,
      details: JSON.stringify({ resolved: true }),
      ipAddress: ip,
      userAgent: ua,
    },
  });

  return NextResponse.json({ ok: true, id, resolved: true });
}
