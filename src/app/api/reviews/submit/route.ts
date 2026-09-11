import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limiter";

/**
 * POST /api/reviews/submit
 * Rate limited: 3 reviews per hour per IP
 *
 * Phase4-Zod-Gaps: replaced manual `if (!authorName || ...)` checks with
 * Zod safeParse. All PII fields are now bounded (email/phone/name/text/title
 * capped, rating coerced to int 1-5). `stayDate` is kept permissive (max 50
 * chars) to preserve the existing DB write below.
 */
const SubmitReviewSchema = z.object({
  authorName: z.string().min(1).max(200),
  authorEmail: z.string().email().max(200).optional(),
  authorPhone: z.string().max(30).optional(),
  roomSlug: z.string().min(1).max(200),
  rating: z.coerce.number().int().min(1).max(5),
  text: z.string().min(1).max(2000),
  title: z.string().max(200).optional(),
  bookingRef: z.string().max(50).optional(),
  stayDate: z.string().max(50).optional(), // preserved from prior logic
});

export async function POST(req: NextRequest) {
  // Rate limit: 3 reviews per hour
  const rl = await rateLimit(req, { window: 3600, max: 3, key: "review:submit" });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "You've submitted too many reviews recently. Please try again later." },
      { status: 429 }
    );
  }

  const parsed = SubmitReviewSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { authorName, authorEmail, authorPhone, rating, text, roomSlug, stayDate } = parsed.data;

  const review = await db.review.create({
    data: {
      authorName,
      authorAvatar: null,
      rating,
      text,
      reviewDate: new Date(),
      source: "GUEST_SUBMITTED",
      published: false, // pending moderation
      featured: false,
      moderated: false,
      guestEmail: authorEmail || null,
      guestPhone: authorPhone || null,
      roomSlug: roomSlug || null,
      stayDate: stayDate ? new Date(stayDate) : null,
    },
  });

  // Notify admin via WebSocket
  fetch(`${process.env.REALTIME_URL || "http://localhost:3003"}/broadcast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "review:pending",
      data: { id: review.id, authorName, rating, text: text.slice(0, 100) },
    }),
  }).catch(() => {});

  // Log notification
  await db.notification.create({
    data: {
      type: "EMAIL",
      recipient: "manager@guruvayurdham.com",
      subject: `New review pending moderation · ${rating}★ from ${authorName}`,
      body: `A new guest review has been submitted and is pending your approval.\n\nAuthor: ${authorName}\nRating: ${rating}★\nText: ${text}\n\nReview in admin panel: /#/admin/hub → Reviews tab`,
      status: "QUEUED",
    },
  }).catch(() => {});

  return NextResponse.json({
    review,
    message: "Thank you for your review! It has been submitted for moderation and will appear on the website once approved by our team.",
  });
}
