import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { getCircuitBreakerStatus } from "@/lib/retry";
import { getRateLimitStats } from "@/lib/rate-limiter";

/**
 * Performance Monitoring API
 *
 * GET /api/performance?days=7
 *
 * Returns a consolidated view for the admin Performance Dashboard:
 *   - errorCount:        total ErrorLog rows in the window
 *   - errorsByRoute:    top routes by error count, newest-first
 *   - errorsByType:     error type histogram (DB_ERROR / UNKNOWN / etc.)
 *   - errorsByStatusCode: status code histogram
 *   - recentErrors:     10 most recent errors
 *   - circuitBreakers:  live state from getCircuitBreakerStatus()
 *   - rateLimiter:      live state from getRateLimitStats()
 *
 * MANAGER-only — error messages can leak infrastructure details.
 *
 * NOTE on "slowest API routes":
 *   The app does NOT record per-request server-side latency in any DB
 *   table. PerformanceMetric holds client-side web vitals (LCP, FID, etc.),
 *   and AnalyticsEvent has no duration field. Until we add a latency
 *   column to ErrorLog (or a new ApiLatencyLog table), the "slowest
 *   routes" list is approximated from error frequency — routes that
 *   error most often are likely the slowest/most strained. Documented
 *   inline; surfaced as `slowestRoutesApprox` in the response.
 *
 * SelfReliant-Phase2-4.
 */

const QuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).default(7),
});

export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req, ["MANAGER"]);
  if (error) return error;

  const parsed = QuerySchema.safeParse({
    days: req.nextUrl.searchParams.get("days") || undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { days } = parsed.data;

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Total error count for the window.
  const errorCount = await db.errorLog.count({
    where: { createdAt: { gte: since } },
  });

  // Top routes by error count (capped at 10 — enough for a dashboard).
  // Prisma's groupBy requires orderBy when take is provided; we sort by
  // _count of `id` desc so the noisiest routes bubble to the top.
  const errorsByRouteRaw = await db.errorLog.groupBy({
    by: ["route"],
    where: { createdAt: { gte: since } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  });
  const errorsByRoute = errorsByRouteRaw
    .map((r) => ({ route: r.route, count: r._count.id }));

  // Error type histogram.
  const errorsByTypeRaw = await db.errorLog.groupBy({
    by: ["errorType"],
    where: { createdAt: { gte: since } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });
  const errorsByType = errorsByTypeRaw.map((r) => ({
    type: r.errorType,
    count: r._count.id,
  }));

  // Status code histogram.
  const errorsByStatusCodeRaw = await db.errorLog.groupBy({
    by: ["statusCode"],
    where: { createdAt: { gte: since } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });
  const errorsByStatusCode = errorsByStatusCodeRaw.map((r) => ({
    statusCode: r.statusCode,
    count: r._count.id,
  }));

  // 10 most recent errors (newest first).
  const recentErrors = await db.errorLog.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      route: true,
      method: true,
      errorType: true,
      message: true,
      statusCode: true,
      resolved: true,
      createdAt: true,
    },
  });

  // Live circuit breaker + rate-limiter state (in-memory, this instance only).
  const circuitBreakers = getCircuitBreakerStatus();
  const rateLimiter = getRateLimitStats();

  return NextResponse.json({
    window: {
      days,
      since: since.toISOString(),
      until: new Date().toISOString(),
    },
    errorCount,
    errorsByRoute,
    // Approximation: routes that error most often are likely the slowest
    // or most strained. Documented at the top of this file.
    slowestRoutesApprox: errorsByRoute,
    errorsByType,
    errorsByStatusCode,
    recentErrors,
    circuitBreakers,
    rateLimiter,
    unresolvedErrors: await db.errorLog.count({
      where: { createdAt: { gte: since }, resolved: false },
    }),
  });
}
