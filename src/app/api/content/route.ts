import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/content · fetch all content blocks (or by ?category=)
export async function GET(req: NextRequest) {
  const cat = req.nextUrl.searchParams.get("category");
  const blocks = await db.contentBlock.findMany(
    cat ? { where: { category: cat } } : {}
  );
  // convert to key->value map for easy frontend use
  const map: Record<string, string> = {};
  for (const b of blocks) map[b.key] = b.value;
  return NextResponse.json({ blocks, map });
}

// PATCH /api/content · update one or more content blocks
// body: { updates: [{ key, value }, ...] }
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { updates }: { updates: Array<{ key: string; value: string }> } = body;
  if (!Array.isArray(updates)) {
    return NextResponse.json({ error: "updates must be an array" }, { status: 400 });
  }
  const results = [];
  for (const u of updates) {
    const r = await db.contentBlock.upsert({
      where: { key: u.key },
      create: { key: u.key, value: u.value, category: "general" },
      update: { value: u.value },
    });
    results.push(r);
  }
  return NextResponse.json({ updated: results.length, results });
}
