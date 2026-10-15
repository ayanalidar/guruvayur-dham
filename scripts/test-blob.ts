/**
 * Verifies the Vercel Blob token is valid and the store is reachable.
 *
 * Usage:
 *   npx tsx scripts/test-blob.ts
 *
 * Checks:
 *   1. Token is set (process.env.BLOB_READ_WRITE_TOKEN)
 *   2. @vercel/blob SDK is installed
 *   3. list() returns successfully (token is valid + store exists)
 *   4. Shows current file count + total size
 *
 * This script does NOT upload anything — read-only probe. Safe to run
 * multiple times.
 */
import { list } from "@vercel/blob";

async function main() {
  console.log("\n=== Vercel Blob Token Verification ===\n");

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error("FAIL  BLOB_READ_WRITE_TOKEN is not set in process.env");
    console.error("      Add it to .env (local) or docker-compose.yml env: (VPS)");
    process.exit(1);
  }
  console.log("OK    Token found in env (length:", token.length, "chars)");

  if (token.length < 30) {
    console.warn("WARN  Token seems short — verify you copied the FULL value");
  }

  console.log("\nProbing store with list()...");
  try {
    const result = await list({ token });
    const files = result.blobs || [];
    console.log("OK    Token is valid. Store is reachable.");
    console.log("      Current file count:", files.length);

    if (files.length === 0) {
      console.log("      Store is empty — perfect for a fresh start.");
    } else {
      const totalBytes = files.reduce((sum, f) => sum + (f.size || 0), 0);
      const totalMB = (totalBytes / 1024 / 1024).toFixed(2);
      console.log("      Total size:", totalMB, "MB / 1024 MB (Hobby plan)");
      console.log("\n      Sample files (first 5):");
      for (const f of files.slice(0, 5)) {
        console.log("       -", f.pathname, "(" + (f.size / 1024).toFixed(1) + " KB)");
      }
    }

    console.log("\n=== ALL CHECKS PASSED ===");
    console.log("Vercel Blob is ready. /api/upload will work after redeploy.\n");
    process.exit(0);
  } catch (err: any) {
    console.error("\nFAIL  list() call failed:", err?.message || String(err));
    if (/store_not_found|not_found/i.test(err?.message || "")) {
      console.error("      The token doesn't match any Blob store.");
      console.error("      Verify you copied the token from the correct store");
      console.error("      (store ID: store_hC6ZI6ZepM8wofBm).");
    } else if (/forbidden|unauthorized/i.test(err?.message || "")) {
      console.error("      Token is valid but lacks read permission.");
      console.error("      Re-issue a read-write token in the Vercel dashboard.");
    } else if (/network|ECONNREFUSED|ENOTFOUND/i.test(err?.message || "")) {
      console.error("      Network error — check your internet connection.");
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
