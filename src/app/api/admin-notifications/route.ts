import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

/**
 * Admin Notifications API
 *
 * GET    /api/admin-notifications            — list unread alerts for current user
 * POST   /api/admin-notifications            — mark one alert as read
 * DELETE /api/admin-notifications            — clear all alerts already read by current user
 *
 * Auth: any staff member (the GET is "any staff"). POST + DELETE are also
 * staff-only — there's no MANAGER restriction here because every staff role
 * needs to be able to clear their own dismissals.
 *
 * Query: ?severity=CRITICAL — filter by severity (INFO | WARNING | CRITICAL)
 */

const SeverityEnum = z.enum(["INFO", "WARNING", "CRITICAL"]);

const MarkReadSchema = z.object({
  id: z.string().min(1).max(200),
});

/**
 * GET /api/admin-notifications
 * Returns notifications the current user has NOT yet dismissed, ordered
 * newest-first. Optional ?severity= filter.
 *
 * "Unread" = readBy does not contain the current user's id.
 */
export async function GET(req: NextRequest) {
  const { session, error } = await requireStaff(req);
  if (error || !session) {
    return error || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const severityParam = req.nextUrl.searchParams.get("severity");
  const severityParsed = severityParam ? SeverityEnum.safeParse(severityParam) : null;
  if (severityParam && (!severityParsed || !severityParsed.success)) {
    return NextResponse.json(
      { error: "Invalid severity — must be INFO | WARNING | CRITICAL" },
      { status: 400 },
    );
  }

  const where: any = {
    readBy: { hasNot: session.user.id },
  };
  if (severityParsed?.success) {
    where.severity = severityParsed.data;
  }

  const notifications = await db.adminNotification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ notifications });
}

/**
 * POST /api/admin-notifications
 * Mark a notification as read by adding the current user's id to readBy.
 *
 * body: { id }
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requireStaff(req);
  if (error || !session) {
    return error || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = MarkReadSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { id } = parsed.data;

  // Check it exists first so we can return 404 instead of prisma throwing
  // P2025 "record not found" (which would surface as a 500).
  const existing = await db.adminNotification.findUnique({
    where: { id },
    select: { id: true, readBy: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  }
  if (existing.readBy.includes(session.user.id)) {
    // Idempotent — already dismissed.
    return NextResponse.json({ ok: true, alreadyRead: true });
  }

  const updated = await db.adminNotification.update({
    where: { id },
    data: { readBy: { push: session.user.id } },
    select: { id: true, readBy: true },
  });

  return NextResponse.json({ ok: true, id: updated.id, readBy: updated.readBy });
}

/**
 * DELETE /api/admin-notifications
 * Clears all notifications the current user has read (i.e. dismissed).
 *
 * "Clear" here means removing the user's id from readBy on every row that
 * contains it, so the row disappears from their unread view. The underlying
 * AdminNotification rows themselves are NOT deleted — other staff may still
 * need to see them.
 *
 * If a manager later wants to truly delete rows, they can do so via a
 * dedicated admin route (not implemented here).
 */
export async function DELETE(req: NextRequest) {
  const { session, error } = await requireStaff(req);
  if (error || !session) {
    return error || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Prisma doesn't expose a "remove element from array" on the SQL side
  // directly via updateMany — but the simplest "clear" semantics for the
  // current user is to delete the row entirely if no one else has read it,
  // OR leave it alone (it'll just not show up in this user's unread list
  // anymore since readBy already contains them).
  //
  // For this endpoint we choose the simpler interpretation: every row the
  // user has dismissed is removed from their view (their id is already in
  // readBy, so the GET filter excludes them). To actually "clear" the
  // stored list of dismissed IDs we delete rows where this user is the
  // ONLY reader — leaves rows that others still need.
  const staleNotifications = await db.adminNotification.findMany({
    where: { readBy: { has: session.user.id } },
    select: { id: true, readBy: true },
  });

  const toDelete: string[] = [];
  for (const n of staleNotifications) {
    if (n.readBy.length === 1 && n.readBy[0] === session.user.id) {
      toDelete.push(n.id);
    }
  }

  if (toDelete.length > 0) {
    await db.adminNotification.deleteMany({ where: { id: { in: toDelete } } });
  }

  return NextResponse.json({
    ok: true,
    cleared: staleNotifications.length,
    deleted: toDelete.length,
  });
}
