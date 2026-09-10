import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

/**
 * GET /api/health-monitor
 *
 * Comprehensive health check that verifies all critical services.
 * Returns detailed status for monitoring dashboards and uptime checks.
 *
 * Query params:
 *   ?detailed=1  — include detailed checks (slower, but more info)
 */
export async function GET(req: NextRequest) {
  const detailed = req.nextUrl.searchParams.get("detailed") === "1";
  if (detailed) {
    const { error } = await requireStaff(req);
    if (error) return error;
  }
  const checks: Array<{ service: string; status: "ok" | "error"; latency?: number; detail?: string }> = [];

  // 1. Database connection
  const dbStart = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    checks.push({ service: "database", status: "ok", latency: Date.now() - dbStart });
  } catch (error: any) {
    // Redact raw DB error messages — they can leak connection string details,
    // table names, or internal Postgres error codes useful for attackers.
    // Only show the detailed message when ?detailed=1 (which already required
    // staff auth above).
    checks.push({
      service: "database",
      status: "error",
      detail: detailed ? redactDbError(error.message) : "Database connection failed",
    });
  }

  // 2. CMS content blocks
  if (detailed) {
    try {
      const count = await db.contentBlock.count();
      checks.push({ service: "cms_content", status: count > 0 ? "ok" : "error", detail: `${count} blocks` });
    } catch (error: any) {
      checks.push({ service: "cms_content", status: "error", detail: redactDbError(error.message) });
    }
    try {
      const roomCount = await db.room.count({ where: { active: true } });
      checks.push({ service: "rooms", status: roomCount > 0 ? "ok" : "error", detail: `${roomCount} active rooms` });
    } catch (error: any) {
      checks.push({ service: "rooms", status: "error", detail: redactDbError(error.message) });
    }
    try {
      const faqCount = await db.fAQItem.count();
      checks.push({ service: "faqs", status: faqCount > 0 ? "ok" : "error", detail: `${faqCount} FAQs` });
    } catch (error: any) {
      checks.push({ service: "faqs", status: "error", detail: redactDbError(error.message) });
    }
  }

  checks.push({ service: "app_server", status: "ok", latency: 0 });

  const allOk = checks.every(c => c.status === "ok");
  return NextResponse.json({
    status: allOk ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    // Always safe to expose — NODE_ENV is just "production" / "development".
    environment: process.env.NODE_ENV,
    checks,
    summary: { total: checks.length, ok: checks.filter(c => c.status === "ok").length, error: checks.filter(c => c.status === "error").length },
  }, { status: allOk ? 200 : 503 });
}

/**
 * Redact sensitive info from raw DB error messages.
 * Strips connection strings, passwords, and Prisma internals.
 */
function redactDbError(msg: string): string {
  if (!msg) return "Unknown error";
  return msg
    // Strip postgresql://user:pass@host:port/db connection strings
    .replace(/postgresql:\/\/[^@\s]+@[\w.-]+:\d+\/\S+/gi, "[REDACTED_DB_URL]")
    // Strip password=... query params
    .replace(/password=[^&\s]+/gi, "password=[REDACTED]")
    // Strip Prisma's internal invocation context
    .replace(/at Object\.executeChildProcess[^)]+\)/g, "[PRISMA_INTERNAL]")
    .slice(0, 200); // truncate to prevent info overload
}
