import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

const CreateCustomerSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().min(1).max(30),
  email: z.string().email().optional(),
  city: z.string().max(100).optional(),
  preferences: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().max(500).optional(),
});

const UpdateCustomerSchema = z.object({
  id: z.string().min(1),
  data: z.record(z.string(), z.any()),
});

const RecordBookingSchema = z.object({
  phone: z.string().min(1).max(30),
  bookingAmount: z.coerce.number().min(0),
  loyaltyPoints: z.coerce.number().int().min(0).optional(),
});

// GET /api/customers · list all customers (CRM)
export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

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

// POST /api/customers · create or update customer (upsert by phone)
export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = CreateCustomerSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { name, phone, email, city, preferences, notes, tags } = parsed.data;
  const customer = await db.customer.upsert({
    where: { phone },
    create: { name, phone, email, city, preferences, notes, tags },
    update: { name: name || undefined, email, city, preferences, notes, tags },
  });
  return NextResponse.json({ customer });
}

// PATCH /api/customers · update customer
export async function PATCH(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = UpdateCustomerSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { id, data } = parsed.data;
  const customer = await db.customer.update({ where: { id }, data: data as any });
  return NextResponse.json({ customer });
}

// PUT /api/customers · record a booking for a customer (increments totals)
export async function PUT(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = RecordBookingSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { phone, bookingAmount, loyaltyPoints } = parsed.data;
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
