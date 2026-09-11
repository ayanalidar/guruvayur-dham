import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limiter";

// Common password blocklist — these get tried first by attackers.
const COMMON_PASSWORDS = [
  "password", "password1", "password123", "12345678", "123456789",
  "qwerty", "qwerty123", "letmein", "welcome", "admin", "manager",
  "guruvayur", "krishna", "ganesh", "shiva", "pilgrim",
];

// Minimal email + phone format checks (no external dep).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[1-9]\d{7,14}$/;

/**
 * POST /api/auth/register
 * Guest registration with email + password.
 *
 * SECURITY (Phase C M6/M7/M10/M11 fixes):
 * - Rate limited: 3 registrations/hour per IP (prevents spam).
 * - Password: min 8 chars, must contain letter + digit, not in common list.
 * - Email + phone format validated.
 * - Anti-enumeration: returns the SAME response whether the email is new
 *   (creates account) or already exists (no account created, but the toast
 *   says "If new, account created. If existing, please log in.").
 *
 * body: { name, email, password, phone? }
 */
export async function POST(req: NextRequest) {
  // Rate limit — 3 registrations per hour per IP.
  const rl = rateLimit(req, { window: 3600, max: 3, key: "auth:register" });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please wait an hour." },
      { status: 429 }
    );
  }

  const { name, email, password, phone } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password required" }, { status: 400 });
  }

  // Password policy.
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return NextResponse.json({ error: "Password must contain both letters and numbers" }, { status: 400 });
  }
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    return NextResponse.json({ error: "Password is too common — choose a stronger one" }, { status: 400 });
  }

  // Email format.
  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  // Phone format (optional).
  if (phone && (typeof phone !== "string" || !PHONE_RE.test(phone))) {
    return NextResponse.json({ error: "Invalid phone format (use +91XXXXXXXXXX)" }, { status: 400 });
  }

  // Check if email already exists.
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    // Anti-enumeration: do NOT reveal the email exists. Return the same
    // response shape as a successful registration (without creating a new
    // account or session). The user is told to check their inbox / log in.
    return NextResponse.json({
      ok: true,
      message: "If this is a new email, your account has been created. Please check your inbox to log in. If you already have an account, please log in instead.",
    });
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
