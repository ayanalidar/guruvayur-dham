import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { withErrorHandler } from "@/lib/api-safe";
import { getSetting } from "@/lib/settings";
import { db } from "@/lib/db";

// Force dynamic — this route always handles a fresh upload, never cached.
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * POST /api/upload
 *
 * Uploads a single image file to Vercel Blob storage and returns the public
 * CDN URL. Used by:
 *   - /admin/content (AdminContent.tsx ContentImageUploader) — for hero
 *     images, temple widget backgrounds, gallery images, etc.
 *   - /cms (CMSPage.tsx inline uploaders) — for room/pooja/blog/gallery
 *     image fields
 *
 * AUTH: requires a valid staff session (requireStaff).
 *
 * VALIDATION:
 *   - Accepts only image MIME types: jpeg, png, webp, gif
 *   - Max file size: 5 MB (Vercel Hobby plan allows up to 500 MB per file,
 *     but we cap at 5 MB to keep storage usage sane and upload times fast)
 *   - Filename sanitized — we generate the actual Blob pathname from a
 *     timestamp + cuid to avoid collisions and path traversal
 *
 * RESPONSE (success):
 *   { url: "https://<store>.public.blob.vercel-storage.com/<path>",
 *     pathname: "<path>",
 *     filename: "<original-name>",
 *     size: <bytes>,
 *     mimeType: "<type>" }
 *
 * RESPONSE (error):
 *   { error: "<human message>" }
 *
 * TOKEN RESOLUTION (in priority order):
 *   1. DB Setting row (BLOB_READ_WRITE_TOKEN) — set via /admin/system UI
 *   2. process.env.BLOB_READ_WRITE_TOKEN — set via .env / docker-compose
 *   If neither is set, returns a clear error explaining how to fix it.
 *
 * SIDE EFFECT: writes a row to the Upload table (best-effort — if the DB
 * write fails, we still return the Blob URL to the user; the file is
 * uploaded successfully even if our local metadata tracking fails).
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

// Path prefix buckets — matches the `uploadedFrom` field on the Upload
// model. Helps organize the media library later.
const PATH_PREFIXES: Record<string, string> = {
  content: "content",
  room: "rooms",
  pooja: "poojas",
  blog: "blog",
  gallery: "gallery",
  event: "events",
  misc: "misc",
};

async function getToken(): Promise<string | null> {
  // 1) DB setting (set via /admin/system → INTEGRATION tab)
  const fromDb = await getSetting("BLOB_READ_WRITE_TOKEN");
  if (fromDb && fromDb.length > 0) return fromDb;
  // 2) process.env (set via .env / docker-compose)
  const fromEnv = process.env.BLOB_READ_WRITE_TOKEN;
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  return null;
}

function sanitizeFilename(name: string): string {
  // Keep only alphanumeric + dash + dot. Strip path components (no ../ tricks).
  const base = name.split(/[\\/]/).pop() || "upload";
  return base.replace(/[^a-zA-Z0-9.\-_]/g, "-").toLowerCase();
}

function generatePathname(filename: string, bucket: string): string {
  const prefix = PATH_PREFIXES[bucket] || "misc";
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  // 12-char random suffix to prevent collision + filename-guessing attacks
  const rand = Math.random().toString(36).slice(2, 14);
  const safe = sanitizeFilename(filename);
  return `${prefix}/${yyyy}/${mm}/${rand}-${safe}`;
}

