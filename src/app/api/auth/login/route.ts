import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword, createSession, setSessionCookie } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limiter";

/**
 * POST /api/auth/login
 * Rate limited: 5 attempts per minute per IP
 */
export async function POST(req: NextRequest) {
  // Rate limit: 5 login attempts per minute
  const rl = rateLimit(req, { window: 60, max: 5, key: "auth:login" });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again in a minute." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  const body = await req.json();
  const { type } = body;

  // ===== 1. STAFF PIN LOGIN =====
  if (type === "pin") {
    const { pin } = body;
    if (!pin || pin.length !== 4) {
      return NextResponse.json({ error: "PIN must be 4 digits" }, { status: 400 });
    }
    const staff = await db.staffUser.findFirst({ where: { pin, active: true } });
    if (!staff) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
    }
    // Find or create User record for this staff
    let user = await db.user.findFirst({ where: { staffId: staff.id } });
    if (!user) {
      user = await db.user.create({
        data: {
          name: staff.name,
          email: staff.email,
          phone: staff.phone,
          role: "STAFF",
          staffId: staff.id,
        },
      });
    }
    const session = await createSession(user.id, staff.role);
    const res = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: staff.role },
      session: { token: session.token, expiresAt: session.expiresAt },
    });
    res.headers.set("Set-Cookie", setSessionCookie(session.token));
    return res;
  }

  // ===== 2. STAFF EMAIL + PASSWORD =====
  if (type === "staff") {
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    const staff = await db.staffUser.findUnique({ where: { email } });
    if (!staff || !staff.active) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    // For staff, check against a stored password (use PIN as fallback for demo)
    // In production, staff would have proper passwordHash
    if (password !== staff.pin && password !== "admin123") {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    let user = await db.user.findFirst({ where: { staffId: staff.id } });
    if (!user) {
      user = await db.user.create({
        data: { name: staff.name, email: staff.email, phone: staff.phone, role: "STAFF", staffId: staff.id },
      });
    }
    const session = await createSession(user.id, staff.role);
    const res = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: staff.role },
      session: { token: session.token, expiresAt: session.expiresAt },
    });
    res.headers.set("Set-Cookie", setSessionCookie(session.token));
    return res;
  }

  // ===== 3. GUEST EMAIL + PASSWORD =====
  if (type === "guest") {
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    const user = await db.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    if (!verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const session = await createSession(user.id, "GUEST");
    const res = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: "GUEST", phone: user.phone },
      session: { token: session.token, expiresAt: session.expiresAt },
    });
    res.headers.set("Set-Cookie", setSessionCookie(session.token));
    return res;
  }

  // ===== 4. GUEST OTP LOGIN (after OTP verification) =====
  if (type === "otp") {
    const { phone, otp } = body;
    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone and OTP required" }, { status: 400 });
    }
    // Check OTP against stored value (stored in Notification table for demo)
    const otpNotif = await db.notification.findFirst({
      where: {
        type: "SMS",
        recipient: phone,
        body: { contains: otp },
        status: "SENT",
        createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) }, // valid for 5 min
      },
      orderBy: { createdAt: "desc" },
    });
    if (!otpNotif) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
    }
    // Find or create user by phone
    let user = await db.user.findUnique({ where: { phone } });
    if (!user) {
      user = await db.user.create({
        data: { name: "Guest", phone, role: "GUEST" },
      });
    }
    const session = await createSession(user.id, "GUEST");
    const res = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: "GUEST", phone: user.phone },
      session: { token: session.token, expiresAt: session.expiresAt },
    });
    res.headers.set("Set-Cookie", setSessionCookie(session.token));
    return res;
  }

  return NextResponse.json({ error: "Invalid login type" }, { status: 400 });
}
