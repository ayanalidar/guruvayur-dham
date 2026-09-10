import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/night-audit?date=2026-09-04 · generates end-of-day report
export async function GET(req: NextRequest) {
  const dateParam = req.nextUrl.searchParams.get("date");
  const today = dateParam ? new Date(dateParam) : new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    arrivals,
    departures,
    inHouse,
    newBookings,
    cancellations,
    revenue,
    channelBreakdown,
    poojaBookings,
    kitchenOrders,
    roomStatusCounts,
  ] = await Promise.all([
    db.booking.findMany({
      where: { checkIn: { gte: today, lt: tomorrow }, status: { in: ["CONFIRMED", "CHECKED_IN"] } },
      include: { room: true },
    }),
    db.booking.findMany({
      where: { checkOut: { gte: today, lt: tomorrow }, status: { in: ["CHECKED_OUT", "CONFIRMED", "CHECKED_IN"] } },
      include: { room: true },
    }),
    db.booking.count({
      where: { checkIn: { lte: today }, checkOut: { gt: today }, status: { in: ["CONFIRMED", "CHECKED_IN"] } },
    }),
    db.booking.count({
      where: { createdAt: { gte: today, lt: tomorrow } },
    }),
    db.booking.count({
      where: { status: "CANCELLED", updatedAt: { gte: today, lt: tomorrow } },
    }),
    db.booking.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: today, lt: tomorrow }, status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] } },
    }),
    db.booking.groupBy({
      by: ["source"],
      _count: true,
      _sum: { amount: true },
      where: { createdAt: { gte: today, lt: tomorrow } },
    }),
    db.poojaBooking.count({
      where: { preferredDate: { gte: today, lt: tomorrow } },
    }),
    db.kitchenOrder.aggregate({
      _sum: { total: true },
      _count: true,
      where: { createdAt: { gte: today, lt: tomorrow } },
    }),
    db.housekeepingStatus.groupBy({ by: ["status"], _count: true }),
  ]);

  // Calculate occupancy
  const totalUnits = await db.room.aggregate({ _sum: { totalUnits: true } });
  const occupancyRate = totalUnits._sum.totalUnits
    ? Math.round((inHouse / totalUnits._sum.totalUnits) * 100)
    : 0;

  // Calculate cash reconciliation (simplified · would integrate with payment gateway in production)
  const expectedRevenue = revenue._sum.amount || 0;
  const cashCollected = Math.round(expectedRevenue * 0.4); // 40% cash estimate
  const cardCollected = Math.round(expectedRevenue * 0.3); // 30% card
  const upiCollected = Math.round(expectedRevenue * 0.3); // 30% UPI
  const discrepancy = 0;

  return NextResponse.json({
    date: today.toISOString().slice(0, 10),
    summary: {
      arrivals: arrivals.length,
      departures: departures.length,
      inHouseGuests: inHouse,
      occupancyRate,
      newBookings,
      cancellations,
      poojaBookingsToday: poojaBookings,
      kitchenOrdersToday: kitchenOrders._count || 0,
      kitchenRevenue: kitchenOrders._sum.total || 0,
    },
    revenue: {
      expected: expectedRevenue,
      cash: cashCollected,
      card: cardCollected,
      upi: upiCollected,
      discrepancy,
      totalCollected: cashCollected + cardCollected + upiCollected,
    },
    channelBreakdown: channelBreakdown.map(c => ({
      source: c.source,
      count: c._count,
      revenue: c._sum.amount || 0,
    })),
    arrivalsList: arrivals.map(b => ({
      reference: b.reference,
      guestName: b.guestName,
      guestPhone: b.guestPhone,
      room: b.room.name,
      nights: b.nights,
      amount: b.amount,
      source: b.source,
    })),
    departuresList: departures.map(b => ({
      reference: b.reference,
      guestName: b.guestName,
      room: b.room.name,
      amount: b.amount,
    })),
    roomStatusCounts: roomStatusCounts.map(r => ({ status: r.status, count: r._count })),
  });
}
