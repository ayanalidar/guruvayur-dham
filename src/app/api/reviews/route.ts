import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

const ReviewSourceEnum = z.enum([
  "GOOGLE",
  "MANUAL",
  "BOOKING_COM",
  "MAKEMYTRIP",
  "TRIPADVISOR",
  "DIRECT",
]);

const CreateReviewSchema = z.object({
  authorName: z.string().min(1).max(200),
  authorAvatar: z.string().url().optional(),
  rating: z.coerce.number().int().min(1).max(5),
  text: z.string().min(1),
  reviewDate: z.string().optional(),
  source: ReviewSourceEnum.optional(),
  featured: z.boolean().optional(),
});

const UpdateReviewSchema = z.object({
  id: z.string().min(1),
  data: z.object({
    authorName: z.string().max(200).optional(),
    authorAvatar: z.string().url().optional(),
    rating: z.coerce.number().int().min(1).max(5).optional(),
    text: z.string().optional(),
    reviewDate: z.string().optional(),
    source: ReviewSourceEnum.optional(),
    featured: z.boolean().optional(),
    published: z.boolean().optional(),
  }),
});

/**
 * GET /api/reviews · list all reviews (admin)
 * Query params: ?source=GOOGLE, ?published=true, ?featured=true, ?limit=50
 */
export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const source = searchParams.get("source");
  const published = searchParams.get("published");
  const featured = searchParams.get("featured");
  const limit = parseInt(searchParams.get("limit") || "100");

  const where: any = {};
  if (source) where.source = source;
  if (published === "true") where.published = true;
  if (published === "false") where.published = false;
  if (featured === "true") where.featured = true;

  const reviews = await db.review.findMany({
    where,
    orderBy: { reviewDate: "desc" },
    take: limit,
  });

  // Calculate summary stats
  const allPublished = await db.review.findMany({ where: { published: true } });
  const avgRating = allPublished.length > 0
    ? allPublished.reduce((s, r) => s + r.rating, 0) / allPublished.length
    : 0;

  return NextResponse.json({
    reviews,
    stats: {
      total: allPublished.length,
      averageRating: Math.round(avgRating * 10) / 10,
      fiveStar: allPublished.filter(r => r.rating === 5).length,
      fourStar: allPublished.filter(r => r.rating === 4).length,
      threeStar: allPublished.filter(r => r.rating === 3).length,
      twoStar: allPublished.filter(r => r.rating === 2).length,
      oneStar: allPublished.filter(r => r.rating === 1).length,
    },
  });
}

/**
 * POST /api/reviews · create a new review (manual entry by admin)
 * body: { authorName, authorAvatar?, rating, text, reviewDate?, source?, featured? }
 */
export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = CreateReviewSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { authorName, authorAvatar, rating, text, reviewDate, source, featured } = parsed.data;

  const review = await db.review.create({
    data: {
      authorName,
      authorAvatar: authorAvatar || null,
      rating,
      text,
      reviewDate: reviewDate ? new Date(reviewDate) : new Date(),
      source: source || "MANUAL",
      featured: featured || false,
      published: true,
    },
  });

  // Broadcast real-time update via WebSocket
  fetch(`${process.env.REALTIME_URL || "http://localhost:3003"}/broadcast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "review:new",
      data: { id: review.id, authorName, rating, text: text.slice(0, 100), source: review.source },
    }),
  }).catch(() => {});

  return NextResponse.json({ review, message: "Review added" });
}

/**
 * PATCH /api/reviews · update review (toggle published/featured, edit text)
 * body: { id, data: { ...fields } }
 */
export async function PATCH(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = UpdateReviewSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { id, data } = parsed.data;
  const review = await db.review.update({
    where: { id },
    data: {
      ...data,
      reviewDate: data.reviewDate ? new Date(data.reviewDate) : undefined,
    },
  });

  // Broadcast update
  fetch(`${process.env.REALTIME_URL || "http://localhost:3003"}/broadcast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "review:update",
      data: { id: review.id, published: review.published, featured: review.featured },
    }),
  }).catch(() => {});

  return NextResponse.json({ review });
}

/**
 * DELETE /api/reviews?id=xxx
 */
export async function DELETE(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.review.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
