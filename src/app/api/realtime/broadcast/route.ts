import { NextRequest, NextResponse } from "next/server";
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

  const { event, data } = await req.json();

  // Reject events not in the allowlist.
  if (typeof event !== "string" || !ALLOWED_EVENTS.has(event)) {
    return NextResponse.json(
      { error: `Unknown event: ${event}. Allowed: ${Array.from(ALLOWED_EVENTS).join(", ")}` },
      { status: 400 }
    );
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
    return NextResponse.json({ ok: false, error: e.message }, { status: 200 });
  }
}
