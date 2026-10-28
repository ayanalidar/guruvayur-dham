const url = process.argv[2];
if (!url) { console.error("Usage: tsx scripts/check-neon.ts <postgres-url>"); process.exit(1); }
async function main() {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const tables: Array<{ table_name: string }> = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    console.log(`\n✓ Connected. ${tables.length} tables in 'public' schema:\n`);
    for (const t of tables) console.log(`  - ${t.table_name}`);
    const hasUpload = tables.some(t => t.table_name === "Upload");
    console.log(`\n${hasUpload ? "✓ Upload table EXISTS" : "✗ Upload table MISSING"}`);
    if (hasUpload) {
      const count: any = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS n FROM "Upload"`);
      console.log(`  Upload rows: ${count[0]?.n ?? "error"}`);
    }
  } catch (e: any) { console.error("✗", e.message); process.exit(1); }
  finally { await prisma.$disconnect(); }
}
main();
