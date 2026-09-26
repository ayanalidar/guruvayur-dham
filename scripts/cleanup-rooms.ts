// Clean up the 15 garbage rooms (keep only the 4 real ones + their bookings).
// Run with: DATABASE_URL=... npx tsx scripts/cleanup-rooms.ts
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const REAL_SLUGS = ["deluxe-room", "super-deluxe-room", "superior-room", "gvd-suite", "family-deluxe-suite"];

  console.log("=== Rooms BEFORE cleanup ===");
  const allBefore = await db.room.findMany({ select: { slug: true, name: true, price: true, totalUnits: true, active: true } });
  console.log("Count:", allBefore.length);

  const garbage = await db.room.findMany({
    where: { slug: { notIn: REAL_SLUGS } },
    select: { id: true, slug: true, name: true, _count: { select: { bookings: true } } },
  });
  console.log("\nGarbage rooms to delete:");
  console.table(garbage.map(g => ({ slug: g.slug, name: g.name, bookingCount: g._count.bookings })));

  // For garbage rooms with no bookings → safe to delete directly
  const safeToDelete = garbage.filter(g => g._count.bookings === 0);
  // For garbage rooms WITH bookings → delete bookings first (they're demo bookings anyway)
  const withBookings = garbage.filter(g => g._count.bookings > 0);

  console.log(`\nSafe to delete (no bookings): ${safeToDelete.length}`);
  console.log(`Have bookings (will cascade): ${withBookings.length}`);

  // Delete demo bookings on garbage rooms first
  for (const g of withBookings) {
    const r = await db.booking.deleteMany({ where: { roomId: g.id } });
    console.log(`  Deleted ${r.count} bookings from room ${g.slug}`);
  }

  // Also delete RatePlan, Availability, MaintenanceBlock, SyncLog references
  const garbageIds = garbage.map(g => g.id);
  const rp = await db.ratePlan.deleteMany({ where: { roomId: { in: garbageIds } } });
  console.log(`  Deleted ${rp.count} rate plans`);
  const av = await db.availability.deleteMany({ where: { roomId: { in: garbageIds } } }).catch(() => ({ count: 0 }));
  console.log(`  Deleted ${av.count} availability rows`);
  const mb = await db.maintenanceBlock.deleteMany({ where: { roomId: { in: garbageIds } } }).catch(() => ({ count: 0 }));
  console.log(`  Deleted ${mb.count} maintenance blocks`);
  // SyncLog references bookings — already cascaded when bookings deleted, but just in case
  const sl = await db.syncLog.deleteMany({ where: { bookingId: { in: garbageIds } } }).catch(() => ({ count: 0 }));
  console.log(`  Deleted ${sl.count} sync logs`);

  // Now delete the garbage rooms
  const del = await db.room.deleteMany({
    where: { slug: { notIn: REAL_SLUGS } },
  });
  console.log(`\nDeleted ${del.count} garbage rooms.`);

  console.log("\n=== Rooms AFTER cleanup ===");
  const allAfter = await db.room.findMany({ select: { slug: true, name: true, price: true, totalUnits: true, active: true } });
  console.log("Count:", allAfter.length);
  console.table(allAfter);
}

main()
  .catch(e => { console.error("ERR:", e?.message || e); process.exit(1); })
  .finally(() => db.$disconnect());
