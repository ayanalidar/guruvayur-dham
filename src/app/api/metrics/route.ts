import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/metrics
 * Returns performance metrics for the admin dashboard
 * Query: ?days=7, ?page=/
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const days = parseInt(searchParams.get("days") || "7");
  const page = searchParams.get("page");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const where: any = { createdAt: { gte: startDate } };
  if (page) where.page = page;

  const metrics = await db.performanceMetric.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  // Calculate averages
  const avg = {
    lcp: metrics.filter(m => m.lcp).reduce((s, m) => s + (m.lcp || 0), 0) / (metrics.filter(m => m.lcp).length || 1),
    fid: metrics.filter(m => m.fid).reduce((s, m) => s + (m.fid || 0), 0) / (metrics.filter(m => m.fid).length || 1),
    cls: metrics.filter(m => m.cls).reduce((s, m) => s + (m.cls || 0), 0) / (metrics.filter(m => m.cls).length || 1),
    ttfb: metrics.filter(m => m.ttfb).reduce((s, m) => s + (m.ttfb || 0), 0) / (metrics.filter(m => m.ttfb).length || 1),
    fcp: metrics.filter(m => m.fcp).reduce((s, m) => s + (m.fcp || 0), 0) / (metrics.filter(m => m.fcp).length || 1),
  };

  // Score (0-100, based on Google's Core Web Vitals thresholds)
  const lcpScore = avg.lcp <= 2500 ? 100 : avg.lcp <= 4000 ? 50 : 0;
  const fidScore = avg.fid <= 100 ? 100 : avg.fid <= 300 ? 50 : 0;
  const clsScore = avg.cls <= 0.1 ? 100 : avg.cls <= 0.25 ? 50 : 0;
  const overallScore = Math.round((lcpScore + fidScore + clsScore) / 3);

  // Per-page breakdown
  const pageMap: Record<string, { count: number; lcp: number; cls: number; ttfb: number }> = {};
  for (const m of metrics) {
    if (!pageMap[m.page]) pageMap[m.page] = { count: 0, lcp: 0, cls: 0, ttfb: 0 };
    pageMap[m.page].count++;
    pageMap[m.page].lcp += m.lcp || 0;
    pageMap[m.page].cls += m.cls || 0;
    pageMap[m.page].ttfb += m.ttfb || 0;
  }
  const pageBreakdown = Object.entries(pageMap).map(([page, data]) => ({
    page,
    samples: data.count,
    avgLcp: Math.round(data.lcp / data.count),
    avgCls: Math.round((data.cls / data.count) * 1000) / 1000,
    avgTtfb: Math.round(data.ttfb / data.count),
  }));

  return NextResponse.json({
    summary: {
      samples: metrics.length,
      avgLcp: Math.round(avg.lcp),
      avgFid: Math.round(avg.fid),
      avgCls: Math.round(avg.cls * 1000) / 1000,
      avgTtfb: Math.round(avg.ttfb),
      avgFcp: Math.round(avg.fcp),
      scores: { lcp: lcpScore, fid: fidScore, cls: clsScore, overall: overallScore },
    },
    pageBreakdown,
    recent: metrics.slice(0, 20).map(m => ({
      page: m.page,
      lcp: m.lcp,
      fid: m.fid,
      cls: m.cls,
      ttfb: m.ttfb,
      fcp: m.fcp,
      connection: m.connection,
      time: m.createdAt,
    })),
  });
}

/**
 * POST /api/metrics
 * Receive Core Web Vitals from the browser
 * body: { page, lcp?, fid?, cls?, ttfb?, fcp?, connection? }
 */
export async function POST(req: NextRequest) {
  const { page, lcp, fid, cls, ttfb, fcp, connection } = await req.json();

  if (!page) return NextResponse.json({ error: "page required" }, { status: 400 });

  const metric = await db.performanceMetric.create({
    data: {
      page,
      lcp: lcp || null,
      fid: fid || null,
      cls: cls || null,
      ttfb: ttfb || null,
      fcp: fcp || null,
      connection: connection || null,
      userAgent: req.headers.get("user-agent") || null,
      sessionId: (req.headers.get("cookie") || "").match(/session_token=([^;]+)/)?.[1]?.slice(0, 16) || null,
    },
  });

  return NextResponse.json({ ok: true, metricId: metric.id });
}
