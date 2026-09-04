import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/analytics
 * Returns analytics dashboard data
 * Query: ?days=30
 */
export async function GET(req: NextRequest) {
  const days = parseInt(req.nextUrl.searchParams.get("days") || "30");
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // ===== BOOKING FUNNEL =====
  const totalVisitors = await db.analyticsEvent.count({
    where: { createdAt: { gte: startDate }, eventType: "PAGE_VIEW" },
  });
  const bookingStarted = await db.analyticsEvent.count({
    where: { createdAt: { gte: startDate }, eventType: "BOOKING_STARTED" },
  });
  const bookingCompleted = await db.analyticsEvent.count({
    where: { createdAt: { gte: startDate }, eventType: "BOOKING_COMPLETED" },
  });

  const conversionRate = totalVisitors > 0
    ? Math.round((bookingCompleted / totalVisitors) * 100 * 100) / 100
    : 0;
  const startRate = totalVisitors > 0
    ? Math.round((bookingStarted / totalVisitors) * 100 * 100) / 100
    : 0;
  const completionRate = bookingStarted > 0
    ? Math.round((bookingCompleted / bookingStarted) * 100 * 100) / 100
    : 0;

  // ===== REVENUE TRENDS (daily) =====
  const bookings = await db.booking.findMany({
    where: { createdAt: { gte: startDate }, status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] } },
    orderBy: { createdAt: "asc" },
  });

  const revenueByDay: Record<string, { revenue: number; count: number }> = {};
  for (const b of bookings) {
    const day = new Date(b.createdAt).toISOString().slice(0, 10);
    if (!revenueByDay[day]) revenueByDay[day] = { revenue: 0, count: 0 };
    revenueByDay[day].revenue += b.amount;
    revenueByDay[day].count++;
  }

  const revenueTrend = Object.entries(revenueByDay).map(([date, data]) => ({
    date,
    revenue: data.revenue,
    bookings: data.count,
  })).sort((a, b) => a.date.localeCompare(b.date));

  // ===== CHANNEL PERFORMANCE =====
  const channelStats = await db.booking.groupBy({
    by: ["source"],
    _count: true,
    _sum: { amount: true },
    where: { createdAt: { gte: startDate } },
  });

  // ===== ROOM PERFORMANCE =====
  const roomStats = await db.booking.findMany({
    where: { createdAt: { gte: startDate } },
    include: { room: true },
  });
  const roomMap: Record<string, { name: string; bookings: number; revenue: number }> = {};
  for (const b of roomStats) {
    const key = b.room.slug;
    if (!roomMap[key]) roomMap[key] = { name: b.room.name, bookings: 0, revenue: 0 };
    roomMap[key].bookings++;
    roomMap[key].revenue += b.amount;
  }
  const roomPerformance = Object.values(roomMap).sort((a, b) => b.revenue - a.revenue);

  // ===== OCCUPANCY FORECAST (next 14 days) =====
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const forecast: Array<{ date: string; occupancy: number; booked: number; total: number }> = [];
  const totalUnits = await db.room.aggregate({ _sum: { totalUnits: true } });
  const totalUnitsNum = totalUnits._sum.totalUnits || 52;

  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const availability = await db.availability.findMany({
      where: { date },
      select: { available: true },
    });
    const booked = availability.reduce((s, a) => s + (totalUnitsNum - a.available), 0);
    const occupancy = totalUnitsNum > 0 ? Math.round((booked / totalUnitsNum) * 100) : 0;
    forecast.push({
      date: date.toISOString().slice(0, 10),
      occupancy,
      booked,
      total: totalUnitsNum,
    });
  }

  // ===== REVIEW SENTIMENT (simplified keyword-based) =====
  const reviews = await db.review.findMany({
    where: { published: true, reviewDate: { gte: startDate } },
    select: { text: true, rating: true },
  });
  const positiveKeywords = ["clean", "comfortable", "excellent", "amazing", "perfect", "friendly", "helpful", "divine", "blessed", "peaceful", "warm", "luxury", "beautiful", "recommend", "best"];
  const negativeKeywords = ["dirty", "noisy", "small", "broken", "rude", "slow", "bad", "poor", "disappointing", "uncomfortable", "overpriced"];
  let positiveCount = 0, negativeCount = 0;
  for (const r of reviews) {
    const text = r.text.toLowerCase();
    if (positiveKeywords.some(k => text.includes(k))) positiveCount++;
    if (negativeKeywords.some(k => text.includes(k))) negativeCount++;
  }
  const sentimentScore = reviews.length > 0
    ? Math.round(((positiveCount - negativeCount) / reviews.length) * 100)
    : 0;

  return NextResponse.json({
    funnel: {
      visitors: totalVisitors,
      bookingStarted,
      bookingCompleted,
      conversionRate,
      startRate,
      completionRate,
    },
    revenueTrend,
    channelPerformance: channelStats.map(c => ({
      source: c.source,
      bookings: c._count,
      revenue: c._sum.amount || 0,
    })),
    roomPerformance,
    occupancyForecast: forecast,
    reviewSentiment: {
      totalReviews: reviews.length,
      positiveMentions: positiveCount,
      negativeMentions: negativeCount,
      sentimentScore, // -100 to 100
      rating: "positive" as const,
    },
    summary: {
      totalRevenue: bookings.reduce((s, b) => s + b.amount, 0),
      totalBookings: bookings.length,
      avgBookingValue: bookings.length > 0 ? Math.round(bookings.reduce((s, b) => s + b.amount, 0) / bookings.length) : 0,
      period: `${days} days`,
    },
  });
}

/**
 * POST /api/analytics
 * Track an analytics event
 * body: { eventType, page?, properties? }
 */
export async function POST(req: NextRequest) {
  const { eventType, page, properties } = await req.json();

  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const ua = req.headers.get("user-agent") || "unknown";
  const referrer = req.headers.get("referer") || null;

  // Get session ID from cookie (or generate one)
  const cookie = req.headers.get("cookie") || "";
  const sessionMatch = cookie.match(/session_token=([^;]+)/);

  await db.analyticsEvent.create({
    data: {
      eventType,
      page: page || null,
      sessionId: sessionMatch?.[1]?.slice(0, 16) || null,
      properties: properties ? JSON.stringify(properties) : null,
      referrer,
      userAgent: ua,
      ipAddress: ip,
    },
  });

  return NextResponse.json({ ok: true });
}
