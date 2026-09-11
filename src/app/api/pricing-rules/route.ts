import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

const PricingRuleTypeEnum = z.enum(["WEEKEND", "WEEKDAY", "FESTIVAL", "DATE_RANGE", "ROOM_TYPE"]);

const CreatePricingRuleSchema = z.object({
  name: z.string().min(1).max(200),
  type: PricingRuleTypeEnum,
  multiplier: z.coerce.number().min(0),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  dayOfWeek: z.string().max(20).optional(),
  roomType: z.string().max(100).optional(),
  active: z.boolean().optional(),
  priority: z.coerce.number().int().min(0).optional(),
});

const UpdatePricingRuleSchema = z.object({
  id: z.string().min(1),
  data: z.object({
    name: z.string().min(1).max(200).optional(),
    type: PricingRuleTypeEnum.optional(),
    multiplier: z.coerce.number().min(0).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    dayOfWeek: z.string().max(20).optional(),
    roomType: z.string().max(100).optional(),
    active: z.boolean().optional(),
    priority: z.coerce.number().int().min(0).optional(),
  }),
});

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
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = CreatePricingRuleSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const body = parsed.data;
  const rule = await db.dynamicPricingRule.create({
    data: {
      name: body.name,
      type: body.type,
      multiplier: body.multiplier,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      dayOfWeek: body.dayOfWeek || null,
      roomType: body.roomType || null,
      active: body.active !== false,
      priority: body.priority ?? 0,
    },
  });
  return NextResponse.json({ rule, message: "Pricing rule created" });
}

/**
 * PATCH /api/pricing-rules — Update a pricing rule
 * body: { id, data: { ...fields } }
 */
export async function PATCH(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = UpdatePricingRuleSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { id, data } = parsed.data;

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.multiplier !== undefined) updateData.multiplier = data.multiplier;
  if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
  if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
  if (data.dayOfWeek !== undefined) updateData.dayOfWeek = data.dayOfWeek || null;
  if (data.roomType !== undefined) updateData.roomType = data.roomType || null;
  if (data.active !== undefined) updateData.active = data.active;
  if (data.priority !== undefined) updateData.priority = data.priority;

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
  const { error } = await requireStaff(req);
  if (error) return error;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.dynamicPricingRule.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
