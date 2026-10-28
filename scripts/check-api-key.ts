async function main() {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    const row = await prisma.setting.findUnique({ where: { key: "GOOGLE_PLACES_API_KEY" } });
    if (!row) { console.log("Key not found in DB"); return; }
    const key = row.value || "";
    console.log(`Key length: ${key.length}`);
    console.log(`Starts with "AIza": ${key.startsWith("AIza")}`);
    console.log(`First 10 chars: ${key.slice(0, 10)}...`);
    console.log(`Last 4 chars: ...${key.slice(-4)}`);
    console.log(`isSet: ${row.isSet}, isSecret: ${row.isSecret}`);
    
    // Try a simple test call to the Places API
    console.log("\n=== Testing API key with Find Place endpoint ===");
    const testUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=test&inputtype=textquery&fields=place_id&key=${key}`;
    const res = await fetch(testUrl);
    const data = await res.json();
    console.log(`Status: ${data.status}`);
    console.log(`Error: ${data.error_message || "none"}`);
    
    // Also check GOOGLE_PLACE_ID
    const placeIdRow = await prisma.setting.findUnique({ where: { key: "GOOGLE_PLACE_ID" } });
    console.log(`\nGOOGLE_PLACE_ID isSet: ${placeIdRow?.isSet || false}`);
    console.log(`GOOGLE_PLACE_ID value: ${placeIdRow?.value || "(empty)"}`);
  } catch (e) { console.error(e.message); } finally { await prisma.$disconnect(); }
}
main();
