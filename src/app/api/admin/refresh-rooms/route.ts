import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

/**
 * POST /api/admin/refresh-rooms
 *
 * Updates the `totalUnits` column for each room in the DB to match the
 * canonical distribution (sum = 15 rooms total). WITHOUT touching any
 * other room data (price, name, description, gallery, etc.) or any
 * other CMS content / reviews / poojas / bookings.
 *
 * WHY THIS EXISTS:
 *   The original seed (commit 7de9d0d, Sep 23 2026) had unitCounts:
 *     { deluxe-room: 4, super-deluxe-room: 5, superior-room: 5, gvd-suite: 2 }
 *   Sum = 4+5+5+2 = 16 (with family-comfort-triple-room defaulting to 4,
 *   total = 20). This is WRONG — SITE.totalRooms = 15, and all marketing
 *   copy says "15+ Premium Rooms".
 *
 *   The admin dashboard card showed:
 *     TOTAL ROOMS: 5  |  20 total units
 *   Should be:
 *     TOTAL ROOMS: 5  |  15 total units
 *
 *   The seed was corrected in this commit, but re-running /api/seed
 *   would also reset CMS content, reviews, poojas, etc. — too invasive.
 *   This focused endpoint ONLY updates the totalUnits column.
 *
 * CANONICAL DISTRIBUTION (sum = 15):
 *   - King Deluxe (super-deluxe-room): 4 units (entry-level, popular)
 *   - Premium Double Bed (superior-room): 4 units (family choice)
 *   - Family Comfort Triple: 3 units (small families)
 *   - Family Suit/Quad (deluxe-room): 2 units (groups of 6-8)
 *   - Privilege Suite (gvd-suite): 2 units (premium/signature)
 *
 * AUTH: staff-only (any role).
 *
 * RESPONSE:
 *   { ok: true, updated: N, changes: [...], totalUnits: 15 }
 */
const CANONICAL_UNIT_COUNTS: Record<string, number> = {
  "super-deluxe-room": 4,            // King Deluxe
  "superior-room": 4,                // Premium Double Bed
  "family-comfort-triple-room": 3,   // Family Comfort Triple
  "deluxe-room": 2,                  // Family Suit / Quad Room
  "gvd-suite": 2,                    // Privilege Suite
};

export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  // Allow admin to override individual room counts via body
  // e.g. POST { super-deluxe-room: 5 } sets just that one
  let overrides: Record<string, number> = {};
  try {
    const body = await req.json();
    if (body && typeof body === "object") {
      for (const slug of Object.keys(CANONICAL_UNIT_COUNTS)) {
        if (typeof body[slug] === "number" && body[slug] >= 0) {
          overrides[slug] = body[slug];
        }
      }
    }
  } catch {
    // No body — use canonical defaults
  }

  const finalCounts = { ...CANONICAL_UNIT_COUNTS, ...overrides };
  const totalSum = Object.values(finalCounts).reduce((a, b) => a + b, 0);

  let updated = 0;
  const changes: any[] = [];

  for (const [slug, count] of Object.entries(finalCounts)) {
    const existing = await db.room.findUnique({ where: { slug } });
    if (!existing) {
      // Room doesn't exist in DB — skip (admin should run /api/seed first)
      changes.push({ slug, from: null, to: count, skipped: "room not in DB" });
      continue;
    }
    if (existing.totalUnits !== count) {
      await db.room.update({
        where: { slug },
        data: { totalUnits: count },
      });
      updated++;
      changes.push({ slug, from: existing.totalUnits, to: count });
    }
  }

  return NextResponse.json({
    ok: true,
    updated,
    changes,
    totalUnits: totalSum,
    canonicalDistribution: CANONICAL_UNIT_COUNTS,
    message: updated === 0
      ? `No changes needed — all room totalUnits already match canonical values. Total = ${totalSum} units.`
      : `Updated ${updated} room${updated !== 1 ? "s" : ""}. Total units now = ${totalSum} (was 20). The admin dashboard card should now show "TOTAL ROOMS: 5 | ${totalSum} total units".`,
  });
}

/**
 * GET /api/admin/refresh-rooms
 * Returns the current totalUnits values stored in the DB + the canonical
 * values, so admin can compare before applying.
 */
export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const rooms = await db.room.findMany({
    where: { active: true },
    select: { slug: true, name: true, totalUnits: true, price: true, capacity: true },
    orderBy: { price: "asc" },
  });

  const currentSum = rooms.reduce((s, r) => s + r.totalUnits, 0);
  const canonicalSum = Object.values(CANONICAL_UNIT_COUNTS).reduce((a, b) => a + b, 0);

  return NextResponse.json({
    current: rooms.map(r => ({
      slug: r.slug,
      name: r.name,
      totalUnits: r.totalUnits,
      price: r.price,
      capacity: r.capacity,
      canonical: CANONICAL_UNIT_COUNTS[r.slug] ?? null,
      needsUpdate: CANONICAL_UNIT_COUNTS[r.slug] !== undefined && CANONICAL_UNIT_COUNTS[r.slug] !== r.totalUnits,
    })),
    currentTotalUnits: currentSum,
    canonicalTotalUnits: canonicalSum,
    needsRefresh: currentSum !== canonicalSum,
  });
}
