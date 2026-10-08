import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

/**
 * GET /api/admin/refresh-seo
 *
 * Lists all `seo.*` content blocks stored in the CMS DB. These blocks
 * OVERRIDE the static SEO page config in src/lib/seo-pages.ts (and
 * phase2/3/4). When admin has previously customized an SEO page via
 * /admin/content, that customization lives in the DB and takes
 * precedence over the source code.
 *
 * This endpoint helps admin see which SEO pages have DB overrides
 * (and might be stale) vs which use the static config (always up to
 * date with the latest deploy).
 *
 * AUTH: staff-only.
 */
export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  // List all content blocks whose key starts with "seo."
  const blocks = await db.contentBlock.findMany({
    where: { key: { startsWith: "seo." } },
    select: {
      key: true,
      label: true,
      category: true,
      updatedAt: true,
      // Don't return the full value blob — could be huge JSON. Just
      // return the size so admin can see how big the override is.
      // Frontend can fetch the full block via /api/content if needed.
    },
    orderBy: { key: "asc" },
  });

  return NextResponse.json({
    total: blocks.length,
    overrides: blocks.map(b => ({
      key: b.key,
      slug: b.key.replace(/^seo\./, ""),
      label: b.label,
      category: b.category,
      updatedAt: b.updatedAt,
      // Whether this override is likely stale (older than the last
      // code deploy of seo-pages.ts) — admin should consider clearing
      // it so the latest static config takes over.
      note: "This DB override takes precedence over the static config in src/lib/seo-pages*.ts. If the static config was updated via a code deploy but this DB block is older, the DB version is stale. POST to /api/admin/refresh-seo to clear all overrides.",
    })),
  });
}

/**
 * POST /api/admin/refresh-seo
 *
 * Clears all `seo.*` content blocks from the CMS DB. After clearing,
 * SEO pages will fall back to the static config in src/lib/seo-pages*.ts
 * (which gets updated on every code deploy).
 *
 * WHY THIS EXISTS:
 *   The SEOPage.tsx component reads from CMS DB first, falls back to
 *   the static .ts config. When admin has previously customized an SEO
 *   page via /admin/content, that customization is stored in the DB
 *   and OVERRIDES the static config — even after code deploys that
 *   update the static content with corrected data (e.g. "Mali Para"
 *   instead of "Natwar Nagar", "AC rooms" instead of "AC and non-AC",
 *   actual room prices instead of stale ₹1,500/₹3,500, etc.).
 *
 *   This endpoint lets admin clear ALL seo.* overrides at once, so the
 *   latest static config takes effect immediately. Admin can re-
 *   customize individual pages later via /admin/content if needed.
 *
 * BODY (optional):
 *   { "slug": "janmashtami-2026-mathura-hotel-booking" }
 *   - If slug is provided, only clears that one seo.* block.
 *   - If no body or empty body, clears ALL seo.* blocks.
 *
 * AUTH: staff-only (any role).
 *
 * RESPONSE:
 *   { ok: true, deleted: N, clearedKeys: [...] }
 */
export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  // Parse optional body for single-slug clearing
  let singleSlug: string | null = null;
  try {
    const body = await req.json();
    if (body && typeof body.slug === "string" && body.slug.trim()) {
      singleSlug = body.slug.trim();
    }
  } catch {
    // No body or invalid JSON — clear all seo.* blocks
  }

  let deleted = 0;
  const clearedKeys: string[] = [];

  if (singleSlug) {
    // Clear just one block
    const key = `seo.${singleSlug}`;
    const existing = await db.contentBlock.findUnique({ where: { key } });
    if (existing) {
      await db.contentBlock.delete({ where: { key } });
      deleted = 1;
      clearedKeys.push(key);
    }
  } else {
    // Clear all seo.* blocks
    const all = await db.contentBlock.findMany({
      where: { key: { startsWith: "seo." } },
      select: { key: true },
    });
    for (const b of all) {
      await db.contentBlock.delete({ where: { key: b.key } });
      deleted++;
      clearedKeys.push(b.key);
    }
  }

  return NextResponse.json({
    ok: true,
    deleted,
    clearedKeys,
    message: deleted === 0
      ? "No seo.* overrides found in DB — static config already in effect."
      : `Cleared ${deleted} seo.* override${deleted !== 1 ? "s" : ""} from CMS DB. SEO pages will now use the static config from src/lib/seo-pages*.ts (latest deploy). ${
          singleSlug ? `Cleared: seo.${singleSlug}` : "All SEO pages now reflect the latest code-deployed content."
        }`,
  });
}
