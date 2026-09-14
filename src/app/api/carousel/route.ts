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
  // SECURITY (Phase2-MassAssignment): explicit whitelist of CarouselSlide
  // columns. id/createdAt/updatedAt are server-controlled. Spec listed `link`
  // and `order` but Prisma model uses `ctaLink` and `sortOrder` — using the
  // real field names so the admin UI's PATCH { image|title|... } keeps working.
  data: z.object({
    title: z.string().max(200).optional(),
    subtitle: z.string().max(500).optional(),
    image: z.string().max(2000).optional(),
    ctaText: z.string().max(100).optional(),
    ctaLink: z.string().max(500).optional(),
    sortOrder: z.coerce.number().int().min(0).optional(),
    active: z.boolean().optional(),
  }).strict(),
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
  const slide = await db.carouselSlide.update({ where: { id }, data });
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
