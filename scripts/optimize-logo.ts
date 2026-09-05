/**
 * Optimize the guruyavur.png logo into multiple sizes for web use.
 * Input: public/guruyavur.png (3000×3000, 5.5MB)
 * Outputs:
 *   - public/logo-large.png  (512×512, for login/footer/JSON-LD)
 *   - public/logo-nav.png    (80×80, for navbar)
 *   - public/logo-footer.png (96×96, for footer)
 *   - public/guruyavur.png   (1024×1024, optimized original — kept for reference)
 */
import sharp from "sharp";
import fs from "fs";

const SRC = "public/guruyavur.png";

async function main() {
  console.log("🖼️  Optimizing logo...");

  // Backup the original (full-res) as guruyavur-original.png
  if (!fs.existsSync("public/guruyavur-original.png")) {
    fs.copyFileSync(SRC, "public/guruyavur-original.png");
    console.log("  ✓ Backed up original as guruyavur-original.png");
  }

  // Generate optimized variants (read from the backup so we can overwrite guruyavur.png)
  const variants = [
    { name: "logo-large.png", size: 512 },
    { name: "logo-nav.png", size: 80 },
    { name: "logo-footer.png", size: 96 },
    { name: "guruyavur.png", size: 1024 }, // overwrite with optimized version
  ];

  for (const v of variants) {
    await sharp("public/guruyavur-original.png")
      .resize(v.size, v.size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ quality: 90, compressionLevel: 9, palette: true })
      .toFile(`public/${v.name}`);
    const stat = fs.statSync(`public/${v.name}`);
    console.log(`  ✓ ${v.name} (${v.size}×${v.size}) · ${(stat.size / 1024).toFixed(1)} KB`);
  }

  console.log("\n✅ Done. Old logos replaced with optimized versions.");
}

main().catch((e) => { console.error(e); process.exit(1); });
