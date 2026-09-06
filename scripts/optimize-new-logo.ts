import sharp from "sharp";
import fs from "fs";

async function main() {
  console.log("Optimizing new logo...");
  const variants = [
    { name: "guruyavur.png", size: 1024 },
    { name: "logo-large.png", size: 512 },
    { name: "logo-nav.png", size: 80 },
    { name: "logo-footer.png", size: 96 },
  ];
  for (const v of variants) {
    await sharp("public/guruyavur-new.png")
      .resize(v.size, v.size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(`public/${v.name}`);
    const stat = fs.statSync(`public/${v.name}`);
    console.log(`  ${v.name} (${v.size}x${v.size}) ${(stat.size/1024).toFixed(1)} KB`);
  }
  fs.renameSync("public/guruyavur-new.png", "public/guruyavur-original.png");
  console.log("Done!");
}
main().catch(e => { console.error(e); process.exit(1); });
