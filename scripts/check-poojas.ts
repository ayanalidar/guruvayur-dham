const url = process.argv[2];
if (!url) { console.error("Usage: tsx scripts/check-poojas.ts <postgres-url>"); process.exit(1); }
async function main() {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const poojas = await prisma.pooja.findMany({ orderBy: { sortOrder: "asc" } });
    console.log(`\n=== ${poojas.length} poojas in DB ===\n`);
    for (const p of poojas) {
      console.log(`  [${p.sortOrder}] ${p.name}`);
      console.log(`      image: ${p.image}`);
      console.log(`      active: ${p.active} · updatedAt: ${p.updatedAt.toISOString()}`);
    }
  } catch (e: any) { console.error("✗", e.message); process.exit(1); }
  finally { await prisma.$disconnect(); }
}
main();
