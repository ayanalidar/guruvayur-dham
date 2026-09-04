import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/notifications · list all notifications (SMS/Email/WhatsApp log)
export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  const where: any = {};
  if (type) where.type = type;
  const notifications = await db.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ notifications });
}

// POST /api/notifications · manually send a notification (simulated)
// body: { type: "SMS"|"EMAIL"|"WHATSAPP", recipient, subject?, body }
export async function POST(req: NextRequest) {
  const { type, recipient, subject, body } = await req.json();
  if (!type || !recipient || !body) {
    return NextResponse.json({ error: "type, recipient, body required" }, { status: 400 });
  }
  // Simulate sending (in production: Twilio for SMS/WhatsApp, SendGrid for email)
  const notif = await db.notification.create({
    data: {
      type, recipient, subject: subject || null, body,
      status: "SENT",
      sentAt: new Date(),
    },
  });
  return NextResponse.json({
    notification: notif,
    message: `${type} sent to ${recipient} (simulated)`,
  });
}

// PUT /api/notifications · bulk send (e.g., festival alert to all subscribers)
// body: { template, recipients: [...] }
export async function PUT(req: NextRequest) {
  const { template, recipients, type = "WHATSAPP" } = await req.json();
  if (!template || !Array.isArray(recipients)) {
    return NextResponse.json({ error: "template and recipients[] required" }, { status: 400 });
  }
  const results = [];
  for (const r of recipients) {
    const notif = await db.notification.create({
      data: {
        type,
        recipient: r.phone || r,
        body: template.replace("{name}", r.name || "Guest"),
        status: "SENT",
        sentAt: new Date(),
      },
    });
    results.push(notif);
  }
  return NextResponse.json({ sent: results.length, notifications: results });
}
