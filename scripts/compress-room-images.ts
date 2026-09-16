import sharp from "sharp";
import { readdir, stat } from "fs/promises";
import { join } from "path";

const UPLOAD_DIR = join(process.cwd(), "upload");
const OUTPUT_DIR = join(process.cwd(), "public", "rooms");

// Room image assignments (order matters)
const ROOM_ASSIGNMENTS: Record<string, { main: string; gallery: string[] }> = {
  "deluxe-room": { main: "IMG_1085.jpg.jpeg", gallery: ["IMG_1093.jpg.jpeg"] },
  "super-deluxe-room": { main: "IMG_1099.jpg.jpeg", gallery: ["IMG_1147.jpg.jpeg"] },
  "superior-room": { main: "IMG_1112.jpg.jpeg", gallery: ["IMG_1125.jpg.jpeg"] },
  "gvd-suite": { main: "IMG_1136.jpg.jpeg", gallery: ["IMG_1149.jpg.jpeg", "IMG_1115.jpg.jpeg"] },
};

async function compressImage(inputPath: string, outputName: string): Promise<string> {
  const outputPath = join(OUTPUT_DIR, outputName);
  await sharp(inputPath)
    .resize(1920, 1280, { fit: "cover", position: "center" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(outputPath);
  const s = await stat(outputPath);
  console.log(`  ✓ ${outputName} (${Math.round(s.size / 1024)}KB)`);
  return `/rooms/${outputName}`;
}

async function main() {
  console.log("Compressing room images...\n");
  const results: Record<string, { main: string; gallery: string[] }> = {};

  for (const [roomSlug, assignment] of Object.entries(ROOM_ASSIGNMENTS)) {
    console.log(`Processing ${roomSlug}:`);
    
    // Compress main image
    const mainInput = join(UPLOAD_DIR, assignment.main);
    const mainName = `${roomSlug}-main.jpg`;
    const mainUrl = await compressImage(mainInput, mainName);
    
    // Compress gallery images
    const galleryUrls: string[] = [];
    for (let i = 0; i < assignment.gallery.length; i++) {
      const galleryInput = join(UPLOAD_DIR, assignment.gallery[i]);
      const galleryName = `${roomSlug}-${i + 1}.jpg`;
      const galleryUrl = await compressImage(galleryInput, galleryName);
      galleryUrls.push(galleryUrl);
    }
    
    results[roomSlug] = { main: mainUrl, gallery: galleryUrls };
  }

  console.log("\n✅ All images compressed and saved to public/rooms/");
  console.log("\nImage assignments for site-data.ts:");
  for (const [slug, urls] of Object.entries(results)) {
    console.log(`  ${slug}:`);
    console.log(`    image: "${urls.main}",`);
    console.log(`    gallery: [${urls.gallery.map(u => `"${u}"`).join(", ")}],`);
  }
}

main().catch(console.error);
