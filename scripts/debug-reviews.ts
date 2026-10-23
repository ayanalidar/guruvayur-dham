import { getSetting } from "../src/lib/settings";

async function main() {
  const apiKey = await getSetting("GOOGLE_PLACES_API_KEY");
  const placeId = await getSetting("GOOGLE_PLACE_ID");
  
  // Try 1: just "reviews" (no sub-fields)
  console.log("=== Try 1: fieldmask = 'reviews' ===");
  const res1 = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: { "X-Goog-Api-Key": apiKey!, "X-Goog-FieldMask": "reviews" },
  });
  const data1 = await res1.json();
  console.log("Response keys:", Object.keys(data1));
  console.log("reviews:", data1.reviews?.length, "items");
  if (data1.reviews?.[0]) console.log("First review:", JSON.stringify(data1.reviews[0]).slice(0, 200));

  // Try 2: wildcard "*" (get ALL fields)
  console.log("\n=== Try 2: fieldmask = '*' (all fields) ===");
  const res2 = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: { "X-Goog-Api-Key": apiKey!, "X-Goog-FieldMask": "*" },
  });
  const data2 = await res2.json();
  console.log("Response keys:", Object.keys(data2));
  console.log("reviews:", data2.reviews?.length, "items");
  
  // Try 3: Check error info
  if (data2.error) {
    console.log("Error:", JSON.stringify(data2.error));
  }
  
  // Try 4: Check if there's a billing-related info field
  console.log("\n=== Response metadata ===");
  console.log("Has reviews field:", "reviews" in data2);
  console.log("Has info field:", "info" in data2);
  if (data2.info) console.log("Info:", JSON.stringify(data2.info));
  
  process.exit(0);
}
main();
