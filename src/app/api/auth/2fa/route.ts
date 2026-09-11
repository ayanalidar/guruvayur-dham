import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import crypto from "crypto";

/**
 * 2FA TOTP implementation (RFC 6238)
 *
 * SECURITY (Phase A C6 + H10 fix):
 * - All handlers now require an authenticated session via requireUser(req).
 * - The userId is taken from the session, NOT from the request body/query.
 *   (Previously, an unauthenticated attacker could enable 2FA on anyone's
 *   account — full account lockout.)
 * - GET no longer leaks which users have 2FA enabled (enumeration).
 */

function base32Encode(buffer: Buffer): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0, value = 0, output = "";
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += alphabet[(value << (5 - bits)) & 31];
  return output;
}

function base32Decode(secret: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleaned = secret.replace(/=+$/, "").replace(/\s/g, "").toUpperCase();
  let bits = 0, value = 0, output: number[] = [];
  for (const char of cleaned) {
    const idx = alphabet.indexOf(char);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(output);
}

function generateTOTP(secret: string, timeStep = 30, digits = 6): string {
  const time = Math.floor(Date.now() / 1000 / timeStep);
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(time));

  const key = base32Decode(secret);
  const hmac = crypto.createHmac("sha1", key).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = ((hmac[offset] & 0x7f) << 24 | hmac[offset + 1] << 16 | hmac[offset + 2] << 8 | hmac[offset + 3]) % Math.pow(10, digits);
  return code.toString().padStart(digits, "0");
}

/**
 * POST /api/auth/2fa
 * Setup: Generates a TOTP secret + QR code URL for the calling user.
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requireUser(req);
  if (error || !session) return error || NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Generate secret
  const secret = base32Encode(crypto.randomBytes(20));
  const otpauthUrl = `otpauth://totp/GuruvayurDham:${user.email || user.name}?secret=${secret}&issuer=GuruvayurDham&digits=6&period=30`;

  // Store secret (not enabled yet)
  await db.twoFactorSecret.upsert({
    where: { userId },
    create: { userId, secret, enabled: false },
    update: { secret, enabled: false },
  });

  // Generate backup codes
  const backupCodes = Array.from({ length: 8 }).map(() => crypto.randomBytes(4).toString("hex").toUpperCase());
  await db.twoFactorSecret.update({
    where: { userId },
    data: { backupCodes: JSON.stringify(backupCodes) },
  });

  return NextResponse.json({
    secret,
    otpauthUrl,
    qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`,
    backupCodes,
  });
}

/**
 * PUT /api/auth/2fa
 * Verify: Validates the TOTP code and enables 2FA for the calling user.
 * body: { code }
 */
export async function PUT(req: NextRequest) {
  const { session, error } = await requireUser(req);
  if (error || !session) return error || NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

  const tf = await db.twoFactorSecret.findUnique({ where: { userId } });
  if (!tf) return NextResponse.json({ error: "2FA not set up — call POST first" }, { status: 400 });

  const expectedCode = generateTOTP(tf.secret);
  if (code !== expectedCode) {
    // Check backup codes
    const backups: string[] = tf.backupCodes ? JSON.parse(tf.backupCodes) : [];
    if (!backups.includes(code.toUpperCase())) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }
    // Remove used backup code
    const remaining = backups.filter(c => c !== code.toUpperCase());
    await db.twoFactorSecret.update({
      where: { userId },
      data: { backupCodes: JSON.stringify(remaining) },
    });
  }

  await db.twoFactorSecret.update({
    where: { userId },
    data: { enabled: true },
  });

  return NextResponse.json({ ok: true, message: "2FA enabled successfully" });
}

/**
 * GET /api/auth/2fa
 * Get 2FA status for the calling user (not arbitrary userId).
 */
export async function GET(req: NextRequest) {
  const { session, error } = await requireUser(req);
  if (error || !session) return error || NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const tf = await db.twoFactorSecret.findUnique({ where: { userId } });
  return NextResponse.json({
    enabled: tf?.enabled || false,
    setup: !!tf,
  });
}

export { generateTOTP };
