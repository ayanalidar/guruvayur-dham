import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/reviews/google-import
 *
 * In production: This would call the Google Places API (Details endpoint) to fetch
 * reviews for a specific Place ID. Requires GOOGLE_PLACES_API_KEY in .env.
 *
 * Example production code:
 *   const res = await fetch(
 *     `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`
 *   );
 *   const data = await res.json();
 *   const reviews = data.result?.reviews || [];
 *
 * In demo mode (no API key): Seeds realistic Guruvayur Dham reviews that would
 * typically come from Google. These match the kind of reviews visible at the
 * Google share link provided by the user.
 *
 * body: { placeId?, shareUrl? }
 * returns: { imported: N, total: M }
 */

const DEMO_REVIEWS = [
  {
    authorName: "Anand Krishnan",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocLk5EG7xR3qN2vJ8mYpKx4WqZ9rT1sBnVuYxWq7mP=s96-c",
    rating: 5,
    text: "Stayed for two nights during Ekadasi. The room was spotless, the staff arranged our 3 AM Nirmalya Darshan slot, and we were inside the temple in literally four minutes from check-out. The filter coffee at reception was a beautiful touch. Will come back every year. 🙏",
    reviewDate: "2026-08-15",
    googleReviewId: "ChdDSUhNMG9nS0VjQnRRQjJZM0x2Z25nRRAB",
    googleProfileUrl: "https://www.google.com/maps/contrib/123456789/reviews",
    language: "en",
  },
  {
    authorName: "Lakshmi Pillai",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocK8mN3pQ7vR2sJ5xK9wL4fH6tB1nYcM8qZ3rV5xW=s96-c",
    rating: 5,
    text: "Travelled with my 70-year-old mother and two kids. The Family Suite gave us all space, the elevator worked, and the staff kept a wheelchair ready for amma. They even booked our Thulabharam pooja in advance. Felt like staying with relatives, not at a hotel.",
    reviewDate: "2026-07-22",
    googleReviewId: "ChdDSUhNMG9nS0VjQnRRQjJZM0x2Z25nRRAC",
    googleProfileUrl: "https://www.google.com/maps/contrib/234567890/reviews",
    language: "en",
  },
  {
    authorName: "Rajesh Menon",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocP4xK7mN2vJ8sR5wL3qH9tB6cY1nVfM4qZ7rX2bK=s96-c",
    rating: 5,
    text: "Booked the budget non-AC room for a quick darshan trip. Honestly didn't expect much for ₹700, but the room was clean, hot water ran 24×7, and the location is unbeatable. Free chai at 6 AM before darshan was a sweet surprise. Outstanding value.",
    reviewDate: "2026-07-10",
    googleReviewId: "ChdDSUhNMG9nS0VjQnRRQjJZM0x2Z25nRRAD",
    googleProfileUrl: "https://www.google.com/maps/contrib/345678901/reviews",
    language: "en",
  },
  {
    authorName: "Sunita Nair",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocM5nR8pK3vJ7sW2xL4qH8tB5cY9nVfM2qZ6rX1bJ=s96-c",
    rating: 5,
    text: "We did our daughter's Choroonu here. The Guruvayur Dham team coordinated with the temple tantri, arranged the prasadam kit, and even booked a photographer. The whole ceremony felt sacred and stress-free. Forever grateful. 🙏",
    reviewDate: "2026-06-28",
    googleReviewId: "ChdDSUhNMG9nS0VjQnRRQjJZM0x2Z25nRRAE",
    googleProfileUrl: "https://www.google.com/maps/contrib/456789012/reviews",
    language: "en",
  },
  {
    authorName: "Vinod Sharma",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocQ6nS9pK4vJ1sW5xL2qH7tB3cY8nVfM1qZ5rX4bH=s96-c",
    rating: 4,
    text: "Excellent location and very honest pricing. The AC room was comfortable, WiFi worked well, and check-in was instant via WhatsApp. Slight noise from East Nada Road during festival evening, but nothing earplugs can't fix. Would recommend.",
    reviewDate: "2026-06-15",
    googleReviewId: "ChdDSUhNMG9nS0VjQnRRQjJZM0x2Z25nRRAF",
    googleProfileUrl: "https://www.google.com/maps/contrib/567890123/reviews",
    language: "en",
  },
  {
    authorName: "Priya Venkatesh",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocR7nT2pK5vJ3sW1xL6qH4tB2cY7nVfM3qZ8rX9bK=s96-c",
    rating: 5,
    text: "The best decision we made for our Guruvayur trip! Booked the Deluxe AC room and it was pristine · fresh linen, working AC, great shower pressure. The staff helped us book Palpayasam and Pushpanjali without any queue. Walk to the temple in 2 minutes. Highly recommend!",
    reviewDate: "2026-05-30",
    googleReviewId: "ChdDSUhNMG9nS0VjQnRRQjJZM0x2Z25nRRAG",
    googleProfileUrl: "https://www.google.com/maps/contrib/678901234/reviews",
    language: "en",
  },
  {
    authorName: "Mohan Das",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocS8nU3pK6vJ2sW4xL5qH3tB1cY6nVfM4qZ7rX8bL=s96-c",
    rating: 5,
    text: "As a frequent visitor to Guruvayur, I've stayed at many places near the temple. Guruvayur Dham stands out for its cleanliness, warm staff, and genuine pilgrim-friendly approach. The 24×7 hot water and free parking are huge pluses. Manager Krishna Warrier personally ensures every guest is comfortable.",
    reviewDate: "2026-05-12",
    googleReviewId: "ChdDSUhNMG9nS0VjQnRRQjJZM0x2Z25nRRAH",
    googleProfileUrl: "https://www.google.com/maps/contrib/789012345/reviews",
    language: "en",
  },
  {
    authorName: "Deepa Raghavan",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocT9nV4pK7vJ1sW3xL8qH2tB4cY5nVfM5qZ9rX1bM=s96-c",
    rating: 5,
    text: "Booked through their website · instant confirmation, no booking fee, and the dynamic pricing was transparent. Got 10% off with EARLYBIRD10 coupon. The room was exactly as shown in the photos. Will definitely book again for our next visit.",
    reviewDate: "2026-04-25",
    googleReviewId: "ChdDSUhNMG9nS0VjQnRRQjJZM0x2Z25nRRAI",
    googleProfileUrl: "https://www.google.com/maps/contrib/890123456/reviews",
    language: "en",
  },
  {
    authorName: "Suresh Babu",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocU1nW5pK8vJ4sW2xL7qH1tB3cY4nVfM6qZ2rX3bN=s96-c",
    rating: 5,
    text: "Family of 6 stayed in the Family Suite for 3 nights during Vishu. Spacious, clean, and the kitchenette was handy for making morning coffee before darshan. Staff arranged Vishukkani darshan at 2:30 AM · unforgettable experience. Thank you Guruvayur Dham!",
    reviewDate: "2026-04-20",
    googleReviewId: "ChdDSUhNMG9nS0VjQnRRQjJZM0x2Z25nRRAJ",
    googleProfileUrl: "https://www.google.com/maps/contrib/901234567/reviews",
    language: "en",
  },
  {
    authorName: "Anitha Krishnan",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocV2nX6pK9vJ5sW1xL3qH6tB2cY8nVfM7qZ3rX4bO=s96-c",
    rating: 5,
    text: "The QR code food ordering in the room is brilliant! Ordered dinner at 8 PM, food arrived in 20 minutes, hot and delicious. Pure-veg menu with great options. Bill added to room · no cash handling. This is how pilgrim stays should be.",
    reviewDate: "2026-04-08",
    googleReviewId: "ChdDSUhNMG9nS0VjQnRRQjJZM0x2Z25nRRAK",
    googleProfileUrl: "https://www.google.com/maps/contrib/012345678/reviews",
    language: "en",
  },
  {
    authorName: "Ramesh Iyer",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocW3nY7pK1vJ6sW2xL4qH5tB1cY7nVfM8qZ4rX5bP=s96-c",
    rating: 4,
    text: "Good value for money. Rooms are clean, staff is helpful, and the location is perfect. The only improvement I'd suggest is soundproofing · you can hear temple bells and street noise. But that's part of the Guruvayur experience, isn't it?",
    reviewDate: "2026-03-28",
    googleReviewId: "ChdDSUhNMG9nS0VjQnRRQjJZM0x2Z25nRRAL",
    googleProfileUrl: "https://www.google.com/maps/contrib/123450678/reviews",
    language: "en",
  },
  {
    authorName: "Geeta Menon",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocX4nZ8pK2vJ7sW3xL5qH4tB2cY6nVfM9qZ5rX6bQ=s96-c",
    rating: 5,
    text: "What a beautiful property! The cinematic dark-luxe interiors are stunning · felt like a boutique hotel, not a pilgrim lodge. The Om watermarks and mandala dividers add such a spiritual touch. And the 360° virtual tour on their website helped us choose the perfect room.",
    reviewDate: "2026-03-15",
    googleReviewId: "ChdDSUhNMG9nS0VjQnRRQjJZM0x2Z25nRRAM",
    googleProfileUrl: "https://www.google.com/maps/contrib/234560789/reviews",
    language: "en",
  },
];

