import { db } from "@/lib/db";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * Generate a cryptographically-secure random reference code.
 *
 * SECURITY (Phase D L3): replaces the pattern
 *   `"GD-" + Math.random().toString(36).slice(2, 8).toUpperCase()`
 * which has only ~31 bits of entropy (predictable, collisions after ~50k
 * bookings). Uses crypto.randomBytes instead - 32 bits of true randomness.
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
 * which blocks the event loop ~100-200ms per call - self-DoS under load).
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
  // Delete pre-existing sessions for this user - prevents session sprawl and
  // ensures logout-on-other-device behavior on each new login.
  // (Note: if a user logs in on phone + laptop in quick succession, the
  // phone session will be invalidated - that's intentional for security.)
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
  // Read the session cookie. As of the cookie-fix (refresh-logs-out bug),
  // we ALWAYS write the cookie with the unprefixed name `session_token`
  // (see setSessionCookie). However, existing sessions created before
  // the fix used `__Host-session_token` in production — we still read
  // that name too so logged-in users don't get kicked out by the fix.
  // After 7 days (cookie Max-Age) all old __Host- cookies expire
  // naturally and we can drop this dual-read.
  const cookie = req.headers.get("cookie") || "";
  const tokenMatch = cookie.match(/session_token=([^;]+)/)
    || cookie.match(/__Host-session_token=([^;]+)/);
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
  // mechanism - set tokensInvalidatedAt = now() on password reset, 2FA
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
 * Returns `{ session, error }` - if `error` is set, return it directly.
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
      error: NextResponse.json({ error: "Forbidden - staff access required" }, { status: 403 }),
    };
  }

  if (roles && roles.length > 0 && !roles.includes(session.role)) {
    return {
      session: null,
      error: NextResponse.json(
        { error: `Forbidden - requires one of: ${roles.join(", ")}` },
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
 * Detect if a request was made over HTTPS.
 *
 * Vercel (and most reverse proxies) terminate TLS at the edge and forward
 * to the Node/Next.js runtime over plain HTTP. The original protocol is
 * preserved in the `X-Forwarded-Proto` header — we MUST read this to know
 * whether the actual client<->edge connection was HTTPS.
 *
 * This is the difference between `Secure` cookies being persisted by the
 * browser (HTTPS) or silently dropped (HTTP). See the comment on
 * `setSessionCookie` for the full bug write-up.
 */
export function detectHttps(req: Request | NextRequest): boolean {
  // Check the forwarded-proto header (Vercel, Cloudflare, AWS ALB, etc.)
  const forwarded = req.headers.get("x-forwarded-proto");
  if (forwarded === "https") return true;
  if (forwarded === "http") return false;
  // Fall back to the direct connection protocol (localhost dev / direct HTTPS)
  if (req instanceof NextRequest) {
    return req.nextUrl.protocol === "https:";
  }
  return false;
}

/**
 * Set session cookie on a NextResponse.
 *
 * COOKIE FIX (refresh-logs-out bug):
 *
 * ROOT CAUSE:
 *   - Production was using `__Host-session_token` + `Secure` + `SameSite=Strict`.
 *   - The `__Host-` prefix REQUIRES `Secure`, which REQUIRES HTTPS.
 *   - On staging/preview environments that serve HTTP (no TLS), the browser
 *     silently REJECTS the cookie. The login API returns success, but the
 *     cookie is never saved. The very next request (refresh, click, fetch)
 *     sends no cookie → /api/auth/session returns `authenticated: false` →
 *     AdminGuard kicks the user back to "Admin Access Required".
 *   - Even on real HTTPS, `SameSite=Strict` blocks the cookie from being
 *     sent on top-level navigations originating from another origin
 *     (e.g. user clicks an email link to /admin/hub → cookie NOT sent →
 *     user appears logged out on first request → must refresh once).
 *
 * FIX:
 *   1. Drop the `__Host-` prefix entirely. `HttpOnly + SameSite=Lax +
 *      Secure` is already strong; the `__Host-` prefix is overkill and
 *      its strict requirements cause more bugs than it prevents.
 *   2. Set `Secure` ONLY when we know the request was HTTPS (via
 *      `detectHttps()` reading `X-Forwarded-Proto`). This way HTTP
 *      staging environments work, and production HTTPS still gets Secure.
 *   3. Use `SameSite=Lax` everywhere (instead of Strict in prod). Lax
 *      blocks CSRF on cross-origin POSTs (the dangerous vector) but
 *      allows the cookie on top-level GET navigations from external
 *      referrers. Strict broke email-link / Google-result / referrer
 *      navigation back to the site.
 *   4. Read-path already supports BOTH prefixed and unprefixed cookie
 *      names (see getUserFromRequest), so existing sessions keep working.
 *
 * SECURITY TRADE-OFF ACCEPTED:
 *   - Losing `__Host-` prefix: we lose protection against subdomain-based
 *     cookie injection. Mitigated by `HttpOnly` + `SameSite=Lax` +
 *     `Secure` (when HTTPS) + the fact that we run on a single domain.
 *   - Lax vs Strict: Lax still blocks the CSRF POST vector. Top-level
 *     GET navigations from external sources are read-only (dashboard
 *     renders but no state change), so the residual risk is minimal.
 */
export function setSessionCookie(token: string, isHttps: boolean = false): string {
  const secure = isHttps ? "Secure; " : "";
  // SameSite=Lax everywhere — strict was breaking email-link / Google-result
  // navigation to /admin/* (cookie not sent on first request).
  const sameSite = "Lax";
  return `session_token=${token}; Path=/; HttpOnly; ${secure}SameSite=${sameSite}; Max-Age=${7 * 24 * 60 * 60}`;
}

export function clearSessionCookie(isHttps: boolean = false): string {
  // Mirror the set cookie's flags exactly, otherwise the browser treats
  // the clear as a different cookie and doesn't delete the original.
  const secure = isHttps ? "Secure; " : "";
  return `session_token=; Path=/; HttpOnly; ${secure}SameSite=Lax; Max-Age=0`;
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
