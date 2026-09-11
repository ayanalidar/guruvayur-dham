import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

const CreateGalleryImageSchema = z.object({
  tab: z.string().min(1).max(100),
  src: z.string().min(1).max(1000),
  alt: z.string().min(1).max(500),
  caption: z.string().max(1000).optional(),
  span: z.string().max(50).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  title: z.string().max(200).optional(),
  image: z.string().max(1000).optional(),
  category: z.string().max(100).optional(),
  active: z.boolean().optional(),
}).passthrough();

const UpdateGalleryImageSchema = z.object({
  id: z.string().min(1),
  data: z.record(z.string(), z.any()),
});

// GET /api/gallery · list all (optionally by tab)
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

// POST /api/gallery · add image
export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = CreateGalleryImageSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const image = await db.galleryImage.create({ data: parsed.data as any });
  return NextResponse.json({ image });
}

// PATCH /api/gallery · update image
export async function PATCH(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = UpdateGalleryImageSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { id, data } = parsed.data;
  const image = await db.galleryImage.update({ where: { id }, data: data as any });
  return NextResponse.json({ image });
}

// DELETE /api/gallery?id=xxx
export async function DELETE(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.galleryImage.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
