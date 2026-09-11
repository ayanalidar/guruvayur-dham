import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

/**
 * GET /api/auth/session
 * Returns the current logged-in user (or null if not authenticated).
 *
 * SECURITY (Phase A H17 fix — role-based field whitelist):
 * - Guests get: id, name, email, role, customerId (their own profile).
 * - Staff get: id, name, role, staffId (NO email/phone/customerId — staff PII
 *   minimization. A guest who somehow obtains a staff session token (via XSS,
 *   log leak, etc.) gets only minimal identity fields, not full staff PII.)
 */
export async function GET(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ user: null, authenticated: false });
  }

  const { user, role } = session;
  const isStaff = role !== "GUEST";

  const safeUser = isStaff
    ? {
        id: user.id,
        name: user.name,
        role, // role already on the user object for backwards compat
        staffId: user.staffId,
      }
    : {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role,
        customerId: user.customerId,
      };

  return NextResponse.json({
    user: safeUser,
    role,
    authenticated: true,
  });
}
