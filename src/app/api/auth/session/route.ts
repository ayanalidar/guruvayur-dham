import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

/**
 * GET /api/auth/session
 * Returns the current logged-in user (or null if not authenticated)
 */
export async function GET(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ user: null, authenticated: false });
  }
  return NextResponse.json({
    user: session.user,
    role: session.role,
    authenticated: true,
  });
}
