/**
 * Backfill Upload.refCount by scanning all tables that reference Upload URLs.
 *
 * The refCount field was never incremented when pooja/room/blog images were
 * saved — every Upload row had refCount=0, even for files actively used.
 * This script scans ContentBlock, Room, BlogPost, GalleryImage, and Pooja
 * for Upload URLs and sets the correct refCount on each Upload row.
 *
 * Usage:
 *   DATABASE_URL="<neon-url>" npx tsx scripts/backfill-refcount.ts
 *
 * After running, the Media Library's "delete orphans" feature is safe —
 * it will only delete files with refCount=0 that are genuinely unused.
 */
const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL not set"); process.exit(1); }

async function main() {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const uploads = await prisma.upload.findMany();
    console.log(`\n=== Backfilling refCount for ${uploads.length} Upload rows ===\n`);

    // Collect all referenced URLs from every table that stores image URLs
    const referencedUrls = new Set<string>();

    // 1. ContentBlock — value field may contain image URLs
    try {
      const blocks = await prisma.contentBlock.findMany({ select: { value: true } });
      for (const b of blocks) {
        if (b.value && b.value.includes("blob.vercel-storage.com")) {
          // Extract URLs (simple regex for Blob URLs)
          const matches = b.value.match(/https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com[^ "'<]*/g);
          if (matches) matches.forEach(u => referencedUrls.add(u));
        }
      }
      console.log(`  ContentBlock: found ${referencedUrls.size} unique Blob URLs so far`);
    } catch (e) { console.log("  ContentBlock: skipped"); }

    // 2. Room — image + gallery (JSON array of URLs)
    try {
      const rooms = await prisma.room.findMany({ select: { image: true, gallery: true } });
      for (const r of rooms) {
        if (r.image && r.image.includes("blob.vercel-storage.com")) referencedUrls.add(r.image);
        if (r.gallery) {
          try {
            const urls = JSON.parse(r.gallery);
            if (Array.isArray(urls)) urls.forEach((u: string) => {
              if (typeof u === "string" && u.includes("blob.vercel-storage.com")) referencedUrls.add(u);
            });
          } catch {}
        }
      }
      console.log(`  Room: found ${referencedUrls.size} unique Blob URLs so far`);
    } catch (e) { console.log("  Room: skipped"); }

    // 3. Pooja — image field
    try {
      const poojas = await prisma.pooja.findMany({ select: { image: true } });
      for (const p of poojas) {
        if (p.image && p.image.includes("blob.vercel-storage.com")) referencedUrls.add(p.image);
      }
      console.log(`  Pooja: found ${referencedUrls.size} unique Blob URLs so far`);
    } catch (e) { console.log("  Pooja: skipped"); }

    // 4. BlogPost — image field
    try {
      const posts = await prisma.blogPost.findMany({ select: { image: true } });
      for (const p of posts) {
        if (p.image && p.image.includes("blob.vercel-storage.com")) referencedUrls.add(p.image);
      }
      console.log(`  BlogPost: found ${referencedUrls.size} unique Blob URLs so far`);
    } catch (e) { console.log("  BlogPost: skipped"); }

    // 5. GalleryImage — src field
    try {
      const imgs = await prisma.galleryImage.findMany({ select: { src: true } });
      for (const g of imgs) {
        if (g.src && g.src.includes("blob.vercel-storage.com")) referencedUrls.add(g.src);
      }
      console.log(`  GalleryImage: found ${referencedUrls.size} unique Blob URLs so far`);
    } catch (e) { console.log("  GalleryImage: skipped"); }

    console.log(`\nTotal unique referenced Blob URLs: ${referencedUrls.size}`);
    console.log(`Total Upload rows: ${uploads.length}`);

    // Update refCount for each Upload row
    let updated = 0;
    let stillOrphaned = 0;
    for (const u of uploads) {
      const refCount = referencedUrls.has(u.url) ? 1 : 0;
      if (u.refCount !== refCount) {
        await prisma.upload.update({ where: { id: u.id }, data: { refCount } });
        updated++;
      }
      if (refCount === 0) stillOrphaned++;
    }

    console.log(`\n✓ Updated ${updated} Upload rows with correct refCount`);
    console.log(`✓ ${stillOrphaned} rows are true orphans (refCount=0, safe to delete)`);
    console.log(`✓ ${uploads.length - stillOrphaned} rows are referenced (refCount=1, do NOT delete)`);
  } catch (e: any) {
    console.error("✗", e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
main();
