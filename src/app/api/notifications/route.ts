import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

const NotificationTypeEnum = z.enum(["SMS", "EMAIL", "WHATSAPP", "PUSH"]);

const CreateNotificationSchema = z.object({
  type: NotificationTypeEnum,
  recipient: z.string().min(1).max(200),
  subject: z.string().max(500).optional(),
  body: z.string().min(1),
  relatedRef: z.string().max(100).optional(),
});

const BulkNotificationSchema = z.object({
  template: z.string().min(1),
  recipients: z.array(z.union([z.string(), z.object({ phone: z.string(), name: z.string().optional() })])).min(1),
  type: NotificationTypeEnum.optional(),
});

// GET /api/notifications · list all notifications (SMS/Email/WhatsApp log)
export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

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
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = CreateNotificationSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { type, recipient, subject, body } = parsed.data;
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
  const { error } = await requireStaff(req, ["MANAGER"]);
  if (error) return error;

  const parsed = BulkNotificationSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { template, recipients, type = "WHATSAPP" } = parsed.data;
  const results: Array<{ id: string; recipient: string; status: string }> = [];
  for (const r of recipients) {
    const notif = await db.notification.create({
      data: {
        type,
        recipient: typeof r === "string" ? r : r.phone,
        body: template.replace("{name}", typeof r === "string" ? "Guest" : (r.name || "Guest")),
        status: "SENT",
        sentAt: new Date(),
      },
    });
    results.push({ id: notif.id, recipient: notif.recipient, status: notif.status });
  }
  return NextResponse.json({ sent: results.length, notifications: results });
}
