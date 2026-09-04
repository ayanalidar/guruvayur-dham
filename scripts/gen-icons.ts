/**
 * Generates PWA icons (192, 512, maskable 512) as PNGs using Sharp.
 * Output: public/icon-*.png
 */
import sharp from "sharp";
import { mkdirSync } from "fs";
import path from "path";

const OUT = "/home/z/my-project/public";

// SVG for the icon — saffron Om on dark maroon circle, gold border
function iconSVG(size: number, maskable = false) {
  const padding = maskable ? size * 0.15 : 0;
  const inner = size - padding * 2;
  const cx = size / 2;
  const cy = size / 2;
  const r = inner / 2 - 4;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#1A1310"/>
      <stop offset="100%" stop-color="#0F0A08"/>
    </radialGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E8D9B8"/>
      <stop offset="50%" stop-color="#D4C4A8"/>
      <stop offset="100%" stop-color="#B8860B"/>
    </linearGradient>
    <linearGradient id="saffron" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFB347"/>
      <stop offset="100%" stop-color="#E67E22"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="#0F0A08"/>
  <circle cx="${cx}" cy="${cy}" r="${r + 6}" fill="none" stroke="url(#gold)" stroke-width="2" opacity="0.6"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#bg)" stroke="url(#gold)" stroke-width="3"/>
  <text x="${cx}" y="${cy + size * 0.16}" text-anchor="middle" font-family="Georgia, serif" font-size="${size * 0.42}" font-weight="bold" fill="url(#saffron)">ॐ</text>
</svg>`;
}

async function gen() {
  mkdirSync(OUT, { recursive: true });

  // 192
  await sharp(Buffer.from(iconSVG(192))).png().toFile(path.join(OUT, "icon-192.png"));
  console.log("✓ icon-192.png");

  // 512
  await sharp(Buffer.from(iconSVG(512))).png().toFile(path.join(OUT, "icon-512.png"));
  console.log("✓ icon-512.png");

  // maskable 512 (with padding for safe zone)
  await sharp(Buffer.from(iconSVG(512, true))).png().toFile(path.join(OUT, "icon-maskable-512.png"));
  console.log("✓ icon-maskable-512.png");

  // Apple touch icon (180, no transparency)
  await sharp(Buffer.from(iconSVG(180))).png().toFile(path.join(OUT, "apple-touch-icon.png"));
  console.log("✓ apple-touch-icon.png");

  // favicon (32)
  await sharp(Buffer.from(iconSVG(32))).png().toFile(path.join(OUT, "favicon-32.png"));
  console.log("✓ favicon-32.png");

  console.log("\n✅ All PWA icons generated");
}

gen().catch(console.error);
