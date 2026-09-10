import { db } from "@/lib/db";
import crypto from "crypto";

/**
 * Simple password hashing using Node's crypto (no external dependency).
 * In production, use bcrypt or argon2.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

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
 * Create a session for a user
 */
export async function createSession(userId: string, role: string, daysValid = 7) {
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
 * Get user from session token (from cookie or Authorization header)
 */
export async function getUserFromRequest(req: Request): Promise<{ user: any; role: string } | null> {
  // Try cookie first
  const cookie = req.headers.get("cookie") || "";
  const tokenMatch = cookie.match(/session_token=([^;]+)/);
  const token = tokenMatch?.[1] || req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } });
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
    },
    role: session.role,
  };
}

/**
 * Set session cookie on a NextResponse
 */
export function setSessionCookie(token: string): string {
  const isProduction = process.env.NODE_ENV === "production";
  return `session_token=${token}; Path=/; HttpOnly; ${isProduction ? "Secure; " : ""}SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;
}

export function clearSessionCookie(): string {
  return `session_token=; Path=/; HttpOnly; Max-Age=0`;
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
