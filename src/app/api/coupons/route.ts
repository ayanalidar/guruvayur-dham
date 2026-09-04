import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateCoupon, markCouponUsed } from "@/lib/pricing";

// GET /api/coupons · list all coupons
export async function GET() {
  const coupons = await db.coupon.findMany({ orderBy: { code: "asc" } });
  return NextResponse.json({ coupons });
}

// POST /api/coupons · create new coupon
export async function POST(req: NextRequest) {
  const body = await req.json();
  const coupon = await db.coupon.create({ data: body });
  return NextResponse.json({ coupon });
}

// PATCH /api/coupons · update coupon
export async function PATCH(req: NextRequest) {
  const { id, data } = await req.json();
  const coupon = await db.coupon.update({ where: { id }, data });
  return NextResponse.json({ coupon });
}

// DELETE /api/coupons?id=xxx
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.coupon.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}

// PUT /api/coupons/validate · validate a coupon code against a booking amount
export async function PUT(req: NextRequest) {
  const { code, bookingAmount } = await req.json();
  const result = await validateCoupon(code, bookingAmount);
  return NextResponse.json(result);
}

export { markCouponUsed };
