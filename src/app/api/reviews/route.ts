import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/reviews — list review requests
export async function GET() {
  const requests = await db.reviewRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ requests });
}

// POST /api/reviews — create review request after checkout
// body: { bookingRef, guestName, guestPhone, guestEmail }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const req_ = await db.reviewRequest.create({
    data: {
      bookingRef: body.bookingRef,
      guestName: body.guestName,
      guestPhone: body.guestPhone,
      guestEmail: body.guestEmail || null,
    },
  });
  // Send the review request via WhatsApp (simulated)
  await db.notification.create({
    data: {
      type: "WHATSAPP",
      recipient: body.guestPhone,
      body: `Namaskaram ${body.guestName}! Thank you for staying at Guruvayur Dham. We'd love your feedback — please leave a Google review: https://g.page/r/GURUVAYUR_DHAM/review. It takes 30 seconds and means the world to our family-run property.`,
      status: "QUEUED",
      relatedRef: body.bookingRef,
    },
  });
  await db.reviewRequest.update({
    where: { id: req_.id },
    data: { sentAt: new Date(), status: "SENT" },
  });
  return NextResponse.json({ request: req_, message: "Review request sent via WhatsApp" });
}

// PATCH /api/reviews — mark as completed
export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json();
  const req_ = await db.reviewRequest.update({ where: { id }, data: { status } });
  return NextResponse.json({ request: req_ });
}
