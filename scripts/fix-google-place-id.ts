import { getSetting, setSetting } from "../src/lib/settings";

async function main() {
  const wrongField = await getSetting("GOOGLE_PLACES_API_KEY");
  console.log("Current GOOGLE_PLACES_API_KEY value:", wrongField);
  console.log("Starts with 'ChIJ' (Place ID prefix):", wrongField?.startsWith("ChIJ"));

  if (wrongField && wrongField.startsWith("ChIJ")) {
    // Move it to GOOGLE_PLACE_ID
    await setSetting("GOOGLE_PLACE_ID", wrongField, undefined, false, "INTEGRATION", "Google Place ID (auto-detected)");
    console.log("✓ Moved value to GOOGLE_PLACE_ID");

    // Clear the wrong field
    await setSetting("GOOGLE_PLACES_API_KEY", "", undefined, true, "INTEGRATION", "Google Places API Key (reviews)");
    console.log("✓ Cleared GOOGLE_PLACES_API_KEY (was storing a Place ID by mistake)");

    console.log("\n=== What happened ===");
    console.log("The 'Google Places API Key' field was storing a Google Place ID");
    console.log("(ChIJ...) instead of a Google API key (AIza...).");
    console.log("Moved it to GOOGLE_PLACE_ID (correct field).");
    console.log("\n=== What you need to do ===");
    console.log("1. Go to https://console.cloud.google.com/apis/credentials");
    console.log("2. Create a new API key (starts with 'AIza', e.g., AIzaSyD...)");
    console.log("3. Enable Places API: https://console.cloud.google.com/apis/library/places.googleapis.com");
    console.log("4. Go to /admin/system → INTEGRATION tab");
    console.log("5. Paste the AIza... key into 'Google Places API Key (reviews)'");
    console.log("6. Save → then run scripts/setup-google-reviews.ts again");
  } else {
    console.log("The value doesn't look like a Place ID. Please check manually.");
  }
  process.exit(0);
}

main();
