import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limiter";

// GET /api/staff · list all staff (excludes PIN — sensitive)
export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const staff = await db.staffUser.findMany({
    orderBy: { role: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      phone: true,
      lastLoginAt: true,
      createdAt: true,
      // NOTE: PIN is intentionally excluded — never expose via API.
    },
  });
  return NextResponse.json({ staff });
}

// POST /api/staff · create staff (MANAGER only — role elevation is sensitive)
// Allowed fields: name, email, phone, role, pin, active
export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req, ["MANAGER"]);
  if (error) return error;

  const body = await req.json();
  // Whitelist allowed fields — prevent mass assignment of arbitrary fields.
  const { name, email, phone, role, pin, active } = body;
  if (!name || !email || !role || !pin) {
    return NextResponse.json(
      { error: "Missing required fields: name, email, role, pin" },
      { status: 400 }
    );
  }
  // Validate role — prevent creating unknown roles.
  const allowedRoles = ["MANAGER", "RECEPTIONIST", "HOUSEKEEPING", "ACCOUNTANT"];
  if (!allowedRoles.includes(role)) {
    return NextResponse.json({ error: `Invalid role: ${role}` }, { status: 400 });
  }
  // Validate PIN format — 4-6 digits.
  if (typeof pin !== "string" || !/^\d{4,6}$/.test(pin)) {
    return NextResponse.json(
      { error: "PIN must be 4-6 digits" },
      { status: 400 }
    );
  }

  // Check for duplicate email.
  const existing = await db.staffUser.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const staff = await db.staffUser.create({
    data: {
      name, email, phone: phone || null, role, pin, active: active ?? true,
    },
    select: { id: true, name: true, email: true, role: true, active: true, phone: true },
  });
  return NextResponse.json({ staff });
}

// PATCH /api/staff · update staff (role, pin, active) — MANAGER only
// Allowed fields: name, phone, role, pin, active
export async function PATCH(req: NextRequest) {
  const { error } = await requireStaff(req, ["MANAGER"]);
  if (error) return error;

  const { id, data } = await req.json();
  if (!id || !data || typeof data !== "object") {
    return NextResponse.json({ error: "Missing id or data" }, { status: 400 });
  }
  // Whitelist allowed fields — prevent mass assignment.
  const { name, phone, role, pin, active } = data;
  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (role !== undefined) {
    const allowedRoles = ["MANAGER", "RECEPTIONIST", "HOUSEKEEPING", "ACCOUNTANT"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: `Invalid role: ${role}` }, { status: 400 });
    }
    updateData.role = role;
  }
  if (pin !== undefined) {
    if (typeof pin !== "string" || !/^\d{4,6}$/.test(pin)) {
      return NextResponse.json({ error: "PIN must be 4-6 digits" }, { status: 400 });
    }
    updateData.pin = pin;
  }
  if (active !== undefined) updateData.active = Boolean(active);

  const staff = await db.staffUser.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, active: true, phone: true, lastLoginAt: true },
  });
  return NextResponse.json({ staff });
}

// PUT /api/staff · login with PIN — rate limited to prevent brute force
export async function PUT(req: NextRequest) {
  // 5 attempts per minute per IP — 4-digit PINs have 10,000 combinations,
  // so this makes brute force impractical (would take ~33 hours).
  const rl = rateLimit(req, { window: 60, max: 5, key: "staff-pin-login" });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many login attempts. Please wait a minute." },
      { status: 429 }
    );
  }

  const { pin } = await req.json();
  if (!pin || typeof pin !== "string") {
    return NextResponse.json({ error: "PIN required" }, { status: 400 });
  }
  const staff = await db.staffUser.findFirst({ where: { pin, active: true } });
  if (!staff) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }
  await db.staffUser.update({ where: { id: staff.id }, data: { lastLoginAt: new Date() } });
  return NextResponse.json({
    staff: { id: staff.id, name: staff.name, role: staff.role, email: staff.email },
  });
}
