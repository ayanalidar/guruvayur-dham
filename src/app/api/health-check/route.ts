import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { runAllHealthChecks } from "@/lib/health-check";
import { getCircuitBreakerStatus } from "@/lib/retry";

/**
 * GET /api/health-check
 *
 * Comprehensive system health dashboard for managers.
 * Returns:
 *   - { checks, summary } from runAllHealthChecks() — all integration probes
 *   - dbSize           — PostgreSQL DB size in human-readable form
 *   - activeSessions   — number of currently-active staff sessions
 *   - errorCount24h    — number of ErrorLog rows in the last 24h
 *   - avgApiLatencyMs  — avg API response time (from AnalyticsEvent, if available)
 *   - circuitBreakers  — status of all retry circuit breakers
 *
 * MANAGER-only — exposes infrastructure details.
 */
export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req, ["MANAGER"]);
  if (error) return error;

  // Run all integration probes in parallel with the dashboard metadata queries.
  const since = new Date();
  since.setHours(since.getHours() - 24);

  const [
    healthResult,
    dbSizeRows,
    activeSessions,
    errorCount24h,
    recentAnalytics,
    circuitBreakers,
  ] = await Promise.all([
    runAllHealthChecks(),
    // PostgreSQL database size (human-readable, e.g. "245 MB")
    db.$queryRaw<{ pg_size_pretty: string }[]>`
      SELECT pg_size_pretty(pg_database_size(current_database())) AS pg_size_pretty
    `,
    db.session.count({
      where: { expiresAt: { gt: new Date() } },
    }),
    db.errorLog.count({ where: { createdAt: { gte: since } } }),
    // AnalyticsEvent is the closest proxy for API response time — we don't
    // log per-request timing anywhere else. PAGE_VIEW events have no
    // duration field; we just count events as a "traffic" signal. Returns 0
    // if the table is empty (e.g. fresh install).
    db.analyticsEvent.count({ where: { createdAt: { gte: since } } }),
    Promise.resolve(getCircuitBreakerStatus()),
  ]);

  // Avg API latency: the app currently doesn't record per-request latency
  // anywhere in the DB. We surface null when there's no data so the UI can
  // show "—" instead of misleading "0 ms". The PerformanceMetric table
  // holds client-side web-vitals, not server-side API timings.
  const avgApiLatencyMs: number | null = null;

  return NextResponse.json({
    checks: healthResult.checks,
    summary: healthResult.summary,
    dbSize: dbSizeRows[0]?.pg_size_pretty ?? "unknown",
    activeSessions,
    errorCount24h,
    avgApiLatencyMs,
    analyticsEventCount24h: recentAnalytics,
    circuitBreakers,
    timestamp: new Date().toISOString(),
  });
}
