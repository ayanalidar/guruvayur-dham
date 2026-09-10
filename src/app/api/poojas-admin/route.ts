import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

// GET /api/poojas-admin — list all poojas
export async function GET() {
  const poojas = await db.pooja.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ poojas });
}

// POST — create pooja
export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const body = await req.json();
  const pooja = await db.pooja.create({ data: body });
  return NextResponse.json({ pooja, message: "Pooja added" });
}

// PATCH — update pooja
export async function PATCH(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const { id, data } = await req.json();
  const pooja = await db.pooja.update({ where: { id }, data });
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
