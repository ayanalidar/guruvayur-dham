import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

const CreatePoojaSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  price: z.coerce.number().min(0).optional(),
  duration: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  active: z.boolean().optional(),
});

const UpdatePoojaSchema = z.object({
  id: z.string().min(1),
  data: z.record(z.string(), z.any()),
});

// GET /api/poojas-admin — list all poojas
export async function GET() {
  const poojas = await db.pooja.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ poojas });
}

// POST — create pooja
export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = CreatePoojaSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const pooja = await db.pooja.create({ data: parsed.data as any });
  return NextResponse.json({ pooja, message: "Pooja added" });
}

// PATCH — update pooja
export async function PATCH(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = UpdatePoojaSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { id, data } = parsed.data;
  const pooja = await db.pooja.update({ where: { id }, data: data as any });
  return NextResponse.json({ pooja, message: "Pooja updated" });
}

// DELETE
export async function DELETE(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.pooja.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
