import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/reviews/public
 * Returns published reviews for public display (homepage widget, reviews page)
 * Query: ?limit=10, ?featured=true, ?minRating=4
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const limit = parseInt(searchParams.get("limit") || "10");
  const featured = searchParams.get("featured") === "true";
  const minRating = parseInt(searchParams.get("minRating") || "0");

  const where: any = { published: true };
  if (featured) where.featured = true;
  if (minRating > 0) where.rating = { gte: minRating };

  const reviews = await db.review.findMany({
    where,
    orderBy: { reviewDate: "desc" },
    take: limit,
  });

  // Calculate summary
  const allPublished = await db.review.findMany({ where: { published: true } });
  const avgRating = allPublished.length > 0
    ? allPublished.reduce((s, r) => s + r.rating, 0) / allPublished.length
    : 0;

  return NextResponse.json({
    reviews,
    summary: {
      total: allPublished.length,
      averageRating: Math.round(avgRating * 10) / 10,
      googleRating: 4.9, // would come from Google Places API in production
      googleReviewCount: 847,
    },
  });
}
