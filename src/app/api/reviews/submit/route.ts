import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limiter";

/**
 * POST /api/reviews/submit
 * Rate limited: 3 reviews per hour per IP
 */
export async function POST(req: NextRequest) {
  // Rate limit: 3 reviews per hour
  const rl = rateLimit(req, { window: 3600, max: 3, key: "review:submit" });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "You've submitted too many reviews recently. Please try again later." },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { authorName, authorEmail, authorPhone, rating, text, roomSlug, stayDate } = body;

  if (!authorName || !rating || !text) {
    return NextResponse.json({ error: "Name, rating, and review text are required" }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }
  if (text.length < 10) {
    return NextResponse.json({ error: "Review must be at least 10 characters" }, { status: 400 });
  }
  if (text.length > 2000) {
    return NextResponse.json({ error: "Review must be under 2000 characters" }, { status: 400 });
  }

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
  fetch("http://localhost:3003/broadcast", {
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
      subject: `New review pending moderation — ${rating}★ from ${authorName}`,
      body: `A new guest review has been submitted and is pending your approval.\n\nAuthor: ${authorName}\nRating: ${rating}★\nText: ${text}\n\nReview in admin panel: /#/admin/hub → Reviews tab`,
      status: "QUEUED",
    },
  }).catch(() => {});

  return NextResponse.json({
    review,
    message: "Thank you for your review! It has been submitted for moderation and will appear on the website once approved by our team.",
  });
}
