import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { tmpdir } from "os";
import crypto from "crypto";
import { requireStaff } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limiter";

/**
 * POST /api/upload
 *
 * Uploads an image file and returns its public URL.
 *
 * SECURITY (Phase D H15 fixes):
 * - Magic-number validation: reads first 12 bytes of the file and compares
 *   against known JPEG/PNG/WebP/GIF signatures. The user-supplied
 *   Content-Type is no longer trusted.
 * - Image re-encoding via sharp: strips EXIF (incl. GPS coords) and any
 *   embedded payloads (e.g. PHP in JPEG comments, polyglot files).
 * - Hardcoded .jpg extension on output: prevents malicious extensions like
 *   .php, .html, .svg (XSS via SVG).
 * - Filename uses crypto.randomBytes (was Math.random — predictable).
 *
 * Storage strategy (auto-detects):
 *   1. If BLOB_READ_WRITE_TOKEN env var is set → uses Vercel Blob (cloud)
 *   2. If /public/uploads is writable (VPS/local) → stores on filesystem
 *   3. If /tmp is writable (Vercel serverless) → returns as base64 data URL
 *
 * On Vercel serverless, the filesystem is READ-ONLY except /tmp.
 */
export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  // Rate limit — 10 uploads/min per IP (prevents disk-fill / Blob-cost abuse).
  const rl = await rateLimit(req, { window: 60, max: 10, key: "upload" });
  if (!rl.ok) return NextResponse.json({ error: "Too many uploads. Please wait a minute." }, { status: 429 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (max 10MB).
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Max 10MB." },
        { status: 400 }
      );
    }

    // Read file into buffer for magic-number check + re-encoding.
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ===== Magic-number validation =====
    // Don't trust the Content-Type header — attackers can spoof it.
    // Read the actual file signature (first ~12 bytes).
    const isJpeg = buffer.subarray(0, 3).toString("hex") === "ffd8ff";
    const isPng = buffer.subarray(0, 8).toString("hex") === "89504e470d0a1a0a";
    const isWebp = buffer.subarray(0, 4).toString("ascii") === "RIFF"
      && buffer.subarray(8, 12).toString("ascii") === "WEBP";
    const isGif = buffer.subarray(0, 6).toString("ascii") === "GIF87a"
      || buffer.subarray(0, 6).toString("ascii") === "GIF89a";

    if (!isJpeg && !isPng && !isWebp && !isGif) {
      return NextResponse.json(
        { error: "Invalid image file. Magic number check failed — file is not a valid JPEG, PNG, WebP, or GIF." },
        { status: 400 }
      );
    }

    // ===== Re-encode via sharp (strips EXIF + embedded payloads) =====
    // sharp normalizes the image: removes EXIF (GPS, camera info), strips
    // any embedded payloads (PHP in JPEG comments, polyglot files), and
    // outputs a clean JPEG. The output is always .jpg regardless of input.
    let cleanBuffer: Buffer;
    try {
      const sharp = (await import("sharp")).default;
      cleanBuffer = await sharp(buffer)
        .rotate() // auto-orient based on EXIF (before stripping)
        .flatten({ background: "#ffffff" }) // composite alpha onto white
        .jpeg({ quality: 85, mozjpeg: true }) // re-encode as JPEG
        .toBuffer();
    } catch (sharpError: any) {
      console.error("sharp re-encoding failed:", sharpError.message);
      return NextResponse.json(
        { error: "Image processing failed — file may be corrupted." },
        { status: 400 }
      );
    }

    // Generate a unique filename — crypto.randomBytes (was Math.random).
    // Always .jpg since we re-encoded as JPEG above.
    const filename = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.jpg`;

    // ===== Strategy 1: Vercel Blob (cloud storage) =====
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import("@vercel/blob");
        const blob = await put(filename, cleanBuffer, {
          access: "public",
          addRandomSuffix: false,
          contentType: "image/jpeg",
        });
        return NextResponse.json({ url: blob.url });
      } catch (blobError: any) {
        console.error("Vercel Blob upload failed:", blobError.message);
        // Fall through to next strategy
      }
    }

    // ===== Strategy 2: /public/uploads (VPS + local dev) =====
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, cleanBuffer);
      return NextResponse.json({ url: `/uploads/${filename}` });
    } catch (publicErr: any) {
      // /public not writable (Vercel) — try /tmp + base64 fallback.
      // SECURITY (Round 3 M18 fix): refuse uploads >100KB on Vercel-without-Blob
      // to prevent bandwidth DoS (was: returned base64 data URL for files up to
      // 500KB, ~670KB response body per request — repeatable bandwidth abuse).
      if (cleanBuffer.length > 100 * 1024) {
        return NextResponse.json(
          {
            error: "Image too large for Vercel without cloud storage (max 100KB). Set BLOB_READ_WRITE_TOKEN env var, or use an image under 100KB.",
            hint: "Vercel dashboard → Storage → Create Blob Store → copy token → add as BLOB_READ_WRITE_TOKEN env var.",
          },
          { status: 413 }
        );
      }
      const tmpDir = path.join(tmpdir(), "uploads");
      if (!existsSync(tmpDir)) {
        await mkdir(tmpDir, { recursive: true });
      }
      const tmpPath = path.join(tmpDir, filename);
      await writeFile(tmpPath, cleanBuffer);
      // /tmp files don't persist across requests on Vercel, so we return
      // a base64 data URL (only for small files now, ≤100KB).
      const base64 = cleanBuffer.toString("base64");
      const dataUrl = `data:image/jpeg;base64,${base64}`;
      return NextResponse.json({ url: dataUrl });
    }
  } catch (error: any) {
    console.error("Upload error:", error.message);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
