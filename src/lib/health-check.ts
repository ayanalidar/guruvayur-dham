import { db } from "@/lib/db";
import { getSetting, isSettingConfigured } from "@/lib/settings";

/**
 * Health check library — tests all integrations for the System Health Dashboard.
 *
 * Each check returns { status: "ok" | "error" | "not_configured", latency?, message? }
 * Runs in parallel for speed. Total check takes ~2-3 seconds.
 */

export interface HealthCheckResult {
  service: string;
  label: string;
  status: "ok" | "error" | "not_configured";
  latency?: number;
  message: string;
  category: string;
}

export async function runAllHealthChecks(): Promise<{
  checks: HealthCheckResult[];
  summary: { total: number; ok: number; error: number; not_configured: number };
}> {
  const checks = await Promise.all([
    checkDatabase(),
    checkRazorpay(),
    checkGroq(),
    checkWhatsApp(),
    checkSMTP(),
    checkUpstash(),
    checkBlob(),
    checkRealtime(),
    checkCron(),
    checkVAPID(),
    checkGoogleOAuth(),
  ]);

  const summary = {
    total: checks.length,
    ok: checks.filter((c) => c.status === "ok").length,
    error: checks.filter((c) => c.status === "error").length,
    not_configured: checks.filter((c) => c.status === "not_configured").length,
  };

  return { checks, summary };
}

async function checkDatabase(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return {
      service: "database",
      label: "PostgreSQL Database",
      status: "ok",
      latency: Date.now() - start,
      message: "Connected",
      category: "INFRASTRUCTURE",
    };
  } catch (e: any) {
    return {
      service: "database",
      label: "PostgreSQL Database",
      status: "error",
      latency: Date.now() - start,
      message: e.message || "Connection failed",
      category: "INFRASTRUCTURE",
    };
  }
}

async function checkRazorpay(): Promise<HealthCheckResult> {
  const keyId = await getSetting("RAZORPAY_KEY_ID");
  if (!keyId) {
    return { service: "razorpay", label: "Razorpay Payments", status: "not_configured", message: "RAZORPAY_KEY_ID not set", category: "INTEGRATION" };
  }
  const start = Date.now();
  try {
    const keySecret = await getSetting("RAZORPAY_KEY_SECRET");
    if (!keySecret) {
      return { service: "razorpay", label: "Razorpay Payments", status: "not_configured", message: "RAZORPAY_KEY_SECRET not set", category: "INTEGRATION" };
    }
    // Try to fetch a test order (or validate key by hitting the API)
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const res = await fetch("https://api.razorpay.com/v1/orders?count=1", {
      headers: { Authorization: `Basic ${auth}` },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      return { service: "razorpay", label: "Razorpay Payments", status: "ok", latency: Date.now() - start, message: "Connected", category: "INTEGRATION" };
    }
    return { service: "razorpay", label: "Razorpay Payments", status: "error", latency: Date.now() - start, message: `HTTP ${res.status}`, category: "INTEGRATION" };
  } catch (e: any) {
    return { service: "razorpay", label: "Razorpay Payments", status: "error", latency: Date.now() - start, message: e.message || "Connection failed", category: "INTEGRATION" };
  }
}

async function checkGroq(): Promise<HealthCheckResult> {
  const apiKey = await getSetting("GROQ_API_KEY");
  if (!apiKey) {
    return { service: "groq", label: "Groq AI Chatbot", status: "not_configured", message: "GROQ_API_KEY not set", category: "INTEGRATION" };
  }
  const start = Date.now();
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      return { service: "groq", label: "Groq AI Chatbot", status: "ok", latency: Date.now() - start, message: "Connected", category: "INTEGRATION" };
    }
    return { service: "groq", label: "Groq AI Chatbot", status: "error", latency: Date.now() - start, message: `HTTP ${res.status}`, category: "INTEGRATION" };
  } catch (e: any) {
    return { service: "groq", label: "Groq AI Chatbot", status: "error", latency: Date.now() - start, message: e.message || "Connection failed", category: "INTEGRATION" };
  }
}

