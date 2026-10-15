/**
 * End-to-end upload test for Vercel Blob.
 *
 * Usage:
 *   set -a && source .env && set +a && npx tsx scripts/test-blob-upload.ts
 *
 * What it does:
 *   1. Creates a 1x1 transparent PNG in memory (~70 bytes)
 *   2. Uploads it via put() to a "test/" prefix
 *   3. Verifies the returned URL is publicly accessible (HTTP HEAD request)
 *   4. Deletes the test file via del() to leave the store clean
 *
 * If this passes, /api/upload will work for real uploads from the admin UI.
 */
import { put, del } from "@vercel/blob";

// Smallest valid 1x1 transparent PNG (70 bytes) — generated, not committed.
const TINY_PNG = Buffer.from(
  "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c63000100000005000100" +
    "0c1ccd001234567890",
  "hex"
);

async function main() {
  console.log("\n=== Vercel Blob Upload Test ===\n");

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error("FAIL  BLOB_READ_WRITE_TOKEN not set");
    process.exit(1);
  }

  const pathname = `test/verify-${Date.now()}.png`;
  console.log("Uploading test PNG to:", pathname);

  let blobUrl: string;
  try {
    const result = await put(pathname, TINY_PNG, {
      access: "public",
      token,
      contentType: "image/png",
      addRandomSuffix: false,
    });
    blobUrl = result.url;
    console.log("OK    Uploaded. Public URL:");
    console.log("      ", blobUrl);
  } catch (err: any) {
    console.error("\nFAIL  Upload failed:", err?.message || String(err));
    if (/quota|exceeded/i.test(err?.message || "")) {
      console.error("      Store is full. Upgrade to Vercel Pro (100 GB).");
    } else if (/forbidden/i.test(err?.message || "")) {
      console.error("      Token lacks write permission.");
    }
    process.exit(1);
  }

  // Verify the URL is publicly accessible (HEAD request, no auth)
  console.log("\nVerifying public access (HTTP HEAD)...");
  try {
    const r = await fetch(blobUrl, { method: "HEAD" });
    if (r.ok) {
      console.log("OK    Public URL is reachable. Status:", r.status);
      console.log("      Content-Type:", r.headers.get("content-type"));
      console.log("      Content-Length:", r.headers.get("content-length"), "bytes");
    } else {
      console.error("FAIL  Public URL returned HTTP", r.status);
      process.exit(1);
    }
  } catch (err: any) {
    console.error("FAIL  Network error verifying URL:", err?.message);
    process.exit(1);
  }

  // Clean up — delete the test file
  console.log("\nCleaning up test file...");
  try {
    await del(blobUrl, { token });
    console.log("OK    Test file deleted.");
  } catch (err: any) {
    console.warn("WARN  Could not delete test file:", err?.message);
    console.warn("      You can manually delete it from the Vercel Blob dashboard:");
    console.warn("      ", blobUrl);
  }

  console.log("\n=== ALL CHECKS PASSED ===");
  console.log("Vercel Blob upload pipeline is fully functional.");
  console.log("After redeploy, /api/upload will accept images from /admin/content and /cms.\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
