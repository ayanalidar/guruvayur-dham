import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { validateCoupon, markCouponUsed } from "@/lib/pricing";
import { requireStaff } from "@/lib/auth";

const CouponTypeEnum = z.enum(["PERCENTAGE", "FLAT"]);

const CreateCouponSchema = z.object({
  code: z.string().min(1).max(50),
  description: z.string().optional(),
  type: CouponTypeEnum,
  value: z.coerce.number().min(0),
  maxDiscount: z.coerce.number().min(0).optional(),
  minBooking: z.coerce.number().min(0).optional(),
  usageLimit: z.coerce.number().int().min(0).optional(),
  validFrom: z.string().min(1),
  validTo: z.string().min(1),
  active: z.boolean().optional(),
});

const UpdateCouponSchema = z.object({
  id: z.string().min(1),
  // SECURITY (Phase2-MassAssignment): explicit whitelist — `code` is immutable
  // after creation (it's the user-facing identifier) and `usedCount` is
  // server-controlled (incremented by markCouponUsed on each redemption).
  data: z.object({
    description: z.string().max(500).optional(),
    type: z.enum(["PERCENTAGE", "FLAT"]).optional(),
    value: z.coerce.number().min(0).max(100).optional(),
    maxDiscount: z.coerce.number().min(0).nullable().optional(),
    minBooking: z.coerce.number().min(0).optional(),
    usageLimit: z.coerce.number().int().min(0).optional(),
    validFrom: z.coerce.date().optional(),
    validTo: z.coerce.date().optional(),
    active: z.boolean().optional(),
  }).strict(),
});

const ValidateCouponSchema = z.object({
  code: z.string().min(1).max(50),
  bookingAmount: z.coerce.number().min(0),
});

// GET /api/coupons · list all coupons
export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const coupons = await db.coupon.findMany({ orderBy: { code: "asc" } });
  return NextResponse.json({ coupons });
}

// POST /api/coupons · create new coupon
export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = CreateCouponSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const coupon = await db.coupon.create({ data: parsed.data as any });
  return NextResponse.json({ coupon });
}

// PATCH /api/coupons · update coupon
export async function PATCH(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = UpdateCouponSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { id, data } = parsed.data;
  const coupon = await db.coupon.update({ where: { id }, data });
  return NextResponse.json({ coupon });
}

// DELETE /api/coupons?id=xxx
export async function DELETE(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.coupon.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}

// PUT /api/coupons/validate · validate a coupon code against a booking amount
export async function PUT(req: NextRequest) {
  const parsed = ValidateCouponSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { code, bookingAmount } = parsed.data;
  const result = await validateCoupon(code, bookingAmount);
  return NextResponse.json(result);
}

export { markCouponUsed };
