/**
 * Uses getSetting() from settings.ts which handles decryption of secret values.
 * 1. Gets GOOGLE_PLACES_API_KEY (decrypted)
 * 2. Finds the Google Place ID for "Guruvayur Dham Mathura"
 * 3. Saves GOOGLE_PLACE_ID to DB
 * 4. Fetches the 5 most recent Google reviews + saves to Review table
 */
import { getSetting, setSetting } from "../src/lib/settings";

async function main() {
  // 1. Get decrypted API key
  const apiKey = await getSetting("GOOGLE_PLACES_API_KEY");
  if (!apiKey) {
    console.error("✗ GOOGLE_PLACES_API_KEY is not set in the DB.");
    console.error("  Set it via /admin/system → INTEGRATION → 'Google Places API Key (reviews)'");
    process.exit(1);
  }
  console.log("✓ GOOGLE_PLACES_API_KEY found (decrypted, length:", apiKey.length, "chars)");
  console.log("  Starts with 'AIza':", apiKey.startsWith("AIza"));
  console.log("  First 10 chars:", apiKey.slice(0, 10) + "...");

  // 2. Check if GOOGLE_PLACE_ID is already set
  let placeId = await getSetting("GOOGLE_PLACE_ID");

  if (!placeId) {
    console.log("\n=== Finding Google Place ID ===\n");
    const query = "Guruvayur Dham Mathura";
    const findUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,formatted_address,rating,user_ratings_total&key=${apiKey}`;
    console.log("Searching Google Places for:", query);
    const findRes = await fetch(findUrl);
    const findData = await findRes.json();

    if (findData.status === "REQUEST_DENIED") {
      console.error("\n✗ Google API key is INVALID or Places API is not enabled.");
      console.error("  Error:", findData.error_message);
      console.error("\n  To fix:");
      console.error("  1. Go to https://console.cloud.google.com/apis/credentials");
      console.error("  2. Check if the API key starts with 'AIza' (yours starts with:", apiKey.slice(0, 6), ")");
      console.error("  3. Make sure 'Places API' is ENABLED for this key:");
      console.error("     https://console.cloud.google.com/apis/library/places.googleapis.com");
      console.error("  4. If the key is wrong, update it via:");
      console.error("     /admin/system → INTEGRATION → 'Google Places API Key (reviews)'");
      process.exit(1);
    }

    if (findData.candidates && findData.candidates.length > 0) {
      console.log("\nCandidates found:");
      for (const c of findData.candidates) {
        console.log(`  ${c.name} — ${c.formatted_address}`);
        console.log(`    place_id: ${c.place_id}`);
        console.log(`    rating: ${c.rating} ★ | reviews: ${c.user_ratings_total}`);
      }
      placeId = findData.candidates[0].place_id;
      console.log(`\n✓ Selected Place ID: ${placeId}`);
      // Save to DB (not secret)
      await setSetting("GOOGLE_PLACE_ID", placeId, undefined, false, "INTEGRATION", "Google Place ID");
      console.log("✓ Saved GOOGLE_PLACE_ID to DB");
    } else {
      console.error("✗ No Place candidates found for 'Guruvayur Dham Mathura'");
      process.exit(1);
    }
  } else {
    console.log("✓ GOOGLE_PLACE_ID already set:", placeId);
  }

  // 3. Fetch Place Details (reviews + rating + count)
  console.log("\n=== Fetching Place Details ===\n");
  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews,formatted_address,formatted_phone_number,url,website&key=${apiKey}`;
  const detailsRes = await fetch(detailsUrl);
  const detailsData = await detailsRes.json();

  if (detailsData.status !== "OK" && !detailsData.result) {
    console.error("✗ Place Details API error:", detailsData.status, detailsData.error_message || "");
    process.exit(1);
  }

  const place = detailsData.result;
  console.log(`Place: ${place.name}`);
  console.log(`Address: ${place.formatted_address}`);
  console.log(`Rating: ${place.rating} ★`);
  console.log(`Total Google reviews: ${place.user_ratings_total}`);
  console.log(`Google Maps URL: ${place.url}`);
  const reviews = place.reviews || [];
  console.log(`Reviews returned: ${reviews.length} (Google API returns max 5 most recent)`);

  // 4. Save reviews to DB
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  let imported = 0;
  let skipped = 0;
  for (const r of reviews) {
    const googleReviewId = r.time?.toString();
    if (!googleReviewId) continue;
    const existing = await prisma.review.findUnique({ where: { googleReviewId } });
    if (existing) { skipped++; continue; }
    await prisma.review.create({
      data: {
        authorName: r.author_name,
        authorAvatar: r.profile_photo_url,
        rating: r.rating,
        text: r.text,
        reviewDate: new Date(r.time * 1000),
        source: "GOOGLE",
        googleReviewId,
        googleProfileUrl: r.author_url,
        language: r.language || "en",
        published: true,
        featured: r.rating === 5,
      },
    });
    imported++;
  }
  console.log(`\n✓ Imported ${imported} new reviews (skipped ${skipped} duplicates)`);

  // 5. Save Google Maps URL as GOOGLE_BUSINESS_PROFILE_URL
  if (place.url) {
    await setSetting("GOOGLE_BUSINESS_PROFILE_URL", place.url, undefined, false, "INTEGRATION", "Google Business Profile URL");
    console.log("✓ Saved GOOGLE_BUSINESS_PROFILE_URL to DB");
  }

  // 6. Summary
  const totalReviews = await prisma.review.count({ where: { source: "GOOGLE" } });
  console.log(`\n=== Summary ===`);
  console.log(`Total Google reviews in DB: ${totalReviews}`);
  console.log(`Live Google rating: ${place.rating} ★`);
  console.log(`Live Google review count: ${place.user_ratings_total}`);
  await prisma.$disconnect();
}
main();
