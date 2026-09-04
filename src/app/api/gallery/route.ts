import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/gallery — list all (optionally by tab)
export async function GET(req: NextRequest) {
  const tab = req.nextUrl.searchParams.get("tab");
  const where: any = {};
  if (tab) where.tab = tab;
  const images = await db.galleryImage.findMany({
    where,
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ images });
}

// POST /api/gallery — add image
export async function POST(req: NextRequest) {
  const body = await req.json();
  const image = await db.galleryImage.create({ data: body });
  return NextResponse.json({ image });
}

// PATCH /api/gallery — update image
export async function PATCH(req: NextRequest) {
  const { id, data } = await req.json();
  const image = await db.galleryImage.update({ where: { id }, data });
  return NextResponse.json({ image });
}

// DELETE /api/gallery?id=xxx
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.galleryImage.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
