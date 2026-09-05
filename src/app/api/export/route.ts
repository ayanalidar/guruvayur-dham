import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/export?type=bookings|customers|revenue|channel-sync|pooja-bookings|kitchen-orders
// Returns CSV data for download
export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") || "bookings";
  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");

  let csv = "";
  let filename = `${type}-${new Date().toISOString().slice(0, 10)}.csv`;

  switch (type) {
    case "bookings": {
      const where: any = {};
      if (from || to) {
        where.checkIn = {};
        if (from) where.checkIn.gte = new Date(from);
        if (to) where.checkIn.lte = new Date(to);
      }
      const bookings = await db.booking.findMany({
        where,
        include: { room: true },
        orderBy: { checkIn: "desc" },
        take: 1000,
      });
      csv = "Reference,Guest Name,Phone,Room,Type,Check-in,Check-out,Nights,Guests,Amount,Source,Status,Created At\n";
      for (const b of bookings) {
        csv += `${b.reference},${esc(b.guestName)},${esc(b.guestPhone)},${esc(b.room.name)},${b.room.type},${new Date(b.checkIn).toLocaleDateString("en-IN")},${new Date(b.checkOut).toLocaleDateString("en-IN")},${b.nights},${b.guests},${b.amount},${b.source},${b.status},${new Date(b.createdAt).toLocaleString("en-IN")}\n`;
      }
      break;
    }
    case "customers": {
      const customers = await db.customer.findMany({ orderBy: { totalRevenue: "desc" } });
      csv = "Name,Phone,Email,City,Total Bookings,Total Revenue,Loyalty Points,Tags,Created At\n";
      for (const c of customers) {
        csv += `${esc(c.name)},${esc(c.phone)},${esc(c.email || "")},${esc(c.city || "")},${c.totalBookings},${c.totalRevenue},${c.loyaltyPoints},${esc(c.tags || "")},${new Date(c.createdAt).toLocaleDateString("en-IN")}\n`;
      }
      break;
    }
    case "revenue": {
      const bookings = await db.booking.findMany({
        where: { status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] } },
        orderBy: { checkIn: "asc" },
      });
      csv = "Date,Reference,Guest,Source,Amount\n";
      for (const b of bookings) {
        csv += `${new Date(b.checkIn).toLocaleDateString("en-IN")},${b.reference},${esc(b.guestName)},${b.source},${b.amount}\n`;
      }
      break;
    }
    case "channel-sync": {
      const logs = await db.syncLog.findMany({
        include: { booking: { include: { room: true } } },
        orderBy: { createdAt: "desc" },
        take: 1000,
      });
      csv = "Timestamp,Channel,Action,Status,Booking Ref,Guest,Room,Message\n";
      for (const l of logs) {
        csv += `${new Date(l.createdAt).toLocaleString("en-IN")},${l.channel},${l.action},${l.status},${l.booking?.reference || ""},${l.booking ? esc(l.booking.guestName) : ""},${l.booking?.room?.name || ""},${esc(l.message)}\n`;
      }
      break;
    }
    case "pooja-bookings": {
      const poojas = await db.poojaBooking.findMany({ orderBy: { preferredDate: "desc" } });
      csv = "Reference,Pooja,Guest,Phone,Preferred Date,Amount,Status,Created At\n";
      for (const p of poojas) {
        csv += `${p.reference},${esc(p.poojaName)},${esc(p.guestName)},${esc(p.guestPhone)},${new Date(p.preferredDate).toLocaleDateString("en-IN")},${p.amount},${p.status},${new Date(p.createdAt).toLocaleDateString("en-IN")}\n`;
      }
      break;
    }
    case "kitchen-orders": {
      const orders = await db.kitchenOrder.findMany({ orderBy: { createdAt: "desc" }, take: 1000 });
      csv = "Reference,Room,Guest,Items,Total,Status,Created At\n";
      for (const o of orders) {
        const items = JSON.parse(o.items).map((i: any) => `${i.name} x${i.qty || 1}`).join("; ");
        csv += `${o.reference},${o.roomNumber},${esc(o.guestName)},${esc(items)},${o.total},${o.status},${new Date(o.createdAt).toLocaleString("en-IN")}\n`;
      }
      break;
    }
    case "travel-agents": {
      const agents = await db.travelAgent.findMany({ orderBy: { totalBookings: "desc" } });
      csv = "Company,Contact,Phone,Email,Commission Rate,Credit Limit,Outstanding,Total Bookings\n";
      for (const a of agents) {
        csv += `${esc(a.companyName)},${esc(a.contactName)},${esc(a.phone)},${esc(a.email || "")},${(a.commissionRate * 100).toFixed(1)}%,${a.creditLimit},${a.outstanding},${a.totalBookings}\n`;
      }
      break;
    }
    default:
      return NextResponse.json({ error: "Unknown export type" }, { status: 400 });
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function esc(s: string | null | undefined): string {
  if (!s) return "";
  const str = String(s);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
