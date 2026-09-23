// Direct test — bypass my code, just test if pdfmake itself can find Roboto
const vfsMod = require("pdfmake/build/vfs_fonts");
const pdfmakeMod = require("pdfmake");
const instance = pdfmakeMod.default || pdfmakeMod["module.exports"] || pdfmakeMod;
console.log("instance type:", typeof instance);
console.log("instance.virtualfs type:", typeof instance.virtualfs);
console.log("storage keys BEFORE:", Object.keys(instance.virtualfs?.storage || {}));

// Copy font files into VFS storage
const vfsData = vfsMod.vfs || vfsMod;
console.log("\nvfsData keys:", Object.keys(vfsData));
for (const [filename, content] of Object.entries(vfsData)) {
  if (typeof content === "string") {
    try {
      instance.virtualfs.writeFileSync(filename, content, "base64");
    } catch (e) { console.log(`writeFileSync failed for ${filename}:`, e.message); }
  }
}
console.log("storage keys AFTER:", Object.keys(instance.virtualfs?.storage || {}));
console.log("existsSync Roboto-Regular.ttf:", instance.virtualfs.existsSync("Roboto-Regular.ttf"));

// Try to read
try {
  const buf = instance.virtualfs.readFileSync("Roboto-Regular.ttf");
  console.log("readFileSync result: typeof=", typeof buf, "length=", buf?.length);
} catch (e) { console.log("readFileSync threw:", e.message); }
