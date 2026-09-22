import { db } from "@/lib/db";
import crypto from "crypto";

/**
 * Settings library — encrypted key-value store for the self-reliant platform.
 *
 * HOW IT WORKS:
 * - Secrets (API keys, tokens) are encrypted with AES-256-GCM using
 *   NEXTAUTH_SECRET as the master key.
 * - Non-secret config (origins, model names) is stored in plaintext.
 * - Values are cached in-memory for 5 minutes to avoid DB queries on every call.
 * - If DB is unreachable, falls back to process.env (backwards compatible).
 *
 * ENCRYPTION:
 * - Master key = process.env.NEXTAUTH_SECRET (first 32 bytes after SHA-256 hash)
 * - AES-256-GCM with random IV per value
 * - Encrypted format: base64(iv:ciphertext:authTag)
 *
 * USAGE:
 *   import { getSetting, setSetting, getFeatureFlag } from "@/lib/settings";
 *
 *   // Read a setting (falls back to process.env if not in DB)
 *   const razorpayKey = await getSetting("RAZORPAY_KEY_ID");
 *
 *   // Save a setting (from admin UI)
 *   await setSetting("RAZORPAY_KEY_ID", "rzp_live_xxx", userId, true);
 *
 *   // Check a feature flag
 *   if (await getFeatureFlag("ONLINE_BOOKING")) { ... }
 */

// ====== In-memory cache (5-minute TTL) ======
const CACHE_TTL_MS = 5 * 60 * 1000;
const settingsCache = new Map<string, { value: string | null; at: number }>();
const flagCache = new Map<string, { enabled: boolean; at: number }>();

function isStale(at: number): boolean {
  return Date.now() - at > CACHE_TTL_MS;
}

// ====== Encryption ======
function getMasterKey(): Buffer {
  const secret = process.env.NEXTAUTH_SECRET || "dev-only-not-for-production";
  return crypto.createHash("sha256").update(secret).digest().subarray(0, 32);
}

function encrypt(plaintext: string): string {
  const key = getMasterKey();
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Format: base64(iv + ciphertext + authTag)
  return Buffer.concat([iv, ciphertext, authTag]).toString("base64");
}

function decrypt(encrypted: string): string {
  try {
    const key = getMasterKey();
    const buf = Buffer.from(encrypted, "base64");
    const iv = buf.subarray(0, 12);
    const authTag = buf.subarray(buf.length - 16);
    const ciphertext = buf.subarray(12, buf.length - 16);
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plaintext.toString("utf8");
  } catch {
    return "";
  }
}

// ====== Public API ======

/**
 * Get a setting value. Checks DB first (cached 5 min), falls back to process.env.
 * Returns null if not found anywhere.
 */
export async function getSetting(key: string): Promise<string | null> {
  // Check in-memory cache first
  const cached = settingsCache.get(key);
  if (cached && !isStale(cached.at)) {
    return cached.value;
  }

  try {
    const row = await db.setting.findUnique({ where: { key } });
    let value: string | null = null;
    if (row && row.isSet && row.value) {
      value = row.isSecret ? decrypt(row.value) : row.value;
    }
    // Fall back to process.env if DB has no value
    if (value === null) {
      value = process.env[key] || null;
    }
    // Cache the result (even if null — prevents repeated DB queries)
    settingsCache.set(key, { value, at: Date.now() });
    return value;
  } catch {
    // DB unreachable — fall back to process.env
    return process.env[key] || null;
  }
}

/**
 * Get a setting value synchronously (from cache only — does NOT query DB).
 * Returns null if not cached. Use getSetting() for the full async path.
 */
export function getCachedSetting(key: string): string | null {
  const cached = settingsCache.get(key);
  if (cached && !isStale(cached.at)) {
    return cached.value;
  }
  return process.env[key] || null;
}

/**
 * Set a setting value. Encrypts if isSecret=true.
 * Invalidates the cache so the next read is fresh.
 */
export async function setSetting(
  key: string,
  value: string,
  userId?: string,
  isSecret = true,
  category = "INTEGRATION",
  label?: string,
): Promise<void> {
  const storedValue = isSecret && value ? encrypt(value) : value;
  await db.setting.upsert({
    where: { key },
    create: {
      key,
      value: storedValue,
      category,
      label: label || key,
      isSecret,
      isSet: !!value,
      updatedBy: userId,
    },
    update: {
      value: storedValue,
      category,
      label: label || key,
      isSecret,
      isSet: !!value,
      updatedBy: userId,
    },
  });
  // Invalidate cache
  settingsCache.delete(key);
}

