import sharp from "sharp";
import { stat } from "fs/promises";
import { join } from "path";
import { execSync } from "child_process";

const UPLOAD_DIR = join(process.cwd(), "upload");
const OUTPUT_DIR = join(process.cwd(), "public", "rooms");

// All 18 photos assigned to 4 room types
// GVD SUITE.jpeg is used as the GVD Suite main image (user specifically requested)
const ROOM_ASSIGNMENTS: Record<string, { files: string[] }> = {
  "deluxe-room": {
    files: ["IMG_1085.jpg.jpeg", "IMG_1093.jpg.jpeg", "IMG_1092.jpg.jpeg", "IMG_1119.jpg.jpeg"],
  },
  "super-deluxe-room": {
    files: ["IMG_1099.jpg.jpeg", "IMG_1147.jpg.jpeg", "IMG_1086.jpg.jpeg", "IMG_1128.jpg.jpeg"],
  },
  "superior-room": {
    files: ["IMG_1112.jpg.jpeg", "IMG_1125.jpg.jpeg", "IMG_1110.jpg.jpeg", "IMG_1090.jpg.jpeg"],
  },
  "gvd-suite": {
    files: ["GVD SUITE.jpeg", "IMG_1136.jpg.jpeg", "IMG_1149.jpg.jpeg", "IMG_1115.jpg.jpeg", "IMG_1114.jpg.jpeg", "IMG_1089.jpg.jpeg"],
  },
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
  // Clean old room images
  execSync(`rm -f ${OUTPUT_DIR}/*.jpg`);
  console.log("Cleaned old room images.\n");

  console.log("Compressing all room images...\n");
  const results: Record<string, string[]> = {};

  for (const [roomSlug, assignment] of Object.entries(ROOM_ASSIGNMENTS)) {
    console.log(`Processing ${roomSlug} (${assignment.files.length} photos):`);
    const urls: string[] = [];
    for (let i = 0; i < assignment.files.length; i++) {
      const inputFile = assignment.files[i];
      const inputPath = join(UPLOAD_DIR, inputFile);
      const outputName = i === 0 ? `${roomSlug}-main.jpg` : `${roomSlug}-${i}.jpg`;
      const url = await compressImage(inputPath, outputName);
      urls.push(url);
    }
    results[roomSlug] = urls;
    console.log("");
  }

  const totalSize = execSync(`du -sh ${OUTPUT_DIR}`).toString().trim();
  console.log(`✅ All ${Object.values(ROOM_ASSIGNMENTS).reduce((s, a) => s + a.files.length, 0)} images compressed. Total: ${totalSize}`);

  console.log("\n--- ROOMS array for site-data.ts ---");
  for (const [slug, urls] of Object.entries(results)) {
    console.log(`  ${slug}:`);
    console.log(`    image: "${urls[0]}",`);
    console.log(`    gallery: [${urls.map(u => `"${u}"`).join(", ")}],`);
  }
}

main().catch(console.error);
