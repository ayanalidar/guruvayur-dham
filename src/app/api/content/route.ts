import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

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
export async function GET(req: NextRequest) {
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
}

// PATCH /api/content · update one or more content blocks
// body: { updates: [{ key, value }, ...] }
export async function PATCH(req: NextRequest) {
  const { error } = await requireStaff(req);
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
    const r = await db.contentBlock.upsert({
      where: { key: u.key },
      create: { key: u.key, value: u.value, category: "general" },
      update: { value: u.value },
    });
    results.push({ id: r.id, key: r.key, value: r.value });
  }
  return NextResponse.json({ updated: results.length, results });
}
