import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/realtime/broadcast
 * Forwards an event to the WebSocket service (port 3003) for real-time broadcast.
 * body: { event, data }
 *
 * Called by other API routes (bookings, kitchen-orders, etc.) when they want
 * to push a real-time update to all connected admin dashboards.
 */
export async function POST(req: NextRequest) {
  const { event, data } = await req.json();
  try {
    const r = await fetch("http://localhost:3003/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, data }),
    });
    const j = await r.json();
    return NextResponse.json({ ok: true, broadcast: j });
  } catch (e: any) {
    // Realtime service might be down — fail silently (don't break the booking flow)
    return NextResponse.json({ ok: false, error: e.message }, { status: 200 });
  }
}