/**
 * Get all settings (for admin UI). Secrets are masked (show only last 4 chars).
 */
export async function getAllSettings(): Promise<Array<{
  key: string;
  value: string | null;
  category: string;
  label: string | null;
  isSecret: boolean;
  isSet: boolean;
  updatedAt: Date;
}>> {
  const rows = await db.setting.findMany({ orderBy: { category: "asc" } });
  return rows.map((r) => ({
    key: r.key,
    value: r.isSecret && r.value ? `••••${decrypt(r.value).slice(-4)}` : r.value,
    category: r.category,
    label: r.label,
    isSecret: r.isSecret,
    isSet: r.isSet,
    updatedAt: r.updatedAt,
  }));
}

/**
 * Check if a setting is configured (exists in DB or process.env).
 */
export async function isSettingConfigured(key: string): Promise<boolean> {
  const value = await getSetting(key);
  return value !== null && value !== "" && value !== undefined;
}

// ====== Feature Flags ======

/**
 * Check if a feature flag is enabled.
 *
 * Fallback chain (safest-first):
 *   1. Cache hit (if not stale)
 *   2. DB row exists → use its `enabled` value
 *   3. DB row missing → use the default from DEFAULT_FEATURE_FLAGS below
 *   4. DB unreachable → for MAINTENANCE_MODE return false (NEVER break the site);
 *      for other flags, fall back to the DEFAULT_FEATURE_FLAGS default.
 *
 * SAFETY INVARIANT: MAINTENANCE_MODE must never default to true.
 * If we can't read the DB, the site must stay online — a broken DB should
 * not take the entire guest-facing site offline.
 */
export async function getFeatureFlag(key: string): Promise<boolean> {
  const cached = flagCache.get(key);
  if (cached && !isStale(cached.at)) {
    return cached.enabled;
  }

  // Fallback default from the in-code DEFAULT_FEATURE_FLAGS list.
  // This is used when the DB row is missing (seed not run yet) OR DB unreachable.
  const defaultFlag = DEFAULT_FEATURE_FLAGS.find((f) => f.key === key);
  const fallbackDefault =
    key === "MAINTENANCE_MODE" ? false : defaultFlag?.enabled ?? true;

  try {
    const row = await db.featureFlag.findUnique({ where: { key } });
    const enabled = row ? row.enabled : fallbackDefault;
    flagCache.set(key, { enabled, at: Date.now() });
    return enabled;
  } catch {
    // DB unreachable — fall back to safe default.
    return fallbackDefault;
  }
}

/**
 * Set a feature flag.
 */
export async function setFeatureFlag(
  key: string,
  enabled: boolean,
  userId?: string,
  label?: string,
  description?: string,
): Promise<void> {
  await db.featureFlag.upsert({
    where: { key },
    create: { key, label: label || key, description, enabled, updatedBy: userId },
    update: { enabled, updatedBy: userId, ...(label ? { label } : {}), ...(description ? { description } : {}) },
  });
  flagCache.delete(key);
}

/**
 * Get all feature flags (for admin UI).
 */
export async function getAllFeatureFlags(): Promise<Array<{
  key: string;
  label: string;
  description: string | null;
  enabled: boolean;
  updatedAt: Date;
}>> {
  const rows = await db.featureFlag.findMany({ orderBy: { key: "asc" } });
  return rows.map((r) => ({
    key: r.key,
    label: r.label,
    description: r.description,
    enabled: r.enabled,
    updatedAt: r.updatedAt,
  }));
}

/**
 * Invalidate all caches — call after bulk settings changes.
 */
export function invalidateAllSettingsCaches() {
  settingsCache.clear();
  flagCache.clear();
}

// ====== Default settings + feature flags to seed ======

