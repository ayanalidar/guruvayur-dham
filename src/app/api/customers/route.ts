import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/customers — list all customers (CRM)
export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search");
  const tag = req.nextUrl.searchParams.get("tag");
  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { phone: { contains: search } },
      { email: { contains: search } },
      { city: { contains: search } },
    ];
  }
  if (tag) where.tags = { contains: tag };
  const customers = await db.customer.findMany({
    where,
    orderBy: { totalRevenue: "desc" },
    take: 200,
  });
  return NextResponse.json({ customers });
}

// POST /api/customers — create or update customer (upsert by phone)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, email, city, preferences, notes, tags } = body;
  const customer = await db.customer.upsert({
    where: { phone },
    create: { name, phone, email, city, preferences, notes, tags },
    update: { name: name || undefined, email, city, preferences, notes, tags },
  });
  return NextResponse.json({ customer });
}

// PATCH /api/customers — update customer
export async function PATCH(req: NextRequest) {
  const { id, data } = await req.json();
  const customer = await db.customer.update({ where: { id }, data });
  return NextResponse.json({ customer });
}

// PUT /api/customers — record a booking for a customer (increments totals)
export async function PUT(req: NextRequest) {
  const { phone, bookingAmount, loyaltyPoints } = await req.json();
  const customer = await db.customer.upsert({
    where: { phone },
    create: {
      name: "Guest",
      phone,
      totalBookings: 1,
      totalRevenue: bookingAmount,
      loyaltyPoints: loyaltyPoints || Math.floor(bookingAmount / 1000),
    },
    update: {
      totalBookings: { increment: 1 },
      totalRevenue: { increment: bookingAmount },
      loyaltyPoints: { increment: loyaltyPoints || Math.floor(bookingAmount / 1000) },
    },
  });
  return NextResponse.json({ customer });
}