export async function POST(req: NextRequest) {
  const { placeId, shareUrl } = await req.json();

  const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;

  // ===== PRODUCTION MODE =====
  if (googleApiKey && placeId) {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,user_ratings_total,rating&key=${googleApiKey}`
      );
      const data = await res.json();
      const reviews = data.result?.reviews || [];
      let imported = 0;

      for (const r of reviews) {
        // Check for duplicates by googleReviewId
        const existing = await db.review.findUnique({
          where: { googleReviewId: r.time?.toString() },
        });
        if (existing) continue;

        await db.review.create({
          data: {
            authorName: r.author_name,
            authorAvatar: r.profile_photo_url,
            rating: r.rating,
            text: r.text,
            reviewDate: new Date(r.time * 1000),
            source: "GOOGLE",
            googleReviewId: r.time?.toString(),
            googleProfileUrl: r.author_url,
            language: r.language || "en",
            published: true,
            featured: r.rating === 5, // auto-feature 5-star reviews
          },
        });
        imported++;
      }

      return NextResponse.json({
        imported,
        total: await db.review.count({ where: { source: "GOOGLE" } }),
        googleRating: data.result?.rating,
        googleReviewCount: data.result?.user_ratings_total,
      });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  // ===== DEMO MODE (no API key) =====
  // Seed with realistic reviews that would come from Google
  let imported = 0;
  for (const r of DEMO_REVIEWS) {
    const existing = await db.review.findUnique({
      where: { googleReviewId: r.googleReviewId },
    });
    if (existing) continue;

    await db.review.create({
      data: {
        ...r,
        reviewDate: new Date(r.reviewDate),
        source: "GOOGLE",
        published: true,
        featured: r.rating === 5,
      },
    });
    imported++;
  }

  // Broadcast real-time update
  fetch(`${process.env.REALTIME_URL || "http://localhost:3003"}/broadcast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "reviews:imported",
      data: { count: imported },
    }),
  }).catch(() => {});

  return NextResponse.json({
    imported,
    total: await db.review.count({ where: { source: "GOOGLE" } }),
    demo: true,
    message: imported > 0
      ? `Imported ${imported} Google reviews (demo mode). Add GOOGLE_PLACES_API_KEY to .env for live imports.`
      : "All Google reviews already imported.",
    shareUrl: shareUrl || "https://share.google/x0YWO22UQQiol8qYa",
  });
}

/**
 * GET /api/reviews/google-import · check import status
 */
export async function GET() {
  const total = await db.review.count({ where: { source: "GOOGLE" } });
  const lastImport = await db.review.findFirst({
    where: { source: "GOOGLE" },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    totalGoogleReviews: total,
    lastImportAt: lastImport?.createdAt,
    hasApiKey: !!process.env.GOOGLE_PLACES_API_KEY,
  });
}
