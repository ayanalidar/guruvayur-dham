import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { tmpdir } from "os";

/**
 * POST /api/upload
 *
 * Uploads an image file and returns its public URL.
 *
 * Storage strategy (auto-detects):
 *   1. If BLOB_READ_WRITE_TOKEN env var is set → uses Vercel Blob (cloud)
 *   2. If /tmp is writable (Vercel serverless) → stores in /tmp and
 *      returns as base64 data URL (works on Vercel without Blob)
 *   3. If /public/uploads is writable (VPS/local) → stores on filesystem
 *
 * On Vercel serverless, the filesystem is READ-ONLY except /tmp.
 * So without Vercel Blob, we fall back to base64 data URLs which
 * work everywhere but are larger (not ideal for production).
 *
 * For production on Vercel: set BLOB_READ_WRITE_TOKEN env var.
 * For VPS: no env var needed, uses local filesystem.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Max 10MB." },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // ===== Strategy 1: Vercel Blob (cloud storage) =====
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import("@vercel/blob");
        const blob = await put(filename, file, {
          access: "public",
          addRandomSuffix: false,
        });
        return NextResponse.json({ url: blob.url });
      } catch (blobError: any) {
        console.error("Vercel Blob upload failed:", blobError.message);
        // Fall through to next strategy
      }
    }

    // ===== Strategy 2: Local filesystem (VPS / dev) =====
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Try /public/uploads first (works on VPS + local dev)
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);
      return NextResponse.json({ url: `/uploads/${filename}` });
    } catch (fsError: any) {
      // Filesystem not writable (Vercel serverless) — fall through to base64
      console.log("Filesystem upload failed, trying base64 fallback:", fsError.message);
    }

    // ===== Strategy 3: Base64 data URL (Vercel serverless fallback) =====
    // This works EVERYWHERE but produces larger responses.
    // For production on Vercel, set BLOB_READ_WRITE_TOKEN to use cloud storage.
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;

      // Check if the base64 is not too large (limit to 2MB for data URLs)
      if (dataUrl.length > 2 * 1024 * 1024) {
        return NextResponse.json(
          {
            error: "File too large for serverless upload. Set BLOB_READ_WRITE_TOKEN env var for cloud storage, or upload a smaller image (<2MB).",
            hint: "Go to Vercel dashboard → Storage → Create Blob Store → copy BLOB_READ_WRITE_TOKEN → add to Environment Variables.",
          },
          { status: 413 }
        );
      }

      return NextResponse.json({ url: dataUrl });
    } catch (base64Error: any) {
      console.error("Base64 fallback failed:", base64Error);
      return NextResponse.json(
        { error: "Upload failed. All storage strategies failed." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: `Upload failed: ${error.message}` },
      { status: 500 }
    );
  }
}
