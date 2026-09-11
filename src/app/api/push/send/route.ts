import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limiter";
import webpush from "web-push";

/**
 * POST /api/push/send
 *
 * Sends a web push notification to subscribed devices.
 *
 * FUNCTIONAL (Round 3 F9 fix): the subscribe endpoint was collecting
 * PushSubscription rows but no code ever read them back to send. Push
 * was effectively write-only dead data. This endpoint iterates the
 * PushSubscription table and sends notifications via the web-push library.
 *
 * Required env vars:
 * - NEXT_PUBLIC_VAPID_PUBLIC_KEY (already used by frontend subscribe)
 * - VAPID_PRIVATE_KEY (server-only — generate with `npx web-push generate-vapid-keys`)
 * - VAPID_SUBJECT (mailto: or https: URL for push spec compliance)
 *
 * body: {
 *   title: string,
 *   body: string,
 *   url?: string,           // click-through URL
 *   tag?: string,           // notification tag (replaces existing with same tag)
 *   userId?: string,        // send to specific user's subs only (MANAGER only)
 * }
 *
 * If userId is omitted, sends to ALL subscribers (MANAGER-only broadcast).
 */
const SendPushSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(500),
  url: z.string().max(500).optional(),
  tag: z.string().max(100).optional(),
  userId: z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req, ["MANAGER"]);
  if (error) return error;

  // Rate limit — 10 broadcasts/min/IP (each broadcast iterates all subs).
  const rl = await rateLimit(req, { window: 60, max: 10, key: "push:send" });
  if (!rl.ok) return NextResponse.json({ error: "Too many push broadcasts." }, { status: 429 });

  const parsed = SendPushSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const { title, body, url, tag, userId } = parsed.data;

  // Verify VAPID env vars are set.
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:stay@guruvayurdham.com";
  if (!publicKey || !privateKey) {
    return NextResponse.json(
      { error: "Push notifications not configured. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY + VAPID_SUBJECT env vars." },
      { status: 503 }
    );
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);

  // Fetch subscriptions (filtered by userId if provided).
  const where: any = userId ? { userId } : {};
  const subs = await db.pushSubscription.findMany({ where, take: 1000 });
  if (subs.length === 0) {
    return NextResponse.json({ sent: 0, message: "No push subscriptions found." });
  }

  const payload = JSON.stringify({
    title,
    body,
    url: url || "/",
    tag: tag || "general",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    timestamp: Date.now(),
  });

  let sent = 0;
  let failed = 0;
  const staleEndpoints: string[] = [];

  // Send to each subscription (parallel with limited concurrency).
  await Promise.all(subs.map(async (sub) => {
    try {
      let keys: any = {};
      try { keys = JSON.parse(sub.keys); } catch {}
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: keys.p256dh || "",
            auth: keys.auth || "",
          },
        },
        payload,
        {
          TTL: 60 * 60 * 24, // 24 hours
          urgency: "normal",
        }
      );
      sent++;
    } catch (err: any) {
      failed++;
      // 404 / 410 = subscription expired or cancelled — mark for deletion.
      if (err.statusCode === 404 || err.statusCode === 410) {
        staleEndpoints.push(sub.endpoint);
      }
    }
  }));

  // Cleanup stale subscriptions in the background.
  if (staleEndpoints.length > 0) {
    db.pushSubscription.deleteMany({
      where: { endpoint: { in: staleEndpoints } },
    }).catch(() => {});
  }

  return NextResponse.json({
    sent,
    failed,
    totalSubscriptions: subs.length,
    cleanedUp: staleEndpoints.length,
  });
}
