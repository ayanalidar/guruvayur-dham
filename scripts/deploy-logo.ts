/**
 * Process the bold Om logo: remove black background, enhance, generate all sizes
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const INPUT = "/home/z/my-project/public/logo-variations/om-bold-raw.png";
const OUTPUT_DIR = "/home/z/my-project/public";

async function main() {
  console.log("📖 Reading logo...");
  const imageBuffer = fs.readFileSync(INPUT);

  // Load raw pixels for background removal
  const { data, info } = await sharp(imageBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log(`   Size: ${info.width}x${info.height}, ${info.channels} channels`);

  // Remove black background — make dark pixels transparent
  // Use a lower threshold since the logo is bold gold on pure black
  const THRESHOLD = 30;
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;

    if (brightness < THRESHOLD) {
      // Pure black background → fully transparent
      data[i + 3] = 0;
    } else if (brightness < THRESHOLD + 20) {
      // Edge feathering
      data[i + 3] = Math.round(((brightness - THRESHOLD) / 20) * 255);
    }
  }

  // Enhance: sharpen + boost gold colors
  const enhanced = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: info.channels }
  })
  .sharpen({ sigma: 0.8, m1: 1, m2: 2 })
  .modulate({ brightness: 1.08, saturation: 1.15 })
  .trim()
  .png({ quality: 100, compressionLevel: 9 })
  .toBuffer();

  console.log("✓ Background removed + enhanced");

  // Generate all sizes
  console.log("🔧 Generating sizes...");
  const sizes = [
    { name: "logo.png", size: null },
    { name: "logo-nav.png", size: 48 },
    { name: "logo-footer.png", size: 64 },
    { name: "logo-large.png", size: 200 },
    { name: "favicon-32.png", size: 32 },
    { name: "apple-touch-icon.png", size: 180 },
    { name: "icon-192.png", size: 192 },
    { name: "icon-512.png", size: 512 },
  ];

  for (const { name, size } of sizes) {
    const outputPath = path.join(OUTPUT_DIR, name);
    let pipeline = sharp(enhanced);

    if (size) {
      pipeline = pipeline.resize(size, size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      });
    }

    await pipeline.png({ quality: 100, compressionLevel: 9 }).toFile(outputPath);
    const stat = fs.statSync(outputPath);
    console.log(`   ✓ ${name} (${size || "full"}) · ${(stat.length / 1024).toFixed(1)} KB`);
  }

  // Maskable icon with dark background padding
  await sharp(enhanced)
    .resize(384, 384, { fit: "contain", background: { r: 15, g: 10, b: 8, alpha: 1 } })
    .extend({ top: 64, bottom: 64, left: 64, right: 64, background: { r: 15, g: 10, b: 8, alpha: 1 } })
    .png({ quality: 100 })
    .toFile(path.join(OUTPUT_DIR, "icon-maskable-512.png"));
  console.log("   ✓ icon-maskable-512.png (with safe-zone)");

  console.log("\n✅ New logo deployed!");
}

main().catch(e => { console.error(e); process.exit(1); });
