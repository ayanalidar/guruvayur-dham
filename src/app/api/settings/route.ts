import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import {
  getAllSettings,
  getAllFeatureFlags,
  setSetting,
  invalidateAllSettingsCaches,
} from "@/lib/settings";

/**
 * Settings + Feature Flags API
 *
 * GET  /api/settings         — returns all settings (masked) + all feature flags
 * POST /api/settings         — update a single setting (encrypted if isSecret)
 *
 * Both MANAGER-only. Writes an AuditLog row on POST.
 */

const SettingCategoryEnum = z.enum([
  "INTEGRATION",
  "FEATURE_FLAG",
  "CONFIG",
  "SECRET",
]);

const UpdateSettingSchema = z.object({
  key: z.string().min(1).max(200),
  value: z.string().max(10000), // 10KB cap — prevents DB bloat / secret smuggling
  isSecret: z.boolean().optional(),
  category: SettingCategoryEnum.optional(),
  label: z.string().max(200).optional(),
});

/**
 * GET /api/settings
 * Returns all settings (secrets masked) + all feature flags for the admin UI.
 */
export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req, ["MANAGER"]);
  if (error) return error;

  const [settings, featureFlags] = await Promise.all([
    getAllSettings(),
    getAllFeatureFlags(),
  ]);

  return NextResponse.json({ settings, featureFlags });
}

/**
 * POST /api/settings
 * Update a single setting. Secrets are encrypted at rest.
 * Writes an AuditLog entry + invalidates the in-memory settings cache.
 *
 * body: { key, value, isSecret?, category?, label? }
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requireStaff(req, ["MANAGER"]);
  if (error || !session) {
    return error || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = UpdateSettingSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { key, value, isSecret, category, label } = parsed.data;

  await setSetting(
    key,
    value,
    session.user.id,
    isSecret ?? true,
    category ?? "INTEGRATION",
    label,
  );

  // Invalidate all caches — setSetting already clears the single key, but
  // bulk changes (e.g. editing multiple secrets at once) benefit from a
  // full flush so dependent lookups (health checks etc.) see fresh data.
  invalidateAllSettingsCaches();

  // Audit log — never write the actual value (could be a secret).
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const ua = req.headers.get("user-agent") || "unknown";
  await db.auditLog.create({
    data: {
      userId: session.user.id,
      userName: session.user.name || null,
      action: "UPDATE",
      entity: "SETTING",
      entityId: key,
      details: JSON.stringify({
        key,
        category: category ?? "INTEGRATION",
        isSecret: isSecret ?? true,
        // record only that it changed, not the value (could be a secret)
        valueLength: value.length,
      }),
      ipAddress: ip,
      userAgent: ua,
    },
  });

  return NextResponse.json({ ok: true, key });
}
