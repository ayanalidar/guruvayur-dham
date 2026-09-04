/**
 * Process the uploaded logo using Sharp (no AI needed):
 * 1. Remove background (flood-fill from edges, make similar pixels transparent)
 * 2. Enhance (sharpen, modulate colors, increase contrast)
 * 3. Generate all sizes for the website
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const INPUT = "/home/z/my-project/upload/Gemini_Generated_Image_eove9oeove9oeove.png";
const OUTPUT_DIR = "/home/z/my-project/public";

async function main() {
  console.log("📖 Reading original image...");
  const imageBuffer = fs.readFileSync(INPUT);
  const metadata = await sharp(imageBuffer).metadata();
  console.log(`   Original: ${metadata.width}x${metadata.height}, ${metadata.channels} channels`);

  // ===== Step 1: Remove background =====
  // Strategy: Load as raw pixels, detect background color from corners,
  // make all pixels within a threshold of that color transparent.
  console.log("🎨 Removing background...");

  // First, let's get the corner pixel colors (likely background)
  const { data, info } = await sharp(imageBuffer)
    .ensureAlpha()
    .resize(100, null, { fit: "inside" }) // small version for sampling
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const channels = info.channels;

  // Sample corner pixels to determine background color
  const corners = [
    [0, 0],                    // top-left
    [w - 1, 0],                // top-right
    [0, h - 1],                // bottom-left
    [w - 1, h - 1],            // bottom-right
    [Math.floor(w / 2), 0],    // top-center
    [0, Math.floor(h / 2)],    // left-center
  ];

  let bgR = 0, bgG = 0, bgB = 0;
  for (const [x, y] of corners) {
    const idx = (y * w + x) * channels;
    bgR += data[idx];
    bgG += data[idx + 1];
    bgB += data[idx + 2];
  }
  bgR = Math.round(bgR / corners.length);
  bgG = Math.round(bgG / corners.length);
  bgB = Math.round(bgB / corners.length);

  console.log(`   Detected background: rgb(${bgR}, ${bgG}, ${bgB})`);

  // Threshold for background removal (higher = more aggressive)
  const THRESHOLD = 40;

  // Now process the full-size image
  const fullRaw = await sharp(imageBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const fData = fullRaw.data;
  const fW = fullRaw.info.width;
  const fH = fullRaw.info.height;
  const fCh = fullRaw.info.channels;

  // Remove background: make pixels close to bg color transparent
  for (let i = 0; i < fData.length; i += fCh) {
    const r = fData[i];
    const g = fData[i + 1];
    const b = fData[i + 2];
    const dist = Math.sqrt(
      Math.pow(r - bgR, 2) +
      Math.pow(g - bgG, 2) +
      Math.pow(b - bgB, 2)
    );

    if (dist < THRESHOLD) {
      // Background pixel - make fully transparent
      fData[i + 3] = 0;
    } else if (dist < THRESHOLD + 20) {
      // Edge pixel - semi-transparent (feather edges)
      fData[i + 3] = Math.round(((dist - THRESHOLD) / 20) * 255);
    }
  }

  // Create sharp instance from modified raw data
  const transparentBuffer = await sharp(fData, {
    raw: {
      width: fW,
      height: fH,
      channels: fCh,
    }
  })
  // ===== Step 2: Enhance =====
  .sharpen({ sigma: 1.2, m1: 1, m2: 2 })
  .modulate({ brightness: 1.05, saturation: 1.15 })
  .linear(1.1, -10) // increase contrast slightly
  .png({ quality: 100, compressionLevel: 9 })
  .toBuffer();

  console.log("✓ Background removed + enhanced");

  // ===== Step 3: Trim and generate all sizes =====
  console.log("🔧 Generating all sizes...");

  const sizes = [
    { name: "logo.png", size: null, desc: "Main (full size, trimmed)" },
    { name: "logo-nav.png", size: 48, desc: "Navbar 48px" },
    { name: "logo-footer.png", size: 64, desc: "Footer 64px" },
    { name: "logo-large.png", size: 200, desc: "Login page 200px" },
    { name: "favicon-32.png", size: 32, desc: "Favicon 32px" },
    { name: "apple-touch-icon.png", size: 180, desc: "Apple touch 180px" },
    { name: "icon-192.png", size: 192, desc: "PWA 192px" },
    { name: "icon-512.png", size: 512, desc: "PWA 512px" },
    { name: "icon-maskable-512.png", size: 512, desc: "PWA maskable 512px" },
  ];

  for (const { name, size, desc } of sizes) {
    const outputPath = path.join(OUTPUT_DIR, name);
    let pipeline = sharp(transparentBuffer).trim();

    if (size) {
      pipeline = pipeline.resize(size, size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      });
    }

    await pipeline
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(outputPath);

    const stat = fs.statSync(outputPath);
    console.log(`   ✓ ${name} (${desc}) · ${(stat.length / 1024).toFixed(1)} KB`);
  }

  // Also create a maskable version with padding
  await sharp(transparentBuffer)
    .trim()
    .resize(384, 384, { fit: "contain", background: { r: 15, g: 10, b: 8, alpha: 1 } })
    .extend({
      top: 64, bottom: 64, left: 64, right: 64,
      background: { r: 15, g: 10, b: 8, alpha: 1 },
    })
    .png({ quality: 100 })
    .toFile(path.join(OUTPUT_DIR, "icon-maskable-512.png"));
  console.log("   ✓ icon-maskable-512.png (with safe-zone padding)");

  console.log("\n✅ Logo processing complete!");
  console.log("📁 All files saved to /public/");
}

main().catch(e => { console.error("Error:", e); process.exit(1); });
