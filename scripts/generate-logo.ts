/**
 * Generate a stunning logo for Guruvayur Dham
 * Creates 3 variations — pick the best one
 * All on pure black background for easy transparency removal
 */
import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";
import sharp from "sharp";

const OUTPUT_DIR = "/home/z/my-project/public/logo-variations";

const PROMPTS = [
  {
    name: "mandala-gold",
    prompt: "Luxurious minimalist logo for a temple hotel called 'Guruvayur Dham'. A stylized geometric mandala lotus symbol in shimmering gold gradient (#D4AF37 to #E8D9B8) on pure solid black background. The mandala has 8 symmetrical petals forming a circular emblem with a subtle glowing diya flame at center. Clean vector-style lines, premium boutique hotel branding, ultra high quality, professional logo design, no text, just the symbol, centered, lots of negative space around it.",
  },
  {
    name: "temple-arch",
    prompt: "Elegant premium logo symbol for a pilgrim hotel. A stylized temple gopuram (tower) silhouette in metallic gold (#D4AF37) and warm champagne (#D4C4A8) gradient on pure solid black background. The tower is minimalist with clean geometric lines, symmetric, with a small flame or diya at the top. Modern luxury branding, vector art style, high contrast, ultra sharp, professional logo, no text, just the icon, centered with generous padding.",
  },
  {
    name: "om-luxe",
    prompt: "Sophisticated spiritual logo for a luxury temple stay. A beautifully stylized 'Om' (ॐ) symbol rendered in flowing gold gradient (#D4AF37, #E8D9B8, #B8860B) with elegant calligraphic curves, on pure solid black background. The Om has a subtle inner glow effect, premium gold leaf texture, modern minimalist design, ultra high quality, professional branding, centered, generous negative space, no text other than the Om symbol itself.",
  },
];

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const zai = await ZAI.create();

  for (const { name, prompt } of PROMPTS) {
    console.log(`🎨 Generating: ${name}...`);
    try {
      const response = await zai.images.generations.create({
        prompt,
        size: "1024x1024",
      });

      const imageBase64 = response.data[0].base64;
      const buffer = Buffer.from(imageBase64, "base64");
      const rawPath = `${OUTPUT_DIR}/${name}-raw.png`;
      fs.writeFileSync(rawPath, buffer);
      console.log(`  ✓ Raw saved: ${rawPath} (${(buffer.length / 1024).toFixed(0)} KB)`);

      // Process: remove black background, enhance, trim
      const { data, info } = await sharp(buffer)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Remove near-black pixels (background)
      const THRESHOLD = 25;
      for (let i = 0; i < data.length; i += info.channels) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;
        if (brightness < THRESHOLD) {
          data[i + 3] = 0; // transparent
        } else if (brightness < THRESHOLD + 15) {
          // Feather edge
          data[i + 3] = Math.round(((brightness - THRESHOLD) / 15) * 255);
        }
      }

      const processed = await sharp(data, {
        raw: { width: info.width, height: info.height, channels: info.channels }
      })
      .sharpen({ sigma: 1, m1: 1, m2: 2 })
      .modulate({ brightness: 1.1, saturation: 1.2 })
      .trim()
      .png({ quality: 100, compressionLevel: 9 })
      .toBuffer();

      const processedPath = `${OUTPUT_DIR}/${name}.png`;
      fs.writeFileSync(processedPath, processed);
      console.log(`  ✓ Transparent: ${processedPath} (${(processed.length / 1024).toFixed(0)} KB)`);
    } catch (e: any) {
      console.error(`  ✗ Failed: ${e.message}`);
    }
  }

  console.log("\n✅ All logo variations generated!");
  console.log("📁 Check /public/logo-variations/ and pick your favorite");
}

main().catch(e => { console.error(e); process.exit(1); });
