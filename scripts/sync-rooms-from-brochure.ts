// Sync the 5 brochure rooms from src/lib/site-data.ts into the Neon DB.
// Also renames `family-deluxe-suite` slug → `family-comfort-triple-room` (brochure)
// while preserving any existing data via a 2-step rename.
//
// Run with: DATABASE_URL=... npx tsx scripts/sync-rooms-from-brochure.ts
import { PrismaClient } from "@prisma/client";
import { ROOMS } from "../src/lib/site-data";

const db = new PrismaClient();

async function main() {
  console.log(`Syncing ${ROOMS.length} rooms from site-data.ts → Neon DB`);

  // Step 1: rename family-deluxe-suite → family-comfort-triple-room if it exists
  const existing = await db.room.findUnique({ where: { slug: "family-deluxe-suite" } });
  if (existing) {
    console.log("Renaming family-deluxe-suite → family-comfort-triple-room (preserving ID + bookings)...");
    // PostgreSQL: update the slug. Existing bookings + rate plans will still work
    // because they reference roomId (the ID), not slug.
    await db.room.update({
      where: { id: existing.id },
      data: { slug: "family-comfort-triple-room" },
    });
    console.log("  ✓ Renamed");
  }

  // Step 2: upsert all 5 rooms with brochure data
  const unitCounts: Record<string, number> = {
    "deluxe-room": 1,
    "super-deluxe-room": 5,
    "superior-room": 5,
    "gvd-suite": 1,
    "family-comfort-triple-room": 2,
  };

  for (const r of ROOMS) {
    console.log(`Upserting room: ${r.slug} (${r.name}) — ₹${r.price}/night`);
    await db.room.upsert({
      where: { slug: r.slug },
      create: {
        slug: r.slug,
        name: r.name,
        type: r.type,
        price: r.price,
        originalPrice: r.originalPrice || null,
        capacity: r.capacity,
        size: r.size,
        bedType: r.bedType,
        image: r.image,
        gallery: JSON.stringify(r.gallery),
        badge: r.badge || null,
        description: r.description,
        amenities: JSON.stringify(r.amenities),
        shortDesc: r.shortDesc,
        rating: r.rating,
        reviews: r.reviews,
        totalUnits: unitCounts[r.slug] || 1,
        active: true,
      },
      update: {
        name: r.name,
        type: r.type,
        price: r.price,
        originalPrice: r.originalPrice || null,
        capacity: r.capacity,
        size: r.size,
        bedType: r.bedType,
        image: r.image,
        gallery: JSON.stringify(r.gallery),
        badge: r.badge || null,
        description: r.description,
        amenities: JSON.stringify(r.amenities),
        shortDesc: r.shortDesc,
        rating: r.rating,
        reviews: r.reviews,
        totalUnits: unitCounts[r.slug] || 1,
        active: true,
      },
    });
  }

  // Step 3: verify
  console.log("\n=== Rooms in DB after sync ===");
  const all = await db.room.findMany({
    select: { slug: true, name: true, price: true, capacity: true, totalUnits: true, active: true },
    orderBy: { price: "asc" },
  });
  console.table(all);
}

main()
  .catch(e => { console.error("ERR:", e?.message || e); process.exit(1); })
  .finally(() => db.$disconnect());
