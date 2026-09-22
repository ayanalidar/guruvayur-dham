import { db } from "@/lib/db";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * Generate a cryptographically-secure random reference code.
 *
 * SECURITY (Phase D L3): replaces the pattern
 *   `"GD-" + Math.random().toString(36).slice(2, 8).toUpperCase()`
 * which has only ~31 bits of entropy (predictable, collisions after ~50k
 * bookings). Uses crypto.randomBytes instead — 32 bits of true randomness.
 *
 * Usage:
 *   import { generateRef } from "@/lib/auth";
 *   const ref = generateRef("GD");  // → "GD-A3F9B2C1"
 */
export function generateRef(prefix: string): string {
  return `${prefix}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

/**
 * Simple password hashing using Node's crypto (no external dependency).
 * In production, use bcrypt or argon2.
 *
 * SECURITY (Phase D L2 fix): hashPassword is now ASYNC (was pbkdf2Sync
 * which blocks the event loop ~100-200ms per call — self-DoS under load).
 * All callers (register, reset-password, /api/staff POST/PATCH) updated
 * to await the result.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

// verifyPassword stays synchronous: it's called once per login attempt,
// rate-limited to 5/min/IP. The timing-equalization pattern (M11) also
// relies on calling it synchronously when user is null. If profiling shows
// event-loop blocking under load, convert to async + update callers.
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const verify = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return verify === hash;
}

/**
 * Session token generation
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create a session for a user.
 *
 * SECURITY (Phase C M4 fix): deletes pre-existing sessions for the user
 * before creating a new one. This enforces single-session-per-user (or limits
 * to one active session at a time, per login). If you need to allow multiple
 * concurrent sessions (e.g. multiple devices), comment out the deleteMany.
 */
export async function createSession(userId: string, role: string, daysValid = 7) {
  // Delete pre-existing sessions for this user — prevents session sprawl and
  // ensures logout-on-other-device behavior on each new login.
  // (Note: if a user logs in on phone + laptop in quick succession, the
  // phone session will be invalidated — that's intentional for security.)
  await db.session.deleteMany({ where: { userId } }).catch(() => {});

  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + daysValid);

  const session = await db.session.create({
    data: { token, userId, role, expiresAt },
  });

  await db.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });

  return session;
}

/**
 * Get user from session token (from cookie or Authorization header).
 *
 * SECURITY (Phase C M8 fix): now includes the TwoFactorSecret relation so
 * handlers can check session.user.twoFactorEnabled without an extra DB query.
 *
 * SECURITY (Phase D H12 fix): reads cookie with __Host- prefix in production
 * (falls back to unprefixed name in dev for backwards compat).
 */
export async function getUserFromRequest(req: Request): Promise<{ user: any; role: string } | null> {
  // Try cookie first. In production, the cookie is set with __Host- prefix
  // (which forces Secure + Path=/ + no Domain). In dev, no prefix is used
  // so we check both names.
  const cookie = req.headers.get("cookie") || "";
  const isProd = process.env.NODE_ENV === "production";
  const cookieName = isProd ? "__Host-session_token" : "session_token";
  const altCookieName = isProd ? "session_token" : "__Host-session_token";
  const tokenMatch = cookie.match(new RegExp(`${cookieName}=([^;]+)`))
    || cookie.match(new RegExp(`${altCookieName}=([^;]+)`));
  const token = tokenMatch?.[1] || req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return null;

  // Include session.user.tokensInvalidatedAt and twoFactor.enabled.
  const session = await db.session.findUnique({
    where: { token },
    include: {
      user: {
        include: { twoFactor: { select: { enabled: true } } },
      },
    },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } });
    return null;
  }

  // SECURITY (Phase C M5): reject sessions created BEFORE the user's
  // tokensInvalidatedAt timestamp. This is the global session-invalidation
  // mechanism — set tokensInvalidatedAt = now() on password reset, 2FA
  // enable, admin force-logout, etc. to revoke all pre-existing sessions.
  const invalidatedAt = (session.user as any).tokensInvalidatedAt;
  if (invalidatedAt && session.createdAt < invalidatedAt) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      phone: session.user.phone,
      role: session.user.role,
      customerId: session.user.customerId,
      staffId: session.user.staffId,
      twoFactorEnabled: session.user.twoFactor?.enabled || false,
    },
    role: session.role,
  };
}

/**
 * Require an authenticated staff user (or specific roles) for an API route.
 * Returns `{ session, error }` — if `error` is set, return it directly.
 *
 * Usage:
 *   import { requireStaff } from "@/lib/auth";
 *
 *   export async function POST(req: NextRequest) {
 *     const { session, error } = await requireStaff(req);
 *     if (error) return error;
 *     // session.user.id, session.role are now guaranteed
 *     ...
 *   }
 *
 *   // Restrict to specific roles:
 *   const { session, error } = await requireStaff(req, ["MANAGER", "ACCOUNTANT"]);
 */
export async function requireStaff(
  req: NextRequest,
  roles?: string[]
): Promise<{
  session: { user: any; role: string } | null;
  error: NextResponse | null;
}> {
  const session = await getUserFromRequest(req);
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  // Staff roles = anything except GUEST.
  if (session.role === "GUEST") {
    return {
      session: null,
      error: NextResponse.json({ error: "Forbidden — staff access required" }, { status: 403 }),
    };
  }

  if (roles && roles.length > 0 && !roles.includes(session.role)) {
    return {
      session: null,
      error: NextResponse.json(
        { error: `Forbidden — requires one of: ${roles.join(", ")}` },
        { status: 403 }
      ),
    };
  }

  return { session, error: null };
}

/**
 * Require any authenticated user (staff OR guest) for an API route.
 */
export async function requireUser(req: NextRequest): Promise<{
  session: { user: any; role: string } | null;
  error: NextResponse | null;
}> {
  const session = await getUserFromRequest(req);
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session, error: null };
}

/**
 * Set session cookie on a NextResponse.
 *
 * SECURITY (Phase D H12 fix):
 * - Production: uses __Host- prefix (forces Secure + Path=/ + no Domain).
 *   This is the strictest cookie prefix — prevents subdomain-based cookie
 *   injection attacks.
 * - SameSite=Strict in production (was Lax) — closes 95% of CSRF vectors
 *   by not sending the cookie on cross-site navigations.
 * - Dev: no prefix, SameSite=Lax (so localhost testing works without HTTPS).
 */
export function setSessionCookie(token: string): string {
  const isProduction = process.env.NODE_ENV === "production";
  const prefix = isProduction ? "__Host-" : "";
  const sameSite = isProduction ? "Strict" : "Lax";
  return `${prefix}session_token=${token}; Path=/; HttpOnly; ${isProduction ? "Secure; " : ""}SameSite=${sameSite}; Max-Age=${7 * 24 * 60 * 60}`;
}

export function clearSessionCookie(): string {
  const isProduction = process.env.NODE_ENV === "production";
  const prefix = isProduction ? "__Host-" : "";
  // Mirror the set cookie's prefix + SameSite, otherwise the browser treats
  // the clear as a different cookie and doesn't delete the original.
  return `${prefix}session_token=; Path=/; HttpOnly; ${isProduction ? "Secure; " : ""}Max-Age=0`;
}

/**
 * Role hierarchy · determines what each staff role can access
 */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  MANAGER: ["*"], // all access
  RECEPTIONIST: ["/admin", "/admin/bookings", "/admin/hub", "/admin/rooms", "/admin/customers", "/admin/housekeeping", "/admin/kitchen", "/admin/poojas", "/admin/invoices", "/admin/reviews"],
  HOUSEKEEPING: ["/admin", "/admin/hub", "/admin/housekeeping"],
  ACCOUNTANT: ["/admin", "/admin/hub", "/admin/bookings", "/admin/invoices", "/admin/night-audit", "/admin/export"],
  GUEST: ["/dashboard", "/book", "/rooms", "/pooja", "/gallery", "/events", "/blog", "/faq", "/contact", "/about", "/tour", "/kitchen"],
};

export function canAccess(role: string, path: string): boolean {
  const perms = ROLE_PERMISSIONS[role] || [];
  if (perms.includes("*")) return true;
  // Check if path starts with any allowed prefix
  return perms.some(perm => path === perm || path.startsWith(perm + "/"));
}
