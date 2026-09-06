import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/pricing-rules — Returns all dynamic pricing rules
 */
export async function GET() {
  const rules = await db.dynamicPricingRule.findMany({
    orderBy: { priority: "desc" },
  });
  return NextResponse.json(
    { rules },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}

/**
 * POST /api/pricing-rules — Create a new dynamic pricing rule
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const rule = await db.dynamicPricingRule.create({
    data: {
      name: body.name,
      type: body.type,
      multiplier: parseFloat(body.multiplier) || 1.0,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      dayOfWeek: body.dayOfWeek || null,
      roomType: body.roomType || null,
      active: body.active !== false,
      priority: parseInt(body.priority) || 0,
    },
  });
  return NextResponse.json({ rule, message: "Pricing rule created" });
}

/**
 * PATCH /api/pricing-rules — Update a pricing rule
 * body: { id, data: { ...fields } }
 */
export async function PATCH(req: NextRequest) {
  const { id, data } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.multiplier !== undefined) updateData.multiplier = parseFloat(data.multiplier);
  if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
  if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
  if (data.dayOfWeek !== undefined) updateData.dayOfWeek = data.dayOfWeek || null;
  if (data.roomType !== undefined) updateData.roomType = data.roomType || null;
  if (data.active !== undefined) updateData.active = data.active;
  if (data.priority !== undefined) updateData.priority = parseInt(data.priority);

  const rule = await db.dynamicPricingRule.update({
    where: { id },
    data: updateData,
  });
  return NextResponse.json({ rule, message: "Pricing rule updated" });
}

/**
 * DELETE /api/pricing-rules?id=xxx
 */
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.dynamicPricingRule.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
