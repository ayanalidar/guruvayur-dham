import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff, hashPassword } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limiter";
import crypto from "crypto";

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
// Allowed fields: name, email, phone, role, pin, password, active, mustChangePassword
export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req, ["MANAGER"]);
  if (error) return error;

  const body = await req.json();
  // Whitelist allowed fields — prevent mass assignment of arbitrary fields.
  const { name, email, phone, role, pin, password, active, mustChangePassword } = body;
  if (!name || !email || !role) {
    return NextResponse.json(
      { error: "Missing required fields: name, email, role" },
      { status: 400 }
    );
  }
  // Either pin or password is required.
  if (!pin && !password) {
    return NextResponse.json(
      { error: "Either pin (4-6 digits) or password (8+ chars) is required" },
      { status: 400 }
    );
  }
  // Validate role.
  const allowedRoles = ["MANAGER", "RECEPTIONIST", "HOUSEKEEPING", "ACCOUNTANT"];
  if (!allowedRoles.includes(role)) {
    return NextResponse.json({ error: `Invalid role: ${role}` }, { status: 400 });
  }
  // Validate PIN format (if provided).
  if (pin !== undefined && (typeof pin !== "string" || !/^\d{4,6}$/.test(pin))) {
    return NextResponse.json({ error: "PIN must be 4-6 digits" }, { status: 400 });
  }
  // Validate password (if provided) — same policy as guest registration.
  let hashedPassword: string | undefined;
  if (password !== undefined) {
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json({ error: "Password must contain both letters and numbers" }, { status: 400 });
    }
    hashedPassword = await hashPassword(password);
  }

  // Check for duplicate email.
  const existing = await db.staffUser.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const staff = await db.staffUser.create({
    data: {
      name,
      email,
      phone: phone || null,
      role,
      pin: pin || crypto.randomInt(1000, 10000).toString(), // random fallback if only password given
      passwordHash: hashedPassword || null,
      active: active ?? true,
      mustChangePassword: mustChangePassword ?? false,
    },
    select: { id: true, name: true, email: true, role: true, active: true, phone: true, mustChangePassword: true },
  });
  return NextResponse.json({ staff });
}

// PATCH /api/staff · update staff (role, pin, password, active) — MANAGER only
// Allowed fields: name, phone, role, pin, password, active, mustChangePassword
export async function PATCH(req: NextRequest) {
  const { error } = await requireStaff(req, ["MANAGER"]);
  if (error) return error;

  const { id, data } = await req.json();
  if (!id || !data || typeof data !== "object") {
    return NextResponse.json({ error: "Missing id or data" }, { status: 400 });
  }
  // Whitelist allowed fields.
  const { name, phone, role, pin, password, active, mustChangePassword } = data;
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
  if (password !== undefined) {
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json({ error: "Password must contain both letters and numbers" }, { status: 400 });
    }
    updateData.passwordHash = await hashPassword(password);
    // Setting a new password clears mustChangePassword.
    updateData.mustChangePassword = false;
  }
  if (active !== undefined) updateData.active = Boolean(active);
  if (mustChangePassword !== undefined) updateData.mustChangePassword = Boolean(mustChangePassword);

  const staff = await db.staffUser.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, active: true, phone: true, lastLoginAt: true, mustChangePassword: true, passwordHash: true },
  });
  // Don't return the passwordHash.
  const { passwordHash: _omit, ...safeStaff } = staff;
  return NextResponse.json({ staff: safeStaff });
}

// PUT /api/staff · login with PIN — rate limited to prevent brute force
export async function PUT(req: NextRequest) {
  // 5 attempts per minute per IP — 4-digit PINs have 10,000 combinations,
  // so this makes brute force impractical (would take ~33 hours).
  const rl = await rateLimit(req, { window: 60, max: 5, key: "staff-pin-login" });
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
