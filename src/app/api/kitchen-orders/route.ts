import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/kitchen-orders · list all orders
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const where: any = {};
  if (status) where.status = status;
  const orders = await db.kitchenOrder.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ orders });
}

// POST /api/kitchen-orders · create new order (from QR code in room)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { roomNumber, guestName, guestPhone, items, notes } = body;
  if (!roomNumber || !guestName || !items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  // Calculate total
  let total = 0;
  for (const item of items) {
    const menuItem = await db.menuItem.findUnique({ where: { id: item.itemId } });
    if (!menuItem) continue;
    total += menuItem.price * (item.qty || 1);
  }
  const ref = "KO-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const order = await db.kitchenOrder.create({
    data: {
      reference: ref,
      roomNumber, guestName, guestPhone: guestPhone || null,
      items: JSON.stringify(items),
      total,
      notes: notes || null,
      status: "NEW",
    },
  });
  // Create notification to kitchen
  await db.notification.create({
    data: {
      type: "WHATSAPP",
      recipient: "kitchen@guruvayurdham.com",
      body: `NEW ORDER ${ref} from Room ${roomNumber} (${guestName}). Items: ${items.map((i: any) => `${i.name} x${i.qty || 1}`).join(", ")}. Total: ₹${total}`,
      status: "QUEUED",
      relatedRef: ref,
    },
  });

  // ====== BROADCAST REAL-TIME EVENT ======
  fetch("http://localhost:3003/broadcast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "kitchen:order:new",
      data: { reference: ref, roomNumber, guestName, items, total, timestamp: new Date().toISOString() },
    }),
  }).catch(() => {});

  return NextResponse.json({ order, message: `Order placed · ${ref}. Kitchen notified.` });
}

// PATCH /api/kitchen-orders · update status (NEW → PREPARING → READY → DELIVERED)
// When status becomes PREPARING, mark as printed (sent to kitchen printer)
export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json();
  const data: any = { status };
  if (status === "PREPARING") data.printedAt = new Date();
  if (status === "DELIVERED") data.deliveredAt = new Date();
  const order = await db.kitchenOrder.update({ where: { id }, data });
  // Notify guest when ready
  if (status === "READY" && order.guestPhone) {
    await db.notification.create({
      data: {
        type: "WHATSAPP",
        recipient: order.guestPhone,
        body: `Your food order ${order.reference} is ready! It will be delivered to Room ${order.roomNumber} shortly.`,
        status: "QUEUED",
        relatedRef: order.reference,
      },
    });
  }
  return NextResponse.json({ order });
}
