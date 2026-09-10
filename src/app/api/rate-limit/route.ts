import { NextRequest, NextResponse } from "next/server";
import { getRateLimitStats, clearRateLimits } from "@/lib/rate-limiter";
import { requireStaff } from "@/lib/auth";

/**
 * GET /api/rate-limit
 * Returns current rate limit statistics
 */
export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req, ["MANAGER"]);
  if (error) return error;

  const stats = getRateLimitStats();
  return NextResponse.json({
    ...stats,
    config: {
      auth: { window: 60, max: 5 }, // 5 login attempts per minute
      booking: { window: 60, max: 10 }, // 10 bookings per minute
      review: { window: 3600, max: 3 }, // 3 reviews per hour
      api: { window: 60, max: 60 }, // 60 API calls per minute
    },
  });
}

/**
 * DELETE /api/rate-limit
 * Clear all rate limit data (admin action)
 */
export async function DELETE(req: NextRequest) {
  const { error } = await requireStaff(req, ["MANAGER"]);
  if (error) return error;

  clearRateLimits();
  return NextResponse.json({ ok: true, message: "Rate limits cleared" });
}
