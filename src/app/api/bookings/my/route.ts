import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

/**
 * GET /api/bookings/my
 *
 * Returns bookings belonging to the calling guest (matched by phone or email).
 * This is the guest-facing variant of /api/bookings (which is now staff-only).
 *
 * SECURITY: requires an authenticated session. The user's own phone/email are
 * the only allowed filter — no `?search=` query param is honored here.
 */
export async function GET(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "GUEST" && session.role !== "MANAGER" && session.role !== "RECEPTIONIST") {
    // Staff have access to /api/bookings (full list) — but if they hit /my,
    // return their personal bookings too (they may have their own guest bookings).
  }

  const phone = session.user.phone || "";
  const email = session.user.email || "";

  if (!phone && !email) {
    return NextResponse.json({ bookings: [], message: "No phone or email on profile — cannot match bookings." });
  }

  // Find bookings where guestPhone matches user's phone OR guestEmail matches.
  const where: any = {
    OR: [
      ...(phone ? [{ guestPhone: phone }] : []),
      ...(email ? [{ guestEmail: email }] : []),
    ],
  };

  const bookings = await db.booking.findMany({
    where,
    orderBy: { checkIn: "desc" },
    take: 50,
    include: { room: { select: { name: true, slug: true } } },
  });

  return NextResponse.json({ bookings });
}
