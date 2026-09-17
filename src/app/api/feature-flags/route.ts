import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { getAllFeatureFlags, setFeatureFlag } from "@/lib/settings";

/**
 * Feature Flags API
 *
 * GET  /api/feature-flags         — list all flags
 * POST /api/feature-flags         — toggle a flag
 *
 * Both MANAGER-only. Writes an AuditLog row on POST.
 */

const ToggleFlagSchema = z.object({
  key: z.string().min(1).max(200),
  enabled: z.boolean(),
  // Optional metadata the admin UI may pass — used only when creating a
  // brand-new flag row (existing flags keep their label/description).
  label: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
});

/**
 * GET /api/feature-flags
 * Returns all feature flags for the admin UI.
 */
export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req, ["MANAGER"]);
  if (error) return error;

  const featureFlags = await getAllFeatureFlags();
  return NextResponse.json({ featureFlags });
}

/**
 * POST /api/feature-flags
 * Toggle a feature flag. Writes an AuditLog entry.
 *
 * body: { key, enabled, label?, description? }
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requireStaff(req, ["MANAGER"]);
  if (error || !session) {
    return error || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = ToggleFlagSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { key, enabled, label, description } = parsed.data;

  await setFeatureFlag(key, enabled, session.user.id, label, description);

  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const ua = req.headers.get("user-agent") || "unknown";
  await db.auditLog.create({
    data: {
      userId: session.user.id,
      userName: session.user.name || null,
      action: "UPDATE",
      entity: "FEATURE_FLAG",
      entityId: key,
      details: JSON.stringify({ key, enabled }),
      ipAddress: ip,
      userAgent: ua,
    },
  });

  return NextResponse.json({ ok: true, key, enabled });
}
