import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/push/subscribe
 * Stores a push notification subscription
 * body: { endpoint, keys, userId? }
 */
export async function POST(req: NextRequest) {
  const { endpoint, keys, userId } = await req.json();

  if (!endpoint || !keys) {
    return NextResponse.json({ error: "endpoint and keys required" }, { status: 400 });
  }

  // Upsert — if endpoint exists, update; otherwise create
  const existing = await db.pushSubscription.findUnique({ where: { endpoint } });
  if (existing) {
    await db.pushSubscription.update({
      where: { endpoint },
      data: { keys: JSON.stringify(keys), userId: userId || null },
    });
  } else {
    await db.pushSubscription.create({
      data: {
        endpoint,
        keys: JSON.stringify(keys),
        userId: userId || null,
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
