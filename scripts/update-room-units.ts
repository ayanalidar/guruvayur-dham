async function main() {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    const updates = [
      { slug: "deluxe-room",                totalUnits: 1, label: "FAMILY ROOM (Family Suit / Quad)" },
      { slug: "super-deluxe-room",           totalUnits: 5, label: "KING DELUXE ROOM" },
      { slug: "superior-room",              totalUnits: 5, label: "PREMIUM BED ROOM (Premium Double Bed)" },
      { slug: "gvd-suite",                  totalUnits: 1, label: "PREVILEGE SUIT ROOM (Privilege Suite)" },
      { slug: "family-comfort-triple-room", totalUnits: 3, label: "FAMILY COMFORT TRIPLE ROOM" },
    ];
    console.log("\n=== Updating room units ===\n");
    for (const u of updates) {
      const updated = await prisma.room.update({
        where: { slug: u.slug },
        data: { totalUnits: u.totalUnits },
        select: { slug: true, name: true, totalUnits: true },
      });
      console.log(`  ✓ ${u.label}`);
      console.log(`    slug: ${updated.slug} | name: ${updated.name} | units: ${updated.totalUnits}`);
    }
    console.log("\n✓ All 5 rooms updated.");
    // Verify
    const rooms = await prisma.room.findMany({ select: { slug: true, name: true, totalUnits: true }, orderBy: { price: "asc" } });
    console.log("\n=== Verification ===\n");
    for (const r of rooms) console.log(`  ${r.slug.padEnd(35)} | units: ${r.totalUnits} | ${r.name}`);
    const totalUnits = rooms.reduce((sum, r) => sum + r.totalUnits, 0);
    console.log(`\nTotal units across all rooms: ${totalUnits}`);
  } catch (e) { console.error(e.message); } finally { await prisma.$disconnect(); }
}
main();
