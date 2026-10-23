async function main() {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    const rooms = await prisma.room.findMany({ select: { slug: true, name: true, totalUnits: true, active: true }, orderBy: { price: "asc" } });
    console.log("\n=== Current rooms in DB ===\n");
    for (const r of rooms) console.log(`  ${r.slug.padEnd(35)} | units: ${r.totalUnits} | active: ${r.active} | ${r.name}`);
    console.log(`\nTotal: ${rooms.length} rooms`);
  } catch (e) { console.error(e.message); } finally { await prisma.$disconnect(); }
}
main();
