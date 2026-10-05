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

  let updated = 0;
  let created = 0;
  const changes: any[] = [];

  for (const stat of CANONICAL_STATS) {
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
    canonicalValues: CANONICAL_STATS,
    message: `Refreshed homepage stats · ${updated} updated, ${created} created. The 4 stat cards (rooms/years/guests/rating) now show 15+/5+/10000+/4.8★.`,
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
