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

    // ===== Strategy 2: /tmp directory (Vercel serverless writable area) =====
    // Vercel serverless can write to /tmp. We store the file there and
    // return a base64 data URL (but only if small enough).
    // For larger files, we return an error guiding the user to set up Blob.
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Try /public/uploads first (works on VPS + local dev)
      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);
        return NextResponse.json({ url: `/uploads/${filename}` });
      } catch (publicErr: any) {
        // /public not writable (Vercel) — try /tmp as fallback
        const tmpDir = path.join(tmpdir(), "uploads");
        if (!existsSync(tmpDir)) {
          await mkdir(tmpDir, { recursive: true });
        }
        const tmpPath = path.join(tmpDir, filename);
        await writeFile(tmpPath, buffer);
        // /tmp files don't persist across requests on Vercel, so we
        // can't return a URL. Instead, return a base64 data URL for
        // small files, or an error for large files.
        if (buffer.length < 500 * 1024) {
          // File is small enough (< 500KB) for base64 data URL
          const base64 = buffer.toString("base64");
          const dataUrl = `data:${file.type};base64,${base64}`;
          return NextResponse.json({ url: dataUrl });
        }
        // File too large for base64 on Vercel without Blob
        return NextResponse.json(
          {
            error: "Image too large for Vercel without cloud storage. Set BLOB_READ_WRITE_TOKEN env var, or use an image under 500KB.",
            hint: "Vercel dashboard → Storage → Create Blob Store → copy token → add as BLOB_READ_WRITE_TOKEN env var.",
          },
          { status: 413 }
        );
      }
    } catch (fsError: any) {
      console.error("All filesystem strategies failed:", fsError);
      return NextResponse.json(
        { error: `Upload failed: ${fsError.message}` },
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