export const DEFAULT_SETTINGS = [
  { key: "RAZORPAY_KEY_ID", label: "Razorpay Key ID", category: "INTEGRATION", isSecret: true },
  { key: "RAZORPAY_KEY_SECRET", label: "Razorpay Key Secret", category: "INTEGRATION", isSecret: true },
  { key: "GROQ_API_KEY", label: "Groq API Key (AI chatbot)", category: "INTEGRATION", isSecret: true },
  { key: "GROQ_MODEL", label: "Groq Model", category: "INTEGRATION", isSecret: false },
  { key: "WHATSAPP_VERIFY_TOKEN", label: "WhatsApp Verify Token", category: "INTEGRATION", isSecret: true },
  { key: "WHATSAPP_PHONE_NUMBER_ID", label: "WhatsApp Phone Number ID", category: "INTEGRATION", isSecret: true },
  { key: "WHATSAPP_ACCESS_TOKEN", label: "WhatsApp Access Token", category: "INTEGRATION", isSecret: true },
  { key: "WHATSAPP_APP_SECRET", label: "WhatsApp App Secret (webhook signature)", category: "INTEGRATION", isSecret: true },
  { key: "SMTP_HOST", label: "SMTP Host", category: "INTEGRATION", isSecret: false },
  { key: "SMTP_PORT", label: "SMTP Port", category: "INTEGRATION", isSecret: false },
  { key: "SMTP_USER", label: "SMTP User", category: "INTEGRATION", isSecret: true },
  { key: "SMTP_PASS", label: "SMTP Password", category: "INTEGRATION", isSecret: true },
  { key: "FROM_EMAIL", label: "From Email Address", category: "INTEGRATION", isSecret: false },
  { key: "GOOGLE_PLACES_API_KEY", label: "Google Places API Key (reviews)", category: "INTEGRATION", isSecret: true },
  { key: "UPSTASH_REDIS_REST_URL", label: "Upstash Redis REST URL", category: "INTEGRATION", isSecret: true },
  { key: "UPSTASH_REDIS_REST_TOKEN", label: "Upstash Redis REST Token", category: "INTEGRATION", isSecret: true },
  { key: "BLOB_READ_WRITE_TOKEN", label: "Vercel Blob Token (image uploads)", category: "INTEGRATION", isSecret: true },
  { key: "REALTIME_ALLOWED_ORIGIN", label: "Realtime Allowed Origin (CORS)", category: "INTEGRATION", isSecret: false },
  { key: "VAPID_PRIVATE_KEY", label: "VAPID Private Key (push notifications)", category: "INTEGRATION", isSecret: true },
  { key: "VAPID_SUBJECT", label: "VAPID Subject", category: "INTEGRATION", isSecret: false },
  { key: "GOOGLE_CLIENT_ID", label: "Google OAuth Client ID", category: "INTEGRATION", isSecret: true },
  { key: "GOOGLE_CLIENT_SECRET", label: "Google OAuth Client Secret", category: "INTEGRATION", isSecret: true },
  { key: "FACEBOOK_CLIENT_ID", label: "Facebook OAuth Client ID", category: "INTEGRATION", isSecret: true },
  { key: "FACEBOOK_CLIENT_SECRET", label: "Facebook OAuth Client Secret", category: "INTEGRATION", isSecret: true },
  { key: "CRON_SECRET", label: "Cron Secret (review funnel protection)", category: "SECRET", isSecret: true },
];

export const DEFAULT_FEATURE_FLAGS = [
  { key: "ONLINE_BOOKING", label: "Online Booking", description: "Allow guests to book rooms online", enabled: true },
  { key: "WHATSAPP_BOT", label: "WhatsApp Chatbot", description: "WhatsApp bot for guest queries", enabled: true },
  { key: "AI_CHATBOT", label: "AI Chatbot (Groq)", description: "AI-powered chatbot on the website", enabled: true },
  { key: "RAZORPAY_PAYMENTS", label: "Razorpay Payments", description: "Accept online payments via Razorpay", enabled: true },
  { key: "CASH_ON_DELIVERY", label: "Cash on Delivery", description: "Allow COD (pay at hotel) bookings", enabled: false },
  { key: "EMAIL_NOTIFICATIONS", label: "Email Notifications", description: "Send booking confirmations via email", enabled: false },
  { key: "PUSH_NOTIFICATIONS", label: "Push Notifications", description: "Send push notifications to subscribed devices", enabled: false },
  { key: "CHANNEL_SYNC", label: "Channel Manager Sync", description: "Sync availability with Booking.com/MakeMyTrip/etc.", enabled: true },
  { key: "GUEST_REGISTRATION", label: "Guest Self-Registration", description: "Allow guests to create accounts", enabled: true },
  { key: "OTP_LOGIN", label: "OTP Login", description: "Allow phone OTP login", enabled: true },
  { key: "MAINTENANCE_MODE", label: "Maintenance Mode", description: "Show holding page to guests (admin still works)", enabled: false },
  { key: "FESTIVAL_BANNER", label: "Festival Countdown Banner", description: "Show 'X days until [festival]' banner on homepage", enabled: true },
  { key: "TEMPLE_TIMINGS_WIDGET", label: "Temple Timings Widget", description: "Show live temple darshan timings on homepage", enabled: true },
  { key: "SEO_PAGES", label: "SEO Landing Pages", description: "Show 35+ SEO landing pages", enabled: true },
];
