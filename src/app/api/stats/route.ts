import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/stats — dashboard stats
export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next7 = new Date(today);
  next7.setDate(next7.getDate() + 7);
  const next30 = new Date(today);
  next30.setDate(next30.getDate() + 30);

  const [
    totalRooms,
    activeBookings,
    arrivingToday,
    checkingOutToday,
    bookingsNext7,
    bookingsNext30,
    totalRevenue,
    channelStats,
    recentSyncs,
  ] = await Promise.all([
    db.room.count({ where: { active: true } }),
    db.booking.count({ where: { status: "CONFIRMED" } }),
    db.booking.count({ where: { checkIn: { gte: today, lt: new Date(today.getTime() + 24*60*60*1000) }, status: "CONFIRMED" } }),
    db.booking.count({ where: { checkOut: { gte: today, lt: new Date(today.getTime() + 24*60*60*1000) }, status: { in: ["CONFIRMED", "CHECKED_IN"] } } }),
    db.booking.count({ where: { checkIn: { gte: today, lt: next7 }, status: "CONFIRMED" } }),
    db.booking.count({ where: { checkIn: { gte: today, lt: next30 }, status: "CONFIRMED" } }),
    db.booking.aggregate({ _sum: { amount: true }, where: { status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] } } }),
    db.booking.groupBy({ by: ["source"], _count: true, _sum: { amount: true } }),
    db.syncLog.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
  ]);

  // Live availability — count rooms available today
  const todayAv = await db.availability.findMany({
    where: { date: today },
    include: { room: { select: { slug: true, name: true, type: true, totalUnits: true } } },
  });
  const liveAvailability = todayAv.filter((a) => a.available > 0).map((a) => ({
    room: a.room,
    available: a.available,
  }));
  const totalUnitsAvailable = todayAv.reduce((sum, a) => sum + a.available, 0);
  const totalUnits = await db.room.aggregate({ _sum: { totalUnits: true } });

  return NextResponse.json({
    totalRooms,
    activeBookings,
    arrivingToday,
    checkingOutToday,
    bookingsNext7,
    bookingsNext30,
    totalRevenue: totalRevenue._sum.amount || 0,
    channelStats: channelStats.map((c) => ({
      source: c.source,
      count: c._count,
      revenue: c._sum.amount || 0,
    })),
    recentSyncs,
    liveAvailability: {
      totalUnitsAvailable,
      totalUnits: totalUnits._sum.totalUnits || 0,
      occupancyRate: totalUnits._sum.totalUnits
        ? Math.round(((totalUnits._sum.totalUnits - totalUnitsAvailable) / totalUnits._sum.totalUnits) * 100)
        : 0,
      rooms: liveAvailability,
    },
  });
}
