import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { getFeatureFlag, setFeatureFlag } from "@/lib/settings";

/**
 * Maintenance Mode API
 *
 * NOTE on path:
 *   The existing /api/maintenance route handles ROOM maintenance blocks
 *   (MaintenanceBlock table — scheduling room outages). This route at
 *   /api/maintenance/mode handles the maintenance MODE feature flag
 *   (toggle the holding page shown to guests). Two distinct concepts;
 *   separated by sub-path so the existing room-block UIs keep working.
 *
 * GET  /api/maintenance/mode  — return current maintenance mode status
 * POST /api/maintenance/mode  — toggle maintenance mode on/off
 *
 * Both MANAGER-only. POST writes an AuditLog + creates an AdminNotification
 * (CRITICAL severity) so other managers see the toggle in their dashboard.
 */

const ToggleMaintenanceSchema = z.object({
  enabled: z.boolean(),
  reason: z.string().max(500).optional(),
});

/**
 * GET /api/maintenance/mode
 */
export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req, ["MANAGER"]);
  if (error) return error;

  const enabled = await getFeatureFlag("MAINTENANCE_MODE");
  return NextResponse.json({ enabled });
}

/**
 * POST /api/maintenance/mode
 *
 * body: { enabled, reason? }
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requireStaff(req, ["MANAGER"]);
  if (error || !session) {
    return error || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = ToggleMaintenanceSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { enabled, reason } = parsed.data;

  await setFeatureFlag("MAINTENANCE_MODE", enabled, session.user.id);

  // Audit log — record who toggled + the reason.
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const ua = req.headers.get("user-agent") || "unknown";
  await db.auditLog.create({
    data: {
      userId: session.user.id,
      userName: session.user.name || null,
      action: "UPDATE",
      entity: "FEATURE_FLAG",
      entityId: "MAINTENANCE_MODE",
      details: JSON.stringify({ enabled, reason: reason || null }),
      ipAddress: ip,
      userAgent: ua,
    },
  });

  // Admin notification — surface the toggle so other managers see it
  // immediately on their dashboard. CRITICAL severity when enabling (guests
  // now see a holding page); WARNING when disabling (back to normal).
  await db.adminNotification.create({
    data: {
      type: "SECURITY",
      severity: enabled ? "CRITICAL" : "WARNING",
      title: enabled
        ? "Maintenance mode ENABLED"
        : "Maintenance mode disabled",
      message: enabled
        ? `Site is now showing the holding page to guests.${reason ? ` Reason: ${reason}` : ""} Toggle by ${session.user.name || session.user.email}.`
        : `Site is back to normal. Toggle by ${session.user.name || session.user.email}.`,
      actionUrl: "/admin/settings",
    },
  });

  return NextResponse.json({ ok: true, enabled });
}
