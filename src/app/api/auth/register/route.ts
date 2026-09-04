import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth";

/**
 * POST /api/auth/register
 * Guest registration with email + password
 * body: { name, email, password, phone? }
 */
export async function POST(req: NextRequest) {
  const { name, email, password, phone } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password required" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  // Check if email already exists
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered. Please login." }, { status: 409 });
  }

  const user = await db.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      passwordHash: hashPassword(password),
      role: "GUEST",
    },
  });

  // Also create a CRM Customer record
  const customer = await db.customer.create({
    data: {
      name,
      email,
      phone: phone || "",
      tags: "REGISTERED",
    },
  });
  await db.user.update({
    where: { id: user.id },
    data: { customerId: customer.id },
  });

  const session = await createSession(user.id, "GUEST");
  const res = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: "GUEST", phone: user.phone },
    session: { token: session.token, expiresAt: session.expiresAt },
    message: "Account created successfully!",
  });
  res.headers.set("Set-Cookie", setSessionCookie(session.token));
  return res;
}
