// Deep inspect pdfmake exports to find the Printer class
async function main() {
  const printerMod: any = await import("pdfmake");
  console.log("=== top-level keys ===");
  for (const k of Object.keys(printerMod)) {
    console.log(`  ${k}: typeof=${typeof printerMod[k]}`);
  }

  console.log("\n=== printerMod.default ===");
  if (printerMod.default) {
    const def = printerMod.default;
    console.log("  typeof:", typeof def);
    console.log("  keys:", Object.keys(def));
    for (const k of Object.keys(def)) {
      console.log(`    ${k}: typeof=${typeof def[k]}`);
    }
  }

  console.log("\n=== try direct require (CommonJS) ===");
  const require = (await import("module")).default?.createRequire?.(import.meta.url) || (await import("module")).default?.createRequire;
  if (require) {
    const cjsMod = require("pdfmake");
    console.log("  typeof:", typeof cjsMod);
    console.log("  keys:", Object.keys(cjsMod));
    console.log("  Is constructor?:", typeof cjsMod === "function");
  }
}
main().catch(e => console.error("ERR:", e));
