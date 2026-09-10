import { NextRequest, NextResponse } from "next/server";

/**
 * Simple in-memory rate limiter.
 * In production, use Redis or a dedicated rate limiting service.
 *
 * Usage in API routes:
 *   import { rateLimit } from "@/lib/rate-limiter";
 *   const allowed = rateLimit(req, { window: 60, max: 10 });
 *   if (!allowed.ok) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();
const blockedIps = new Map<string, number>(); // ip -> blocked count

interface RateLimitOptions {
  window?: number; // time window in seconds (default: 60)
  max?: number; // max requests per window (default: 30)
  key?: string; // custom key prefix (default: endpoint path)
}

export function rateLimit(req: NextRequest, opts: RateLimitOptions = {}): { ok: boolean; remaining: number; resetAt: number; blocked: boolean } {
  const window = opts.window || 60;
  const max = opts.max || 30;
  const keyPrefix = opts.key || req.nextUrl.pathname;

  // Get IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";

  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();
  const windowMs = window * 1000;

  const existing = store.get(key);
  if (!existing || existing.resetAt < now) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1, resetAt: now + windowMs, blocked: false };
  }

  existing.count++;
  const remaining = Math.max(0, max - existing.count);

  if (existing.count > max) {
    // Rate limited
    blockedIps.set(ip, (blockedIps.get(ip) || 0) + 1);
    return { ok: false, remaining: 0, resetAt: existing.resetAt, blocked: true };
  }

  return { ok: true, remaining, resetAt: existing.resetAt, blocked: false };
}

/**
 * Get blocked IPs stats (for admin dashboard)
 */
export function getRateLimitStats() {
  return {
    trackedKeys: store.size,
    blockedIps: Array.from(blockedIps.entries()).map(([ip, count]) => ({ ip, blocks: count })),
    totalBlocks: Array.from(blockedIps.values()).reduce((s, c) => s + c, 0),
  };
}

/**
 * Clear rate limit store (for testing)
 */
export function clearRateLimits() {
  store.clear();
  blockedIps.clear();
}
