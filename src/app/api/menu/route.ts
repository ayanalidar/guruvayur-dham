import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

const CreateMenuItemSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  category: z.string().min(1).max(100),
  veg: z.boolean().optional(),
  prepTime: z.coerce.number().int().min(0).optional(),
  image: z.string().url().optional(),
  available: z.boolean().optional(),
});

const UpdateMenuItemSchema = z.object({
  id: z.string().min(1),
  // SECURITY (Phase2-MassAssignment): explicit whitelist of MenuItem columns.
  // No `image` field — Prisma MenuItem has no image column (image is only on
  // Room/Pooja/Carousel/BlogPost/GalleryImage). id/createdAt/updatedAt are
  // server-controlled.
  data: z.object({
    name: z.string().max(200).optional(),
    description: z.string().max(1000).optional(),
    price: z.coerce.number().min(0).optional(),
    category: z.string().max(100).optional(),
    veg: z.boolean().optional(),
    prepTime: z.coerce.number().int().min(0).optional(),
    available: z.boolean().optional(),
  }).strict(),
});

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
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = CreateMenuItemSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const item = await db.menuItem.create({ data: parsed.data as any });
  return NextResponse.json({ item });
}

// PATCH /api/menu · update menu item
export async function PATCH(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = UpdateMenuItemSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { id, data } = parsed.data;
  const item = await db.menuItem.update({ where: { id }, data });
  return NextResponse.json({ item });
}

// DELETE /api/menu?id=xxx
export async function DELETE(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.menuItem.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
