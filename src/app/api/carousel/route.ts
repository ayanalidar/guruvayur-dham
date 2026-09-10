import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

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

  const body = await req.json();
  const slide = await db.carouselSlide.create({ data: body });
  return NextResponse.json({ slide, message: "Slide added" });
}

// PATCH — update slide
export async function PATCH(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const { id, data } = await req.json();
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
