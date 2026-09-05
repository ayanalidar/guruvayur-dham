import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/menu · list all menu items
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");
  const where: any = { available: true };
  if (category) where.category = category;
  const items = await db.menuItem.findMany({ where, orderBy: { category: "asc" } });
  return NextResponse.json({ items });
}

// POST /api/menu · create new menu item
export async function POST(req: NextRequest) {
  const body = await req.json();
  const item = await db.menuItem.create({ data: body });
  return NextResponse.json({ item });
}

// PATCH /api/menu · update menu item
export async function PATCH(req: NextRequest) {
  const { id, data } = await req.json();
  const item = await db.menuItem.update({ where: { id }, data });
  return NextResponse.json({ item });
}

// DELETE /api/menu?id=xxx
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.menuItem.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
