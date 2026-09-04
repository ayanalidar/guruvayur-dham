import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/festival-alerts — list opt-ins
export async function GET() {
  const alerts = await db.festivalAlert.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ alerts: alerts.map(a => ({ ...a, festivals: JSON.parse(a.festivals) })) });
}

// POST /api/festival-alerts — opt in to festival alerts
export async function POST(req: NextRequest) {
  const body = await req.json();
  const alert = await db.festivalAlert.create({
    data: {
      guestName: body.guestName,
      guestPhone: body.guestPhone,
      guestEmail: body.guestEmail || null,
      festivals: JSON.stringify(body.festivals || []),
      notifyDays: body.notifyDays || "30,7,1",
    },
  });
  // Send confirmation notification
  await db.notification.create({
    data: {
      type: "WHATSAPP",
      recipient: body.guestPhone,
      body: `You're now subscribed to festival alerts for: ${(body.festivals || []).join(", ")}. We'll notify you 30, 7, and 1 day(s) before each festival with room availability and booking links.`,
      status: "QUEUED",
    },
  });
  return NextResponse.json({ alert, message: "Subscribed to festival alerts" });
}
