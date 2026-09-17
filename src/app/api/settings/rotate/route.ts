import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { setSetting, invalidateAllSettingsCaches } from "@/lib/settings";

/**
 * POST /api/settings/rotate
 *
 * Generates a new random value for a sensitive setting (CRON_SECRET or
 * NEXTAUTH_SECRET), saves it via setSetting, and returns the new value so
 * the admin can update external cron services or OAuth providers.
 *
 * body: { key: "CRON_SECRET" | "NEXTAUTH_SECRET", confirm?: boolean }
 *   - CRON_SECRET:        no confirmation needed. Returns the new secret.
 *   - NEXTAUTH_SECRET:    requires confirm: true. WARNING: rotating
 *                         NEXTAUTH_SECRET invalidates ALL active staff + guest
 *                         sessions (the JWT signing key changes), and breaks
 *                         decryption of any Setting rows encrypted with the
 *                         old key (the encrypted Setting table is keyed by
 *                         NEXTAUTH_SECRET). Use only as disaster recovery.
 *
 * MANAGER-only — rotating the JWT signing key is the most destructive
 * setting operation available.
 *
 * SelfReliant-Phase2-4.
 */

const RotatableKeyEnum = z.enum(["CRON_SECRET", "NEXTAUTH_SECRET"]);

const RotateSchema = z.object({
  key: RotatableKeyEnum,
  confirm: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const { session, error } = await requireStaff(req, ["MANAGER"]);
  if (error || !session) {
    return error || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = RotateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { key, confirm } = parsed.data;

  // NEXTAUTH_SECRET rotation requires explicit confirmation because it
  // invalidates every active session AND breaks decryption of every encrypted
  // Setting row (the Setting table is encrypted with NEXTAUTH_SECRET as the
  // master key — see src/lib/settings.ts). Admin must acknowledge this.
  if (key === "NEXTAUTH_SECRET" && !confirm) {
    return NextResponse.json(
      {
        error: "Confirmation required",
        warning:
          "Rotating NEXTAUTH_SECRET will (1) invalidate ALL active staff + guest sessions (the JWT signing key changes), and (2) break decryption of every encrypted Setting row (the Setting table is AES-256-GCM keyed by NEXTAUTH_SECRET). Re-pass with confirm: true to proceed. Use only as disaster recovery.",
      },
      { status: 409 },
    );
  }

  // Generate the new value. CRON_SECRET is a 256-bit hex token (good for
  // Bearer-header auth with cron services). NEXTAUTH_SECRET is a 256-bit
  // base64 token (JWT signing key — base64 keeps it URL-safe in env vars).
  let newValue: string;
  if (key === "CRON_SECRET") {
    newValue = crypto.randomBytes(32).toString("hex");
  } else {
    newValue = crypto.randomBytes(32).toString("base64");
  }

  // Save to the encrypted Setting table. invalidateAllSettingsCaches()
  // ensures the next read returns the new value.
  await setSetting(
    key,
    newValue,
    session.user.id,
    /* isSecret */ true,
    /* category */ key === "CRON_SECRET" ? "SECRET" : "SECRET",
    /* label */ undefined,
  );
  invalidateAllSettingsCaches();

  // Audit log — never write the actual new value (could be a secret).
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const ua = req.headers.get("user-agent") || "unknown";
  await db.auditLog.create({
    data: {
      userId: session.user.id,
      userName: session.user.name || null,
      action: "ROTATE",
      entity: "SETTING",
      entityId: key,
      details: JSON.stringify({
        key,
        rotatedBy: session.user.id,
        confirmed: !!confirm,
        // Length only — never the value.
        newValueLength: newValue.length,
      }),
      ipAddress: ip,
      userAgent: ua,
    },
  });

  // For NEXTAUTH_SECRET, the caller must restart the app for the new key
  // to take effect (NextAuth reads it at module-load time). Surface a
  // warning in the response so the admin knows what to do next.
  const warning =
    key === "NEXTAUTH_SECRET"
      ? "NEXTAUTH_SECRET rotated. ALL active sessions are now invalid (users must re-login). The encrypted Setting table is now unreadable until the OLD NEXTAUTH_SECRET is restored, OR each secret is re-saved via the Settings UI. Restart the app (docker compose restart app) for the new JWT signing key to take effect."
      : "CRON_SECRET rotated. Update external cron services (Vercel Cron / VPS crontab) with the new value before their next run — old Bearer tokens will be rejected.";

  return NextResponse.json({
    ok: true,
    key,
    newValue,
    warning,
    // For CRON_SECRET, give the admin a ready-to-use Bearer header so
    // they can paste it into Vercel Cron config / .env on the cron server.
    bearerHeader: key === "CRON_SECRET" ? `Bearer ${newValue}` : undefined,
  });
}
