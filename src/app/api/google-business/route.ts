import { NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";
import { SITE } from "@/lib/site-data";

/**
 * GET /api/google-business
 *
 * Returns the LIVE Google Business Profile data for Guruvayur Dham:
 *   - rating (live star rating, e.g. 4.8)
 *   - user_ratings_total (live review count)
 *   - url (link to public Google Business Profile with all reviews)
 *   - name, formatted_address, formatted_phone_number (live)
 *   - opening_hours (live weekday_text array)
 *
 * CACHE STRATEGY:
 * - Google Places Details API calls are paid ($17 per 1000 calls on the
 *   "Place Details (Legacy)" SKU, $17 per 1000 on Find Place too).
 * - We cache the API response for 6 HOURS in a Next.js edge-style in-memory
 *   cache. Google's Terms allow caching up to 30 calendar days, but 6 hours
 *   is a sensible balance between freshness and quota usage.
 * - If GOOGLE_PLACES_API_KEY + GOOGLE_PLACE_ID are NOT configured, falls
 *   back to the static values from SITE config + a helpful message.
 *
 * AUTH: Public (no staff token). The data is shown on the homepage
 * ReviewsWidget, so anyone must be able to fetch it. No PII is exposed.
 */

// ====== In-memory cache (6-hour TTL, Google Places caching TOS compliant) ======
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
type CachedResponse = {
  rating: number;
  user_ratings_total: number;
  url: string;
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  opening_hours?: string[];
  fetched_at: number;
  cached: boolean;
  demo?: boolean;
  error?: string;
  message?: string;
};
const cache = new Map<"live", CachedResponse>();

export const dynamic = "force-dynamic"; // never serve from build-time cache

export async function GET() {
  // Check in-memory cache first
  const cached = cache.get("live");
  if (cached && Date.now() - cached.fetched_at < CACHE_TTL_MS) {
    return NextResponse.json({ ...cached, cached: true });
  }

  const apiKey = await getSetting("GOOGLE_PLACES_API_KEY");
  const placeId = await getSetting("GOOGLE_PLACE_ID");
  const profileUrlSetting = await getSetting("GOOGLE_BUSINESS_PROFILE_URL");
  const profileUrl = profileUrlSetting || SITE.googleBusinessProfileUrl;

  // ====== DEMO MODE (no API key or no Place ID) ======
  if (!apiKey || !placeId) {
    return NextResponse.json({
      rating: SITE.rating,
      user_ratings_total: SITE.reviewCount,
      url: profileUrl,
      name: SITE.name,
      formatted_address: SITE.address,
      formatted_phone_number: SITE.phones,
      opening_hours: undefined,
      fetched_at: Date.now(),
      cached: false,
      demo: true,
      message:
        "Add GOOGLE_PLACES_API_KEY + GOOGLE_PLACE_ID via /admin/settings → INTEGRATION for live Google rating + reviews.",
    });
  }

  // ====== LIVE MODE (Google Places Details API - New endpoint) ======
  try {
    // Use the new Place Details (New) API - $17 per 1000 calls, allowed
    // 30-day cache (we cache 6h, well within TOS).
    const url =
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}` +
      `?fields=id,displayName,rating,userRatingCount,googleMapsUri,formattedAddress,internationalPhoneNumber,regularOpeningHours` +
      `&key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
      headers: { "X-Goog-Api-Key": apiKey },
      cache: "no-store",
    });

    if (!res.ok) {
      // Google API errored - fall back to static SITE values rather than
      // break the homepage ReviewsWidget.
      const errText = await res.text();
      console.error("[google-business] Google API error:", res.status, errText);
      return NextResponse.json(
        {
          rating: SITE.rating,
          user_ratings_total: SITE.reviewCount,
          url: profileUrl,
          name: SITE.name,
          formatted_address: SITE.address,
          formatted_phone_number: SITE.phones,
          fetched_at: Date.now(),
          cached: false,
          error: `Google API returned ${res.status}`,
        },
        { status: 200 }, // return 200 so widget still renders
      );
    }

    const data = await res.json();

    const live: CachedResponse = {
      rating: typeof data.rating === "number" ? data.rating : SITE.rating,
      user_ratings_total:
        typeof data.userRatingCount === "number"
          ? data.userRatingCount
          : SITE.reviewCount,
      url: data.googleMapsUri || profileUrl,
      name: data.displayName?.text || SITE.name,
      formatted_address: data.formattedAddress,
      formatted_phone_number: data.internationalPhoneNumber,
      opening_hours: data.regularOpeningHours?.weekdayDescriptions,
      fetched_at: Date.now(),
      cached: false,
    };

    // Save to cache
    cache.set("live", live);

    return NextResponse.json(live, {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=21600", // CDN caches 6h, browser 1h
      },
    });
  } catch (e: any) {
    console.error("[google-business] fetch failed:", e?.message || e);
    return NextResponse.json(
      {
        rating: SITE.rating,
        user_ratings_total: SITE.reviewCount,
        url: profileUrl,
        name: SITE.name,
        formatted_address: SITE.address,
        formatted_phone_number: SITE.phones,
        fetched_at: Date.now(),
        cached: false,
        error: "Google fetch failed - using static fallback",
      },
      { status: 200 },
    );
  }
}
