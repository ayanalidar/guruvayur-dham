/**
 * Cleans up duplicate poojas in the DB. For each name that appears more than
 * once, keeps the "best" version (most recently updated, or the one with a
 * Vercel Blob URL if any) and deletes the rest.
 *
 * Usage:
 *   npx tsx scripts/cleanup-dup-poojas.ts "<postgres-url>" [--dry-run]
 *
 * --dry-run: prints what would be deleted without actually deleting.
 */
const url = process.argv[2];
const dryRun = process.argv.includes("--dry-run");
if (!url) { console.error("Usage: tsx scripts/cleanup-dup-poojas.ts <postgres-url> [--dry-run]"); process.exit(1); }

async function main() {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const poojas = await prisma.pooja.findMany({ orderBy: [{ name: "asc" }, { updatedAt: "desc" }] });
    console.log(`\n=== Found ${poojas.length} poojas, scanning for duplicates ===\n`);

    // Group by name
    const byName = new Map<string, typeof poojas>();
    for (const p of poojas) {
      if (!byName.has(p.name)) byName.set(p.name, []);
      byName.get(p.name)!.push(p);
    }

    const toDelete: string[] = [];
    let duplicateGroups = 0;
    for (const [name, group] of byName) {
      if (group.length < 2) continue;
      duplicateGroups++;
      // Sort: keep the one with the most recent updatedAt OR a Blob URL
      const sorted = [...group].sort((a, b) => {
        const aBlob = a.image.includes("blob.vercel-storage.com") ? 1 : 0;
        const bBlob = b.image.includes("blob.vercel-storage.com") ? 1 : 0;
        if (aBlob !== bBlob) return bBlob - aBlob; // Blob URL wins
        return b.updatedAt.getTime() - a.updatedAt.getTime(); // newer wins
      });
      const keep = sorted[0];
      const deletes = sorted.slice(1);
      console.log(`Duplicate "${name}":`);
      console.log(`  KEEP    id=${keep.id} updated=${keep.updatedAt.toISOString()} image=${keep.image.slice(0, 80)}...`);
      for (const d of deletes) {
        console.log(`  DELETE  id=${d.id} updated=${d.updatedAt.toISOString()} image=${d.image.slice(0, 80)}...`);
        toDelete.push(d.id);
      }
      console.log("");
    }

    if (toDelete.length === 0) {
      console.log("✓ No duplicates found. DB is clean.");
      return;
    }

    console.log(`\n=== Summary ===`);
    console.log(`Duplicate groups: ${duplicateGroups}`);
    console.log(`Total to delete: ${toDelete.length}`);
    console.log(`Total to keep:  ${poojas.length - toDelete.length}`);

    if (dryRun) {
      console.log(`\n[--dry-run] No actual deletes performed.`);
      return;
    }

    console.log(`\nDeleting ${toDelete.length} duplicates...`);
    const result = await prisma.pooja.deleteMany({ where: { id: { in: toDelete } } });
    console.log(`✓ Deleted ${result.count} duplicates.`);

    const remaining = await prisma.pooja.count();
    console.log(`✓ ${remaining} poojas remain in DB.`);
  } catch (e: any) {
    console.error("✗", e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
main();
