import { NextRequest, NextResponse } from "next/server";
import { getSetting, getCachedSetting } from "@/lib/settings";

/**
 * Rate limiter — hybrid in-memory + optional Upstash Redis.
 *
 * FUNCTIONAL (Round 3 F10 fix): on Vercel serverless, each function invocation
 * may be a fresh instance → the in-memory Map resets → limits are per-instance,
 * not per-IP. This was effectively no rate limiting in production.
 *
 * Now: if UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set (either in
 * the encrypted Setting table or in process.env), we use Upstash Redis
 * (serverless-friendly HTTP-based Redis) for true distributed rate limiting.
 * Otherwise we fall back to in-memory (works on VPS where the app is a single
 * long-lived process, and in dev).
 *
 * SelfReliant-Refactor: UPSTASH_* env vars are now read at runtime via
 * getSetting() — admin can rotate Redis credentials from the Settings UI
 * without a redeploy. getRateLimitStats() stays synchronous and uses the
 * cache-only getCachedSetting() to report `redisEnabled` as a best-effort
 * approximation (may lag by up to the 5-minute cache TTL).
 *
 * Setup:
 *   1. Create a free Upstash Redis database at https://upstash.com
 *   2. Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN either in .env
 *      or via the admin Settings UI (category INTEGRATION).
 *   3. (Optional) `npm install @upstash/redis` for typed client — currently
 *      we use raw fetch to avoid adding a dep, but you can swap to the SDK.
 *
 * Usage in API routes:
 *   import { rateLimit } from "@/lib/rate-limiter";
 *   const allowed = rateLimit(req, { window: 60, max: 10 });
 *   if (!allowed.ok) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
 *
 * Note: rateLimit is async when Redis is configured — callers should `await`
 * rateLimit(req, opts). For backwards compat, we return a Promise that
 * resolves to the same shape as before.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory fallback store (used in dev / VPS / when Redis is not configured).
const store = new Map<string, RateLimitEntry>();
const blockedIps = new Map<string, number>();

// Periodically clean up expired entries to prevent unbounded Map growth.
// (In Vercel serverless, this never runs since the process dies between
// requests. On VPS, setInterval fires every 5 min.)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of store) {
      if (v.resetAt < now) store.delete(k);
    }
    // Clean up blockedIps entries older than 1 hour.
    // (blockedIps doesn't track timestamps, so just cap at 1000 entries.)
    if (blockedIps.size > 1000) blockedIps.clear();
  }, 5 * 60 * 1000).unref?.();
}

interface RateLimitOptions {
  window?: number; // time window in seconds (default: 60)
  max?: number; // max requests per window (default: 30)
  key?: string; // custom key prefix (default: endpoint path)
}

interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
  blocked: boolean;
}

/**
 * Upstash Redis INCR + EXPIRE pipeline via REST API.
 * Returns the new count after increment, or null on error.
 *
 * SelfReliant-Refactor: URL + token are read at runtime via getSetting() so
 * admin can rotate them via the Settings UI. The settings cache (5 min TTL)
 * keeps this from adding a DB query on every rate-limited request.
 */