export const POST = withErrorHandler(async (req: NextRequest) => {
  // ── Auth ─────────────────────────────────────────────────────────
  const { session, error } = await requireStaff(req);
  if (error) return error;

  // ── Token check ──────────────────────────────────────────────────
  const token = await getToken();
  if (!token) {
    return NextResponse.json(
      {
        error:
          "Vercel Blob is not configured. Set BLOB_READ_WRITE_TOKEN in /admin/system → INTEGRATION, or in your .env file.",
      },
      { status: 503 }
    );
  }

  // ── Parse multipart form ────────────────────────────────────────
  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded. Use field name 'file'." }, { status: 400 });
  }

  // ── Validate type ───────────────────────────────────────────────
  if (!ALLOWED_MIME.includes(file.type.toLowerCase())) {
    return NextResponse.json(
      {
        error: `Unsupported file type: ${file.type}. Allowed: ${ALLOWED_MIME.join(", ")}.`,
      },
      { status: 415 }
    );
  }

  // ── Validate size ───────────────────────────────────────────────
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      {
        error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)} MB. Max: ${MAX_FILE_SIZE / 1024 / 1024} MB.`,
      },
      { status: 413 }
    );
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty." }, { status: 400 });
  }

  // ── Determine bucket (path prefix) ─────────────────────────────
  // The form may include a 'bucket' field telling us where the file is
  // going (content | room | pooja | blog | gallery | event | misc).
  // Defaults to 'misc' so uploads from unknown callers still work.
  const bucket = String(formData.get("bucket") || "misc").toLowerCase();
  const safeBucket = PATH_PREFIXES[bucket] ? bucket : "misc";
  const pathname = generatePathname(file.name, safeBucket);

  // ── Upload to Vercel Blob ───────────────────────────────────────
  let blobUrl: string;
  try {
    // Dynamic import — @vercel/blob is only loaded when this route is
    // actually called. Keeps the serverless bundle lean.
    const { put } = await import("@vercel/blob");
    const result = await put(pathname, file, {
      access: "public",
      token, // explicit token — works whether set in DB or process.env
      contentType: file.type,
      addRandomSuffix: false, // we already added a random suffix in generatePathname
    });
    blobUrl = result.url;
  } catch (err: any) {
    // Vercel Blob returns helpful errors like:
    //   "store_not_found"        — wrong store, check the token
    //   "forbidden"              — token doesn't have write access
    //   "quota_exceeded"         — Hobby plan 1 GB full, upgrade to Pro
    const msg = err?.message || String(err);
    let friendly = "Upload failed. Please try again.";
    if (/store_not_found|not_found/i.test(msg)) {
      friendly = "Vercel Blob store not found. Check that BLOB_READ_WRITE_TOKEN is for the correct store.";
    } else if (/forbidden|unauthorized/i.test(msg)) {
      friendly = "Vercel Blob token does not have write access. Re-issue a read-write token.";
    } else if (/quota|exceeded|limit/i.test(msg)) {
      friendly = "Vercel Blob storage quota exceeded (1 GB on Hobby plan). Upgrade to Vercel Pro for 100 GB.";
    }
    return NextResponse.json(
      { error: friendly, raw: msg },
      { status: 502 }
    );
  }

  // ── Record metadata in the Upload table ───────────────────────
  // Best-effort — if the DB write fails, we still return success because
  // the file IS uploaded to Blob. The media library just won't show it.
  try {
    await db.upload.create({
      data: {
        url: blobUrl,
        filename: file.name,
        pathname,
        mimeType: file.type,
        size: file.size,
        uploadedFrom: safeBucket,
        uploadedById: session?.user?.id,
        uploadedByName: session?.user?.name,
      },
    });
  } catch {
    // Silent fail — don't block the upload on metadata tracking
  }

  // ── Success ────────────────────────────────────────────────────
  return NextResponse.json(
    {
      url: blobUrl,
      pathname,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
});

/**
 * GET /api/upload — list recent uploads (for a future media library UI).
 *
 * Returns the most recent 50 uploads in reverse chronological order.
 * Used by /admin/media (to be built).
 */
export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  try {
    const uploads = await db.upload.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        url: true,
        filename: true,
        mimeType: true,
        size: true,
        uploadedFrom: true,
        uploadedByName: true,
        refCount: true,
        createdAt: true,
      },
    });

    // Storage usage summary for the admin UI
    const agg = await db.upload.aggregate({
      _sum: { size: true },
      _count: true,
    });

    return NextResponse.json(
      {
        uploads,
        summary: {
          totalFiles: agg._count,
          totalBytes: agg._sum.size || 0,
          totalMB: ((agg._sum.size || 0) / 1024 / 1024).toFixed(2),
          // Vercel Hobby plan storage limit — surfaced in the admin UI
          // so the user gets a budget warning before hitting the cap.
          quotaBytes: 1024 * 1024 * 1024, // 1 GB
          quotaLabel: "1 GB (Vercel Hobby)",
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to list uploads", raw: err?.message },
      { status: 500 }
    );
  }
}
