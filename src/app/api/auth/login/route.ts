import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword, createSession, setSessionCookie } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limiter";
import crypto from "crypto";
import { generateTOTP } from "@/app/api/auth/2fa/route";

/**
 * POST /api/auth/login
 * Rate limited: 5 attempts per minute per IP.
 *
 * SECURITY (Round 3 F1 fix): MANAGER 2FA now actually verifies the TOTP code,
 * not just checks the enabled flag. Flow:
 * 1. POST { type:"staff", email, password } → if MANAGER + 2FA enabled,
 *    return { requires2FACode: true, twoFactorChallenge: <random token> } (no session).
 * 2. Frontend collects 6-digit TOTP from user.
 * 3. POST { type:"staff-2fa", email, password, totpCode } → verifies TOTP, creates session.
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

  // ===== 1. STAFF PIN LOGIN (legacy — 4-digit PIN) =====
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
    // SECURITY (H16 + F1): MANAGER role requires 2FA — and now actually verifies the TOTP.
    if (staff.role === "MANAGER") {
      const tf = await db.twoFactorSecret.findUnique({ where: { userId: user.id } });
      if (!tf?.enabled) {
        return NextResponse.json({
          error: "MANAGER role requires 2FA. Please log in via email + password + 2FA instead of PIN, or ask an admin to set up 2FA on your account.",
          requires2FA: true,
        }, { status: 403 });
      }
      // PIN login doesn't carry a TOTP code — MANAGERs must use email+password+TOTP.
      return NextResponse.json({
        error: "MANAGER role must use email + password + 2FA login. PIN login is disabled for MANAGER.",
        requires2FA: true,
      }, { status: 403 });
    }
    const session = await createSession(user.id, staff.role);
    const res = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: staff.role, mustChangePassword: staff.mustChangePassword },
      session: { token: session.token, expiresAt: session.expiresAt },
    });
    res.headers.set("Set-Cookie", setSessionCookie(session.token));
    return res;
  }

  // ===== 2. STAFF EMAIL + PASSWORD (preferred — uses passwordHash) =====
  if (type === "staff") {
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    const staff = await db.staffUser.findUnique({ where: { email } });
    if (!staff || !staff.active) {
      // M11 timing equalization — run dummy hash to equalize response time.
      verifyPassword(password, "dummy:salt:0000000000000000000000000000000000000000000000000000000000000000");
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // SECURITY (M9): try passwordHash first, fall back to legacy PIN.
    let authed = false;
    if (staff.passwordHash) {
      authed = verifyPassword(password, staff.passwordHash);
    } else {
      // Legacy fallback — PIN stored in plaintext.
      authed = password === staff.pin;
    }
    if (!authed) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    let user = await db.user.findFirst({ where: { staffId: staff.id } });
    if (!user) {
      user = await db.user.create({
        data: { name: staff.name, email: staff.email, phone: staff.phone, role: "STAFF", staffId: staff.id },
      });
    }

    // SECURITY (H16 + F1): MANAGER role requires 2FA — actual TOTP verification.
    if (staff.role === "MANAGER") {
      const tf = await db.twoFactorSecret.findUnique({ where: { userId: user.id } });
      if (!tf?.enabled) {
        return NextResponse.json({
          error: "MANAGER role requires 2FA. Please set up 2FA via /api/auth/2fa POST before logging in.",
          requires2FA: true,
        }, { status: 403 });
      }
      // 2FA challenge — return requires2FACode flag, NO session.
      // Frontend collects TOTP code and calls back with type:"staff-2fa".
      return NextResponse.json({
        requires2FACode: true,
        email, // echo back so frontend knows which user is mid-flow
        message: "Enter your 6-digit authenticator code.",
      }, { status: 200 });
    }

    // Non-MANAGER staff — no 2FA required, create session directly.
    const session = await createSession(user.id, staff.role);
    const res = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: staff.role, mustChangePassword: staff.mustChangePassword },
      session: { token: session.token, expiresAt: session.expiresAt },
    });
    res.headers.set("Set-Cookie", setSessionCookie(session.token));
    return res;
  }

  // ===== 2b. STAFF 2FA VERIFICATION (second step of MANAGER login) =====
  if (type === "staff-2fa") {
    const { email, password, totpCode } = body;
    if (!email || !password || !totpCode) {
      return NextResponse.json({ error: "Email, password, and totpCode required" }, { status: 400 });
    }
    if (typeof totpCode !== "string" || !/^\d{6}$/.test(totpCode)) {
      return NextResponse.json({ error: "TOTP code must be 6 digits" }, { status: 400 });
    }
    // Re-verify password (the 2FA challenge response doesn't carry a session).
    const staff = await db.staffUser.findUnique({ where: { email } });
    if (!staff || !staff.active) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    let authed = false;
    if (staff.passwordHash) {
      authed = verifyPassword(password, staff.passwordHash);
    } else {
      authed = password === staff.pin;
    }
    if (!authed) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    let user = await db.user.findFirst({ where: { staffId: staff.id } });
    if (!user) {
      // Should not happen (user created in step 1), but guard anyway.
      return NextResponse.json({ error: "User record not found — restart login flow" }, { status: 500 });
    }
    const tf = await db.twoFactorSecret.findUnique({ where: { userId: user.id } });
    if (!tf?.enabled) {
      return NextResponse.json({ error: "2FA not enabled on this account" }, { status: 403 });
    }
    // Verify TOTP code (or backup code).
    const expectedCode = generateTOTP(tf.secret);
    let codeValid = totpCode === expectedCode;
    if (!codeValid) {
      // Check backup codes.
      const backups: string[] = tf.backupCodes ? JSON.parse(tf.backupCodes) : [];
      if (backups.includes(totpCode.toUpperCase())) {
        codeValid = true;
        // Remove used backup code.
        const remaining = backups.filter(c => c !== totpCode.toUpperCase());
        await db.twoFactorSecret.update({
          where: { userId: user.id },
          data: { backupCodes: JSON.stringify(remaining) },
        });
      }
    }
    if (!codeValid) {
      return NextResponse.json({ error: "Invalid 2FA code" }, { status: 401 });
    }
    // 2FA verified — create session.
    const session = await createSession(user.id, staff.role);
    const res = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: staff.role, mustChangePassword: staff.mustChangePassword },
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
      // SECURITY (M11): Equalize timing by running a dummy password
      // verification. Without this, an attacker can enumerate emails via
      // response-time differences (no verifyPassword call when user=null).
      verifyPassword(password, "dummy:salt:hash:0000000000000000000000000000000000000000000000000000000000000000");
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
    // SECURITY (Round 3 S1+S2 fix): use exact-match via regex extraction
    // instead of `body: { contains: otp }` (substring match — let attackers
    // log in with otp:"0" or any common substring). Extract the OTP from
    // the body with a strict regex and compare with timingSafeEqual.
    if (typeof otp !== "string" || !/^\d{4,6}$/.test(otp)) {
      return NextResponse.json({ error: "Invalid OTP format" }, { status: 400 });
    }
    // Find the most recent unused SMS OTP notification for this phone.
    const otpNotif = await db.notification.findFirst({
      where: {
        type: "SMS",
        recipient: phone,
        status: "SENT", // NOT "USED" — prevents replay (S2 fix)
        createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) }, // 5-min validity
      },
      orderBy: { createdAt: "desc" },
    });
    if (!otpNotif) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
    }
    // Extract OTP from the body via strict regex (must match exactly 4-6 digits).
    const match = otpNotif.body.match(/OTP is (\d{4,6})\./);
    if (!match) {
      return NextResponse.json({ error: "Invalid OTP record" }, { status: 500 });
    }
    const storedOtp = match[1];
    // Constant-time comparison to prevent timing attacks.
    const otpBuf = Buffer.from(String(otp));
    const storedBuf = Buffer.from(storedOtp);
    if (otpBuf.length !== storedBuf.length || !crypto.timingSafeEqual(otpBuf, storedBuf)) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
    }
    // SECURITY (S2): mark the OTP notification as USED so it can't be replayed.
    await db.notification.update({
      where: { id: otpNotif.id },
      data: { status: "USED" },
    });
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
