import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { withErrorHandler } from "@/lib/api-safe";

const ContentUpdateSchema = z.object({
  key: z.string().min(1).max(200),
  value: z.string(),
  category: z.string().max(100).optional(),
  label: z.string().max(200).optional(),
});

const BulkContentUpdateSchema = z.object({
  updates: z.array(ContentUpdateSchema).min(1),
});

// GET /api/content · fetch all content blocks (or by ?category=)
// FUNCTIONAL (Round 3 F17 fix): wrapped in withErrorHandler.
export const GET = withErrorHandler(async (req: NextRequest) => {
  const cat = req.nextUrl.searchParams.get("category");
  const blocks = await db.contentBlock.findMany({
    where: cat ? { category: cat } : undefined,
  });
  // convert to key->value map for easy frontend use
  const map: Record<string, string> = {};
  for (const b of blocks) map[b.key] = b.value;
  return NextResponse.json(
    { blocks, map },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
});

// PATCH /api/content · update one or more content blocks
// body: { updates: [{ key, value }, ...] }
export async function PATCH(req: NextRequest) {
  const { session, error } = await requireStaff(req);
  if (error) return error;

  const parsed = BulkContentUpdateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { updates } = parsed.data;
  const results: Array<{ id: string; key: string; value: string }> = [];
  for (const u of updates) {
    // SelfReliant-Phase2-4: snapshot the current value into ContentVersion
    // BEFORE overwriting, so admins can roll back via /api/content/versions.
    // Best-effort: if the snapshot write fails (e.g. transient DB blip) we
    // still proceed with the update — losing history is preferable to
    // blocking the editor.
    try {
      const existing = await db.contentBlock.findUnique({ where: { key: u.key } });
      if (existing) {
        const nextVersion =
          (await db.contentVersion.count({ where: { contentBlockKey: u.key } })) + 1;
        await db.contentVersion.create({
          data: {
            contentBlockKey: u.key,
            value: existing.value,
            version: nextVersion,
            updatedBy: session?.user?.id,
            userName: session?.user?.name,
          },
        });
      }
    } catch {}

    const r = await db.contentBlock.upsert({
      where: { key: u.key },
      create: { key: u.key, value: u.value, category: "general" },
      update: { value: u.value },
    });
    results.push({ id: r.id, key: r.key, value: r.value });
  }
  return NextResponse.json({ updated: results.length, results });
}
