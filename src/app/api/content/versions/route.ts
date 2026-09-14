import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

/**
 * Content Version History API
 *
 * GET  /api/content/versions?key=hero.headline&limit=20
 *   Returns version history for a content block (or a CMS row, keyed as
 *   `cms:<type>:<id>`). Newest-first.
 *
 * POST /api/content/versions/rollback
 *   See ./rollback/route.ts — restores a previous version.
 *
 * Both MANAGER-only — version history can include prior PII (e.g. contact
 * details) that was edited out.
 *
 * SelfReliant-Phase2-4.
 */

const QuerySchema = z.object({
  key: z.string().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(200).default(20),
});

export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req, ["MANAGER"]);
  if (error) return error;

  const parsed = QuerySchema.safeParse({
    key: req.nextUrl.searchParams.get("key") || undefined,
    limit: req.nextUrl.searchParams.get("limit") || undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { key, limit } = parsed.data;

  const versions = await db.contentVersion.findMany({
    where: { contentBlockKey: key },
    orderBy: { version: "desc" },
    take: limit,
  });

  // Also surface the current live value so the UI can show "current vs
  // selected version" diff. For CMS keys (cms:<type>:<id>), we return only
  // the ContentBlock lookup (cms keys have no ContentBlock row).
  let currentValue: string | null = null;
  if (!key.startsWith("cms:")) {
    const block = await db.contentBlock.findUnique({
      where: { key },
      select: { value: true },
    });
    currentValue = block?.value ?? null;
  }

  return NextResponse.json({
    key,
    currentValue,
    versions,
  });
}
