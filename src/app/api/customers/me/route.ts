import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

/**
 * GET /api/customers/me
 *
 * Returns the calling user's own customer record (matched by phone or email).
 * Guest-facing variant of /api/customers (which is now staff-only).
 *
 * SECURITY: requires an authenticated session. Only the user's own customer
 * record is returned — no `?search=` query param is honored.
 */
export async function GET(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const phone = session.user.phone || "";
  const email = session.user.email || "";

  if (!phone && !email) {
    return NextResponse.json({ customer: null });
  }

  const where: any = {
    OR: [
      ...(phone ? [{ phone }] : []),
      ...(email ? [{ email }] : []),
    ],
  };

  const customer = await db.customer.findFirst({ where });
  return NextResponse.json({ customer });
}
