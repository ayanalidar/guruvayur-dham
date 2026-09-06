import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

/**
 * POST /api/upload
 *
 * Uploads an image file and returns its public URL.
 *
 * Storage strategy (auto-detects):
 *   - If BLOB_READ_WRITE_TOKEN env var is set → uses Vercel Blob (cloud, persistent, works on Vercel serverless)
 *   - If not set → falls back to local /public/uploads/ (dev / Hostinger VPS)
 *
 * Body: FormData with field "file" containing the image
 * Response: { url: string } or { error: string }
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
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Max 10MB." },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // ===== Try Vercel Blob first (if token is set) =====
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import("@vercel/blob");
        const blob = await put(filename, file, {
          access: "public",
          addRandomSuffix: false,
        });
        return NextResponse.json({ url: blob.url });
      } catch (blobError: any) {
        console.error("Vercel Blob upload failed, falling back to local:", blobError.message);
        // Fall through to local storage
      }
    }

    // ===== Fallback: local filesystem (/public/uploads/) =====
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Return the public URL (relative to site root)
    const url = `/uploads/${filename}`;
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: `Upload failed: ${error.message}` },
      { status: 500 }
    );
  }
}
