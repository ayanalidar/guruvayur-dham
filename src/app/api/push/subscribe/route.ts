import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limiter";
import { getUserFromRequest } from "@/lib/auth";

/**
 * POST /api/push/subscribe
 * Stores a push notification subscription.
 *
 * SECURITY (Round 3 M6 fix):
 * - Zod validation on endpoint (URL, max 500 chars) + keys (object with p256dh + auth)
 * - userId is taken from the SESSION (not the request body) — was: attacker
 *   could subscribe with another user's userId and receive their push notifications
 * - endpoint max length prevents DB DoS with huge strings
 *
 * body: { endpoint, keys: { p256dh, auth } }
 */
const SubscribeSchema = z.object({
  endpoint: z.string().url().max(500),
  keys: z.object({
    p256dh: z.string().max(500),
    auth: z.string().max(200),
  }),
});

export async function POST(req: NextRequest) {
  // Rate limit — 10 subscriptions/min per IP (prevents DB spam).
  const rl = await rateLimit(req, { window: 60, max: 10, key: "push:subscribe" });
  if (!rl.ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const parsed = SubscribeSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const { endpoint, keys } = parsed.data;

  // Take userId from the session, NOT the request body.
  // Anonymous users (no session) can still subscribe — userId will be null.
  let userId: string | null = null;
  try {
    const session = await getUserFromRequest(req);
    if (session) userId = session.user.id;
  } catch {}

  // Upsert · if endpoint exists, update; otherwise create
  const existing = await db.pushSubscription.findUnique({ where: { endpoint } });
  if (existing) {
    await db.pushSubscription.update({
      where: { endpoint },
      data: { keys: JSON.stringify(keys), userId },
    });
  } else {
    await db.pushSubscription.create({
      data: {
        endpoint,
        keys: JSON.stringify(keys),
        userId,
        userAgent: req.headers.get("user-agent") || null,
      },
    });
  }

  return NextResponse.json({ ok: true, message: "Subscribed to push notifications" });
}

/**
 * DELETE /api/push/subscribe?endpoint=xxx
 * Removes a subscription
 */
export async function DELETE(req: NextRequest) {
  const endpoint = req.nextUrl.searchParams.get("endpoint");
  if (!endpoint) return NextResponse.json({ error: "endpoint required" }, { status: 400 });

  await db.pushSubscription.deleteMany({ where: { endpoint } });
  return NextResponse.json({ ok: true });
}

/**
 * GET /api/push/subscribe
 * Returns count of subscribers
 */
export async function GET() {
  const count = await db.pushSubscription.count();
  return NextResponse.json({ subscribers: count });
}
