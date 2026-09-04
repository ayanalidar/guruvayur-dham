import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/influencers
 * Returns all influencers (admin)
 */
export async function GET(req: NextRequest) {
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
  const body = await req.json();
  const { name, email, phone, socialPlatform, socialHandle, followerCount } = body;

  if (!name || !email || !socialPlatform || !socialHandle) {
    return NextResponse.json({ error: "Name, email, social platform, and handle required" }, { status: 400 });
  }

  // Check if email already registered
  const existing = await db.influencer.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "This email is already registered as an influencer" }, { status: 409 });
  }

  // Generate unique code
  const uniqueCode = "GD" + name.split(" ")[0].toUpperCase().slice(0, 4) + Math.floor(Math.random() * 90 + 10);

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
  const { id, data } = await req.json();
  const influencer = await db.influencer.update({ where: { id }, data });
  return NextResponse.json({ influencer });
}
