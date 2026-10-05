import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

/**
 * POST /api/admin/refresh-stats
 *
 * Updates ONLY the homepage.stats.* content blocks to their canonical
 * values, without touching any other CMS content (hero.eyebrow,
 * footer.tagline, etc. all preserved).
 *
 * WHY THIS EXISTS:
 *   The original seed (commit 7de9d0d, Sep 23 2026) seeded
 *   `homepage.stats.rooms = "16"` and `homepage.stats.years = "10"`.
 *   On Sep 27 (commit 646ef7b), the seed was corrected to "15" and
 *   "5" respectively. But re-running /api/seed would also overwrite
 *   every other CMS customization the admin has made (hero copy,
 *   footer tagline, etc.).
 *
 *   This focused endpoint bumps ONLY the 4 homepage.stats.* values
 *   to their canonical values, leaving all other CMS content alone.
 *
 * OPTIONAL BODY: { rooms?: string, years?: string, guests?: string,
 *   rating?: string }
 *   If a field is provided in the body, it overrides the canonical
 *   default. e.g. POST { rooms: "20" } sets homepage.stats.rooms="20"
 *   without touching the other 3.
 *
 * AUTH: staff-only (any role).
 *
 * USAGE FROM ADMIN HUB:
 *   Click the "Refresh Stats" button on the dashboard - it POSTs to
 *   this endpoint and re-renders the stat cards with canonical values.
 */
const CANONICAL_STATS = [
  { key: "homepage.stats.rooms", value: "15", label: "Homepage Stat · Rooms" },
  { key: "homepage.stats.years", value: "5", label: "Homepage Stat · Years of Service" },
  { key: "homepage.stats.guests", value: "10000", label: "Homepage Stat · Happy Guests" },
  { key: "homepage.stats.rating", value: "4.8", label: "Homepage Stat · Google Rating" },
];

export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  // Allow admin to override any of the canonical values via the request
  // body. e.g. POST { rooms: "20" } sets just that one without touching
  // the others.
  let overrides: Record<string, string> = {};
  try {
    const body = await req.json();
    if (body && typeof body === "object") {
      if (typeof body.rooms === "string") overrides["homepage.stats.rooms"] = body.rooms;
      if (typeof body.years === "string") overrides["homepage.stats.years"] = body.years;
      if (typeof body.guests === "string") overrides["homepage.stats.guests"] = body.guests;
      if (typeof body.rating === "string") overrides["homepage.stats.rating"] = body.rating;
    }
  } catch {
    // Body is optional - if no JSON body, just use canonical defaults
  }

  const finalStats = CANONICAL_STATS.map(s =>
    overrides[s.key] ? { ...s, value: overrides[s.key] } : s
  );

  let updated = 0;
  let created = 0;
  const changes: any[] = [];

  for (const stat of finalStats) {
    const existing = await db.contentBlock.findUnique({ where: { key: stat.key } });
    if (existing) {
      // Only update if value differs (avoid spurious writes)
      if (existing.value !== stat.value) {
        await db.contentBlock.update({
          where: { key: stat.key },
          data: { value: stat.value },
        });
        updated++;
        changes.push({ key: stat.key, from: existing.value, to: stat.value });
      }
    } else {
      // Row doesn't exist - create it
      await db.contentBlock.create({
        data: {
          key: stat.key,
          value: stat.value,
          category: "homepage",
          label: stat.label,
        },
      });
      created++;
      changes.push({ key: stat.key, from: null, to: stat.value });
    }
  }

  return NextResponse.json({
    ok: true,
    updated,
    created,
    changes,
    finalValues: finalStats,
    message: `Refreshed homepage stats · ${updated} updated, ${created} created. The 4 stat cards now show ${finalStats[0].value}+/${finalStats[1].value}+/${finalStats[2].value}+/${finalStats[3].value}★.`,
  });
}

/**
 * GET /api/admin/refresh-stats
 * Returns the current values stored in the DB + the canonical values,
 * so admin can compare before applying.
 */
export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const current = await db.contentBlock.findMany({
    where: { key: { startsWith: "homepage.stats." } },
    select: { key: true, value: true, label: true, updatedAt: true },
  });

  return NextResponse.json({
    current: current.map(c => ({ key: c.key, value: c.value, label: c.label, updatedAt: c.updatedAt })),
    canonical: CANONICAL_STATS,
    needsRefresh: current.some(c => {
      const canonical = CANONICAL_STATS.find(s => s.key === c.key);
      return canonical && canonical.value !== c.value;
    }),
  });
}