async function checkWhatsApp(): Promise<HealthCheckResult> {
  const token = await getSetting("WHATSAPP_ACCESS_TOKEN");
  const phoneId = await getSetting("WHATSAPP_PHONE_NUMBER_ID");
  if (!token || !phoneId) {
    return { service: "whatsapp", label: "WhatsApp Business API", status: "not_configured", message: "WHATSAPP_ACCESS_TOKEN or PHONE_NUMBER_ID not set", category: "INTEGRATION" };
  }
  // We can't actually send a test message, but we can check if the token is valid
  // by hitting the Graph API for the phone number details
  const start = Date.now();
  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${phoneId}?fields=display_phone_number,verified_name`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      return { service: "whatsapp", label: "WhatsApp Business API", status: "ok", latency: Date.now() - start, message: `Connected (${data.display_phone_number || "verified"})`, category: "INTEGRATION" };
    }
    return { service: "whatsapp", label: "WhatsApp Business API", status: "error", latency: Date.now() - start, message: `HTTP ${res.status}`, category: "INTEGRATION" };
  } catch (e: any) {
    return { service: "whatsapp", label: "WhatsApp Business API", status: "error", latency: Date.now() - start, message: e.message || "Connection failed", category: "INTEGRATION" };
  }
}

async function checkSMTP(): Promise<HealthCheckResult> {
  const host = await getSetting("SMTP_HOST");
  if (!host) {
    return { service: "smtp", label: "Email (SMTP)", status: "not_configured", message: "SMTP_HOST not set", category: "INTEGRATION" };
  }
  // We can't actually connect to SMTP without blocking, but we can check if it's configured
  const user = await getSetting("SMTP_USER");
  const pass = await getSetting("SMTP_PASS");
  if (!user || !pass) {
    return { service: "smtp", label: "Email (SMTP)", status: "not_configured", message: "SMTP_USER or SMTP_PASS not set", category: "INTEGRATION" };
  }
  return { service: "smtp", label: "Email (SMTP)", status: "ok", message: `Configured (${host})`, category: "INTEGRATION" };
}

async function checkUpstash(): Promise<HealthCheckResult> {
  const url = await getSetting("UPSTASH_REDIS_REST_URL");
  if (!url) {
    return { service: "upstash", label: "Upstash Redis (rate limiting)", status: "not_configured", message: "UPSTASH_REDIS_REST_URL not set (using in-memory fallback)", category: "INTEGRATION" };
  }
  const start = Date.now();
  try {
    const token = await getSetting("UPSTASH_REDIS_REST_TOKEN");
    const res = await fetch(`${url}/ping`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      return { service: "upstash", label: "Upstash Redis (rate limiting)", status: "ok", latency: Date.now() - start, message: "Connected", category: "INTEGRATION" };
    }
    return { service: "upstash", label: "Upstash Redis (rate limiting)", status: "error", latency: Date.now() - start, message: `HTTP ${res.status}`, category: "INTEGRATION" };
  } catch (e: any) {
    return { service: "upstash", label: "Upstash Redis (rate limiting)", status: "error", latency: Date.now() - start, message: e.message || "Connection failed", category: "INTEGRATION" };
  }
}

async function checkBlob(): Promise<HealthCheckResult> {
  const token = await getSetting("BLOB_READ_WRITE_TOKEN");
  if (!token) {
    return { service: "blob", label: "Vercel Blob (image uploads)", status: "not_configured", message: "BLOB_READ_WRITE_TOKEN not set (using local filesystem)", category: "INTEGRATION" };
  }
  // Vercel Blob doesn't have a simple "ping" endpoint, but if the token exists we assume it's configured
  return { service: "blob", label: "Vercel Blob (image uploads)", status: "ok", message: "Token configured", category: "INTEGRATION" };
}

async function checkRealtime(): Promise<HealthCheckResult> {
  const realtimeUrl = process.env.REALTIME_URL || "http://localhost:3003";
  const start = Date.now();
  try {
    const res = await fetch(`${realtimeUrl}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      return { service: "realtime", label: "Realtime Service (Socket.io)", status: "ok", latency: Date.now() - start, message: `${data.connections || 0} connections`, category: "INFRASTRUCTURE" };
    }
    return { service: "realtime", label: "Realtime Service (Socket.io)", status: "error", latency: Date.now() - start, message: `HTTP ${res.status}`, category: "INFRASTRUCTURE" };
  } catch {
    return { service: "realtime", label: "Realtime Service (Socket.io)", status: "not_configured", message: "Service not reachable (optional — site works without it)", category: "INFRASTRUCTURE" };
  }
}

async function checkCron(): Promise<HealthCheckResult> {
  const cronSecret = await getSetting("CRON_SECRET");
  if (!cronSecret) {
    return { service: "cron", label: "Cron (review funnel)", status: "not_configured", message: "CRON_SECRET not set", category: "SECRET" };
  }
  // Check when the review funnel last ran (by looking at recent ReviewRequest entries)
  try {
    const lastRun = await db.notification.findFirst({
      where: { type: "WHATSAPP", relatedRef: { startsWith: "REVIEW-REQUEST" } },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    if (lastRun) {
      const minutesAgo = Math.floor((Date.now() - lastRun.createdAt.getTime()) / 60000);
      return { service: "cron", label: "Cron (review funnel)", status: "ok", message: `Last run ${minutesAgo} min ago`, category: "SECRET" };
    }
    return { service: "cron", label: "Cron (review funnel)", status: "ok", message: "Configured (no runs yet)", category: "SECRET" };
  } catch {
    return { service: "cron", label: "Cron (review funnel)", status: "ok", message: "Configured", category: "SECRET" };
  }
}

async function checkVAPID(): Promise<HealthCheckResult> {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = await getSetting("VAPID_PRIVATE_KEY");
  if (!publicKey || !privateKey) {
    return { service: "vapid", label: "Push Notifications (VAPID)", status: "not_configured", message: "VAPID keys not set", category: "INTEGRATION" };
  }
  return { service: "vapid", label: "Push Notifications (VAPID)", status: "ok", message: "Configured", category: "INTEGRATION" };
}

async function checkGoogleOAuth(): Promise<HealthCheckResult> {
  const clientId = await getSetting("GOOGLE_CLIENT_ID");
  if (!clientId) {
    return { service: "google_oauth", label: "Google OAuth Login", status: "not_configured", message: "GOOGLE_CLIENT_ID not set (demo mode only)", category: "INTEGRATION" };
  }
  return { service: "google_oauth", label: "Google OAuth Login", status: "ok", message: "Configured", category: "INTEGRATION" };
}
