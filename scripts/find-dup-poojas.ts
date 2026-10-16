const url = process.argv[2];
async function main() {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const poojas = await prisma.pooja.findMany({ orderBy: [{ name: "asc" }, { createdAt: "asc" }] });
    console.log(`\n=== ${poojas.length} total poojas in DB ===\n`);
    // Group by name
    const byName = new Map<string, typeof poojas>();
    for (const p of poojas) {
      if (!byName.has(p.name)) byName.set(p.name, []);
      byName.get(p.name)!.push(p);
    }
    console.log("DUPLICATES (same name appears more than once):\n");
    for (const [name, group] of byName) {
      if (group.length > 1) {
        console.log(`  "${name}" appears ${group.length} times:`);
        for (const p of group) {
          console.log(`    id: ${p.id}`);
          console.log(`      created: ${p.createdAt.toISOString()}`);
          console.log(`      updated: ${p.updatedAt.toISOString()}`);
          console.log(`      image:   ${p.image}`);
          console.log(`      active:  ${p.active}`);
          console.log("");
        }
      }
    }
    console.log(`\nSummary: ${poojas.length} poojas, ${byName.size} unique names, ${poojas.length - byName.size} duplicates`);
  } catch (e: any) { console.error("✗", e.message); process.exit(1); }
  finally { await prisma.$disconnect(); }
}
main();
