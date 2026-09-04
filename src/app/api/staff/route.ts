import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/staff · list all staff
export async function GET() {
  const staff = await db.staffUser.findMany({ orderBy: { role: "asc" } });
  return NextResponse.json({ staff });
}

// POST /api/staff · create staff
export async function POST(req: NextRequest) {
  const body = await req.json();
  const staff = await db.staffUser.create({ data: body });
  return NextResponse.json({ staff });
}

// PATCH /api/staff · update staff (role, pin, active)
export async function PATCH(req: NextRequest) {
  const { id, data } = await req.json();
  const staff = await db.staffUser.update({ where: { id }, data });
  return NextResponse.json({ staff });
}

// PUT /api/staff · login with PIN
export async function PUT(req: NextRequest) {
  const { pin } = await req.json();
  const staff = await db.staffUser.findFirst({ where: { pin, active: true } });
  if (!staff) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }
  await db.staffUser.update({ where: { id: staff.id }, data: { lastLoginAt: new Date() } });
  return NextResponse.json({ staff: { id: staff.id, name: staff.name, role: staff.role, email: staff.email } });
}
