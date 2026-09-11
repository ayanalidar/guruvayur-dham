import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";

/**
 * Event-name allowlist for realtime broadcasts.
 *
 * SECURITY (Phase D M1 fix): restricts which event names can be broadcast
 * to admin dashboards. Without this, a compromised staff token could push
 * arbitrary event names (e.g. "viewer:count:99999", "payment:received")
 * that the frontend might render as legitimate.
 */
const ALLOWED_EVENTS = new Set([
  "booking:new",
  "booking:cancelled",
  "booking:updated",
  "sync:new",
  "sync:complete",
  "kitchen:order:new",
  "kitchen:order:update",
  "housekeeping:update",
  "pooja:update",
  "review:new",
  "review:update",
  "review:pending",
  "blog:scheduled",
  "blog:published",
  "reviews:imported",
]);

/**
 * SECURITY (Round 3 M19 fix): per-event data schemas.
 * Validates the `data` payload matches the expected shape for each event.
 * Without this, a compromised staff token could push a booking:new event
 * with `data.amount: -99999` or `data.reference: "<script>alert(1)</script>"`
 * — React escapes by default so XSS is unlikely, but UI confusion is possible.
 */
const EventDataSchemas: Record<string, z.ZodType> = {
  "booking:new": z.object({
    reference: z.string().max(50),
    guestName: z.string().max(200),
    roomSlug: z.string().max(200).optional(),
    amount: z.number().optional(),
    source: z.string().max(50).optional(),
    checkIn: z.any().optional(),
    checkOut: z.any().optional(),
  }).passthrough(),
  "booking:cancelled": z.object({
    reference: z.string().max(50),
    guestName: z.string().max(200).optional(),
    roomSlug: z.string().max(200).optional(),
    refundPercent: z.number().optional(),
    refundAmount: z.number().optional(),
    reason: z.string().max(2000).optional(),
  }).passthrough(),
  "booking:updated": z.object({
    reference: z.string().max(50),
  }).passthrough(),
  "sync:new": z.object({
    reference: z.string().max(50).optional(),
  }).passthrough(),
  "sync:complete": z.object({}).passthrough(),
  "kitchen:order:new": z.object({
    reference: z.string().max(50),
    roomNumber: z.string().max(20).optional(),
    guestName: z.string().max(200).optional(),
  }).passthrough(),
  "kitchen:order:update": z.object({
    reference: z.string().max(50),
    status: z.string().max(50).optional(),
  }).passthrough(),
  "housekeeping:update": z.object({
    roomNumber: z.string().max(20).optional(),
    status: z.string().max(50).optional(),
  }).passthrough(),
  "pooja:update": z.object({}).passthrough(),
  "review:new": z.object({
    authorName: z.string().max(200).optional(),
    rating: z.number().int().min(1).max(5).optional(),
  }).passthrough(),
  "review:update": z.object({}).passthrough(),
  "review:pending": z.object({}).passthrough(),
  "blog:scheduled": z.object({
    slug: z.string().max(200).optional(),
  }).passthrough(),
  "blog:published": z.object({
    slug: z.string().max(200).optional(),
  }).passthrough(),
  "reviews:imported": z.object({}).passthrough(),
};

const BroadcastSchema = z.object({
  event: z.string().min(1).max(50),
  data: z.record(z.string(), z.any()).optional(),
});

/**
 * POST /api/realtime/broadcast
 * Forwards an event to the WebSocket service (port 3003) for real-time broadcast.
 * body: { event, data }
 *
 * Called by other API routes (bookings, kitchen-orders, etc.) when they want
 * to push a real-time update to all connected admin dashboards.
 */
export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = BroadcastSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const { event, data } = parsed.data;

  // Reject events not in the allowlist.
  if (!ALLOWED_EVENTS.has(event)) {
    return NextResponse.json(
      { error: `Unknown event: ${event}. Allowed: ${Array.from(ALLOWED_EVENTS).join(", ")}` },
      { status: 400 }
    );
  }

  // M19 fix: validate data shape against the per-event schema.
  const dataSchema = EventDataSchemas[event];
  if (dataSchema && data) {
    const dataParsed = dataSchema.safeParse(data);
    if (!dataParsed.success) {
      return NextResponse.json(
        { error: `Invalid data shape for event ${event}`, details: dataParsed.error.flatten() },
        { status: 400 }
      );
    }
  }

  try {
    const r = await fetch(`${process.env.REALTIME_URL || "http://localhost:3003"}/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, data }),
    });
    const j = await r.json();
    return NextResponse.json({ ok: true, broadcast: j });
  } catch (e: any) {
    // Realtime service might be down · fail silently (don't break the booking flow)
    return NextResponse.json({ ok: false, error: "Realtime service unavailable" }, { status: 200 });
  }
}
