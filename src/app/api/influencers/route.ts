import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import crypto from "crypto";

const SocialPlatformEnum = z.enum([
  "INSTAGRAM",
  "YOUTUBE",
  "TWITTER",
  "FACEBOOK",
  "BLOG",
  "OTHER",
]);

const CreateInfluencerSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  socialPlatform: SocialPlatformEnum,
  socialHandle: z.string().min(1).max(200),
  followerCount: z.coerce.number().int().min(0).optional(),
});

const UpdateInfluencerSchema = z.object({
  id: z.string().min(1),
  data: z.object({
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]).optional(),
    commissionRate: z.coerce.number().min(0).max(100).optional(),
    notes: z.string().optional(),
  }),
});

/**
 * GET /api/influencers
 * Returns all influencers (admin)
 */
export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const status = req.nextUrl.searchParams.get("status");
  const where: any = {};
  if (status) where.status = status;

  const influencers = await db.influencer.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { clicks: true } } },
  });

  return NextResponse.json({ influencers });
}

/**
 * POST /api/influencers
 * Register a new influencer (public · anyone can apply)
 * body: { name, email, phone, socialPlatform, socialHandle, followerCount }
 */
export async function POST(req: NextRequest) {
  const parsed = CreateInfluencerSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { name, email, phone, socialPlatform, socialHandle, followerCount } = parsed.data;

  // SECURITY (Round 3 M7 fix): anti-enumeration — return same response shape
  // whether email exists or not (was: 409 "This email is already registered").
  const existing = await db.influencer.findUnique({ where: { email } });
  if (existing) {
    // Don't reveal existence — queue a "duplicate application" notification
    // to the existing email so the legitimate owner is notified.
    await db.notification.create({
      data: {
        type: "EMAIL",
        recipient: email,
        subject: "Duplicate influencer application received",
        body: `Someone submitted a new influencer application using your email. If this was you, your existing application is still pending review. If not, please ignore this email.`,
        status: "QUEUED",
      },
    }).catch(() => {});
    return NextResponse.json({
      ok: true,
      message: "Application received. We'll review and contact you within 3 business days.",
    });
  }

  // SECURITY (Round 3 M8 fix): generate cryptographically-secure unique code.
  // Was: "GD" + name.slice(0,4) + Math.floor(Math.random() * 90 + 10) — only
  // 90 possible 2-digit suffixes, predictable name prefix, attacker could
  // enumerate ~90 codes per name to find active influencer codes (used for
  // commission attribution via /api/influencer-track).
  // Now: 6-hex-char suffix from crypto.randomBytes (16M possibilities).
  const uniqueCode = "GD" + crypto.randomBytes(3).toString("hex").toUpperCase();

  const influencer = await db.influencer.create({
    data: {
      name, email, phone: phone || null,
      socialPlatform, socialHandle,
      followerCount: followerCount || 0,
      uniqueCode,
      status: "PENDING",
    },
  });

  // Notify admin
  await db.notification.create({
    data: {
      type: "EMAIL",
      recipient: "manager@guruvayurdham.com",
      subject: `New influencer application: ${name}`,
      body: `New influencer application received.\n\nName: ${name}\nEmail: ${email}\nPlatform: ${socialPlatform}\nHandle: ${socialHandle}\nFollowers: ${followerCount}\n\nReview in admin panel: /#/admin/hub → Influencers tab`,
      status: "QUEUED",
    },
  }).catch(() => {});

  return NextResponse.json({
    influencer,
    message: "Application submitted! We'll review and get back to you within 48 hours.",
  });
}

/**
 * PATCH /api/influencers
 * Update influencer status (approve/reject/suspend) or commission rate
 * body: { id, data: { status?, commissionRate?, notes? } }
 */
export async function PATCH(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = UpdateInfluencerSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { id, data } = parsed.data;
  const influencer = await db.influencer.update({ where: { id }, data });
  return NextResponse.json({ influencer });
}