async function redisIncrement(key: string, windowSec: number): Promise<number | null> {
  const upstashUrl = await getSetting("UPSTASH_REDIS_REST_URL");
  const upstashToken = await getSetting("UPSTASH_REDIS_REST_TOKEN");
  if (!upstashUrl || !upstashToken) return null;
  try {
    // Upstash REST pipeline: INCR + EXPIRE (only set EXPIRE if it's a new key).
    const res = await fetch(`${upstashUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${upstashToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, String(windowSec), "NX"], // only set TTL if key is new
      ]),
    });
    if (!res.ok) return null;
    const data = await res.json() as any[];
    // data[0] is the INCR result.
    const count = data?.[0]?.result;
    return typeof count === "number" ? count : null;
  } catch {
    return null;
  }
}

/**
 * Rate limit a request. Returns { ok, remaining, resetAt, blocked }.
 *
 * If UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set, uses Redis
 * for distributed rate limiting (works on Vercel serverless). Otherwise
 * falls back to in-memory (works on VPS / dev).
 *
 * Note: this function is now async (returns a Promise) to support Redis.
 * Existing callers using `const rl = rateLimit(req, opts); if (!rl.ok)` will
 * still work because the result has the same shape — but they should `await`
 * to get the real value. (Without await, the result is a Promise which is
 * truthy, so `!rl.ok` is false and the rate limit is silently bypassed.)
 * To catch this, we recommend updating all callers to `await rateLimit(...)`.
 */
export async function rateLimit(req: NextRequest, opts: RateLimitOptions = {}): Promise<RateLimitResult> {
  const window = opts.window || 60;
  const max = opts.max || 30;
  const keyPrefix = opts.key || req.nextUrl.pathname;

  // SECURITY (Round 3 M20 fix): prefer x-vercel-forwarded-for on Vercel
  // (XFF can be client-supplied on Vercel). Fall back to x-real-ip, then XFF.
  const ip =
    req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";

  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();
  const windowMs = window * 1000;

  // SelfReliant-Refactor: Redis config is read at runtime via getSetting()
  // (cache + DB + process.env fallback). If either is missing we use
  // in-memory only.
  const upstashUrl = await getSetting("UPSTASH_REDIS_REST_URL");
  const upstashToken = await getSetting("UPSTASH_REDIS_REST_TOKEN");
  const useRedis = !!(upstashUrl && upstashToken);

  // Redis path (distributed, works on Vercel).
  if (useRedis) {
    const count = await redisIncrement(key, window);
    if (count === null) {
      // Redis failed — fall back to in-memory rather than blocking everything.
      return inMemoryIncrement(key, max, now, windowMs, ip);
    }
    if (count > max) {
      blockedIps.set(ip, (blockedIps.get(ip) || 0) + 1);
      return { ok: false, remaining: 0, resetAt: now + windowMs, blocked: true };
    }
    return { ok: true, remaining: Math.max(0, max - count), resetAt: now + windowMs, blocked: false };
  }

  // In-memory path (dev / VPS).
  return inMemoryIncrement(key, max, now, windowMs, ip);
}

function inMemoryIncrement(key: string, max: number, now: number, windowMs: number, ip: string): RateLimitResult {
  const existing = store.get(key);
  if (!existing || existing.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1, resetAt: now + windowMs, blocked: false };
  }
  existing.count++;
  const remaining = Math.max(0, max - existing.count);
  if (existing.count > max) {
    blockedIps.set(ip, (blockedIps.get(ip) || 0) + 1);
    return { ok: false, remaining: 0, resetAt: existing.resetAt, blocked: true };
  }
  return { ok: true, remaining, resetAt: existing.resetAt, blocked: false };
}

/**
 * Get blocked IPs stats (for admin dashboard).
 *
 * Sync — uses getCachedSetting() (cache + process.env only, no DB hit) to
 * report `redisEnabled`. May lag the real value by up to the 5-minute cache
 * TTL, but accurate enough for the dashboard. The first request after a
 * cache expiry will miss, and `rateLimit()` will repopulate the cache via
 * `getSetting()`.
 */
export function getRateLimitStats() {
  const upstashUrl = getCachedSetting("UPSTASH_REDIS_REST_URL");
  const upstashToken = getCachedSetting("UPSTASH_REDIS_REST_TOKEN");
  const useRedis = !!(upstashUrl && upstashToken);
  return {
    trackedKeys: store.size,
    blockedIps: Array.from(blockedIps.entries()).map(([ip, count]) => ({ ip, blocks: count })),
    totalBlocks: Array.from(blockedIps.values()).reduce((s, c) => s + c, 0),
    redisEnabled: useRedis,
  };
}

/**
 * Clear rate limit store (for testing)
 */
export function clearRateLimits() {
  store.clear();
  blockedIps.clear();
}
