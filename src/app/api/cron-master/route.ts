import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron-master
 *
 * Master cron job — runs ONCE daily on Vercel free plan.
 * Calls both:
 *   1. iCal import (sync OTA bookings)
 *   2. Review funnel (send WhatsApp review requests after check-out)
 *
 * Scheduled at 7:30 AM UTC = 1:00 PM IST (2 hours after 11 AM check-out).
 *
 * Vercel free plan allows max 2 crons, each max once/day.
 * We consolidated into 1 cron to stay within limits.
 *
 * For MORE FREQUENT runs (every 10/15 min), use external free cron:
 *   - cron-job.org (free, unlimited)
 *   - GitHub Actions (free, 5-min minimum)
 */

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  // Auth: Vercel cron sends Authorization: Bearer <CRON_SECRET>
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization") || "";
  const queryKey = req.nextUrl.searchParams.get("key") || "";

  if (cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}` && queryKey !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const results: any = { timestamp: new Date().toISOString(), tasks: [] };

  // ===== TASK 1: iCal Import =====
  try {
    const icalRes = await fetch(new URL("/api/ical/import", req.url), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const icalData = await icalRes.json();
    results.tasks.push({ task: "ical-import", status: "ok", imported: icalData.totalImported || 0, skipped: icalData.totalSkipped || 0 });
  } catch (e: any) {
    results.tasks.push({ task: "ical-import", status: "error", error: e?.message });
  }

  // ===== TASK 2: Review Funnel =====
  try {
    const reviewRes = await fetch(new URL("/api/reviews/checkout-funnel", req.url), {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: authHeader },
    });
    const reviewData = await reviewRes.json();
    results.tasks.push({ task: "review-funnel", status: "ok", sent: reviewData.sent || 0, message: reviewData.message || "" });
  } catch (e: any) {
    results.tasks.push({ task: "review-funnel", status: "error", error: e?.message });
  }

  results.duration = `${Date.now() - startTime}ms`;
  return NextResponse.json(results);
}
