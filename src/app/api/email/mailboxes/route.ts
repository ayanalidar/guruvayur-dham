import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { listHostingerMailboxes } from "@/lib/email";

/**
 * GET /api/email/mailboxes
 *
 * Calls Hostinger Mail API /api/v1/me to list the mailboxes the current
 * API token can manage. Returns an array of { resourceId, address }.
 *
 * Used by the Admin → Settings → Integration tab to populate a dropdown
 * so the user can pick the right mailbox (instead of typing the resource
 * ID by hand).
 *
 * Auth: any staff (most useful to MANAGER setting things up, but RECEPTIONIST
 * may also need to verify which mailbox is being used).
 */
export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  try {
    const result = await listHostingerMailboxes();
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 },
      );
    }
    return NextResponse.json({
      ok: true,
      mailboxes: result.mailboxes,
      count: result.mailboxes?.length || 0,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to list mailboxes" },
      { status: 500 },
    );
  }
}
