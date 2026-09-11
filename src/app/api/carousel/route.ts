import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

const CreateCarouselSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().optional(),
  image: z.string().min(1).max(1000),
  link: z.string().url().optional(),
  order: z.coerce.number().int().min(0).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  active: z.boolean().optional(),
});

const UpdateCarouselSchema = z.object({
  id: z.string().min(1),
  data: z.record(z.string(), z.any()),
});

// GET — list all slides
export async function GET() {
  const slides = await db.carouselSlide.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ slides });
}

// POST — create slide
export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = CreateCarouselSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const slide = await db.carouselSlide.create({ data: parsed.data as any });
  return NextResponse.json({ slide, message: "Slide added" });
}

// PATCH — update slide
export async function PATCH(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = UpdateCarouselSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { id, data } = parsed.data;
  const slide = await db.carouselSlide.update({ where: { id }, data: data as any });
  return NextResponse.json({ slide, message: "Slide updated" });
}

// DELETE
export async function DELETE(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.carouselSlide.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
