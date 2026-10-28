import { setSetting, getSetting } from "../src/lib/settings";

/**
 * Uses the NEW Places API (v1) — the legacy API endpoint is deprecated.
 * The new API uses:
 *   - X-Goog-Api-Key header (not ?key= query param)
 *   - X-Goog-FieldMask header to specify which fields to return
 *   - Different field names (displayName, userRatingCount, etc.)
 */
async function main() {
  const apiKey = "AIzaSyDxs-3zBuT-vrN7jhvWU_a89qojU5flh9U";

  // 1. Save the API key
  await setSetting("GOOGLE_PLACES_API_KEY", apiKey, undefined, true, "INTEGRATION", "Google Places API Key (reviews)");
  console.log("✓ Saved GOOGLE_PLACES_API_KEY to DB (encrypted)");

  const savedKey = await getSetting("GOOGLE_PLACES_API_KEY");
  console.log("✓ Verified: starts with 'AIza':", savedKey?.startsWith("AIza"));

  // 2. Get Place ID (already set from earlier fix)
  let placeId = await getSetting("GOOGLE_PLACE_ID");
  console.log("✓ GOOGLE_PLACE_ID:", placeId);

  if (!placeId) {
    // Find Place ID using the new Text Search API
    console.log("\n=== Finding Place ID via Text Search ===");
    const searchUrl = "https://places.googleapis.com/v1/places:searchText";
    const searchRes = await fetch(searchUrl, {
      method: "POST",
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ textQuery: "Guruvayur Dham Mathura" }),
    });
    const searchData = await searchRes.json();

    if (searchData.places && searchData.places.length > 0) {
      console.log("Candidates:");
      for (const p of searchData.places) {
        console.log(`  ${p.displayName?.text} — ${p.formattedAddress}`);
        console.log(`    id: ${p.id} | rating: ${p.rating} | reviews: ${p.userRatingCount}`);
      }
      placeId = searchData.places[0].id;
      await setSetting("GOOGLE_PLACE_ID", placeId!, undefined, false, "INTEGRATION", "Google Place ID");
      console.log(`\n✓ Saved Place ID: ${placeId}`);
    } else {
      console.error("✗ No results:", JSON.stringify(searchData).slice(0, 200));
      process.exit(1);
    }
  }

  // 3. Fetch Place Details using the NEW Places API (v1)
  console.log("\n=== Fetching Place Details (Places API v1) ===");
  const detailsUrl = `https://places.googleapis.com/v1/places/${placeId}`;
  const detailsRes = await fetch(detailsUrl, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "displayName,formattedAddress,rating,userRatingCount,reviews,googleMapsUri,websiteUri",
    },
  });
  const place = await detailsRes.json();

  if (place.error) {
    console.error("✗ Error:", place.error.message || JSON.stringify(place.error));
    process.exit(1);
  }

  console.log(`Place: ${place.displayName?.text || place.name}`);
  console.log(`Address: ${place.formattedAddress}`);
  console.log(`Rating: ${place.rating} ★`);
  console.log(`Total Google reviews: ${place.userRatingCount}`);
  console.log(`Google Maps URL: ${place.googleMapsUri}`);
  const reviews = place.reviews || [];
  console.log(`Reviews returned: ${reviews.length}`);

  // 4. Save reviews to DB
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  let imported = 0;
  let skipped = 0;

  for (const r of reviews) {
    // New API uses publishTime (ISO 8601) as the unique ID
    const googleReviewId = r.publishTime || r.originalText?.text?.slice(0, 50);
    if (!googleReviewId) continue;

    const existing = await prisma.review.findUnique({ where: { googleReviewId: String(googleReviewId) } });
    if (existing) { skipped++; continue; }

    const authorName = r.authorAttribution?.displayName || "Anonymous";
    const authorAvatar = r.authorAttribution?.photoUri || "";
    const authorUrl = r.authorAttribution?.uri || "";
    const reviewText = r.originalText?.text || r.text?.text || "";
    const rating = r.rating || 5;
    const reviewDate = r.publishTime ? new Date(r.publishTime) : new Date();
    const language = r.originalText?.languageCode || "en";

    await prisma.review.create({
      data: {
        authorName,
        authorAvatar,
        rating,
        text: reviewText,
        reviewDate,
        source: "GOOGLE",
        googleReviewId: String(googleReviewId),
        googleProfileUrl: authorUrl,
        language,
        published: true,
        featured: rating === 5,
      },
    });
    imported++;
    console.log(`  ✓ ${authorName} — ${rating}★ — "${reviewText.slice(0, 70)}..."`);
  }

  console.log(`\n✓ Imported ${imported} new reviews (skipped ${skipped} duplicates)`);

  // 5. Save Google Maps URL
  if (place.googleMapsUri) {
    await setSetting("GOOGLE_BUSINESS_PROFILE_URL", place.googleMapsUri, undefined, false, "INTEGRATION", "Google Business Profile URL");
    console.log("✓ Saved GOOGLE_BUSINESS_PROFILE_URL");
  }

  // 6. Summary
  const totalReviews = await prisma.review.count({ where: { source: "GOOGLE" } });
  console.log(`\n=== Summary ===`);
  console.log(`Total Google reviews in DB: ${totalReviews}`);
  console.log(`Live Google rating: ${place.rating} ★`);
  console.log(`Live Google review count: ${place.userRatingCount}`);
  await prisma.$disconnect();
  process.exit(0);
}

main();
