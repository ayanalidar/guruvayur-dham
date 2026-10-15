import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { withErrorHandler } from "@/lib/api-safe";
import { getSetting } from "@/lib/settings";
import { db } from "@/lib/db";

// Force dynamic — DELETE routes are mutating, must run on every request.
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * DELETE /api/upload/[id]
 *
 * Deletes an uploaded file from BOTH Vercel Blob storage AND the local
 * Upload table. Used by the Media Library admin page (/admin/media).
 *
 * AUTH: requires a valid staff session (requireStaff).
 *
 * FLOW:
 *   1. Look up the Upload row by id.
 *   2. If the row's refCount > 0, warn the user (the URL is still
 *      referenced by content blocks / rooms / etc.). Return 409 Conflict
 *      with the list of references so the user can decide.
 *   3. Call @vercel/blob del() with the public URL.
 *   4. Delete the Upload row.
 *
 * TOKEN RESOLUTION (same as POST /api/upload):
 *   1. DB Setting row (BLOB_READ_WRITE_TOKEN)
 *   2. process.env (BLOB_READ_WRITE_TOKEN)
 */
async function getToken(): Promise<string | null> {
  const fromDb = await getSetting("BLOB_READ_WRITE_TOKEN");
  if (fromDb && fromDb.length > 0) return fromDb;
  const fromEnv = process.env.BLOB_READ_WRITE_TOKEN;
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  return null;
}

export const DELETE = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { session, error } = await requireStaff(req);
  if (error) return error;

  const { id } = await params;

  // ── Load the Upload row ─────────────────────────────────────────
  let upload: { id: string; url: string; filename: string; pathname: string; refCount: number } | null;
  try {
    upload = await db.upload.findUnique({
      where: { id },
      select: { id: true, url: true, filename: true, pathname: true, refCount: true },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "DB query failed", raw: err?.message }, { status: 500 });
  }

  if (!upload) {
    return NextResponse.json({ error: "Upload not found" }, { status: 404 });
  }

  // ── Safety check: warn if referenced ────────────────────────────
  // refCount > 0 means the URL is still stored in at least one content
  // block / room / blog post. Deleting the file would break that page.
  // Force the user to dereference first (or override with ?force=1).
  const force = req.nextUrl.searchParams.get("force") === "1";
  if (upload.refCount > 0 && !force) {
    // Find what references it (best-effort, multiple tables)
    const references: Array<{ table: string; key: string; value: string }> = [];
    try {
      // ContentBlock — key/value blocks
      const blocks = await db.contentBlock.findMany({
        where: { value: { contains: upload.url } },
        select: { key: true, value: true },
      });
      for (const b of blocks) {
        references.push({ table: "ContentBlock", key: b.key, value: b.value.slice(0, 80) });
      }
    } catch {}
    try {
      // Room — image + gallery (gallery is JSON string array)
      const rooms = await db.room.findMany({
        where: { OR: [{ image: { contains: upload.url } }, { gallery: { contains: upload.url } }] },
        select: { slug: true, name: true, image: true, gallery: true },
      });
      for (const r of rooms) {
        references.push({ table: "Room", key: r.slug, value: r.name });
      }
    } catch {}
    try {
      const posts = await db.blogPost.findMany({
        where: { image: { contains: upload.url } },
        select: { slug: true, title: true },
      });
      for (const p of posts) {
        references.push({ table: "BlogPost", key: p.slug, value: p.title });
      }
    } catch {}
    try {
      const imgs = await db.galleryImage.findMany({
        where: { src: { contains: upload.url } },
        select: { tab: true, alt: true },
      });
      for (const g of imgs) {
        references.push({ table: "GalleryImage", key: g.tab, value: g.alt });
      }
    } catch {}

    return NextResponse.json(
      {
        error: `File is referenced in ${references.length} place(s). Delete references first or re-submit with ?force=1 to delete anyway.`,
        refCount: upload.refCount,
        references: references.slice(0, 50), // cap to keep response sane
        url: upload.url,
      },
      { status: 409 }
    );
  }

  // ── Delete from Vercel Blob ─────────────────────────────────────
  const token = await getToken();
  if (!token) {
    return NextResponse.json(
      { error: "Cannot delete from Blob — BLOB_READ_WRITE_TOKEN not set" },
      { status: 503 }
    );
  }

  try {
    const { del } = await import("@vercel/blob");
    await del(upload.url, { token });
  } catch (err: any) {
    const msg = err?.message || String(err);
    // If the Blob file is already gone (404), still let us delete the DB row
    if (!/not.?found/i.test(msg)) {
      return NextResponse.json(
        { error: "Vercel Blob delete failed", raw: msg },
        { status: 502 }
      );
    }
  }

  // ── Delete the Upload row ───────────────────────────────────────
  try {
    await db.upload.delete({ where: { id } });
  } catch (err: any) {
    // Row already gone — not a problem
  }

  return NextResponse.json(
    {
      ok: true,
      id,
      url: upload.url,
      filename: upload.filename,
      deletedBy: session?.user?.name || null,
      deletedAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
});

/**
 * PATCH /api/upload/[id] — update refCount or metadata.
 *
 * Currently only used to increment/decrement refCount when a content
 * block / room / etc. starts or stops referencing this URL. Not yet
 * wired in the broader codebase — left here as a placeholder.
 *
 * Body: { refDelta?: number, uploadedFrom?: string }
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const refDelta = Number(body.refDelta) || 0;

  try {
    const updated = await db.upload.update({
      where: { id },
      data: {
        ...(refDelta !== 0 ? { refCount: { increment: refDelta } } : {}),
        ...(body.uploadedFrom ? { uploadedFrom: String(body.uploadedFrom) } : {}),
      },
      select: { id: true, refCount: true, uploadedFrom: true },
    });
    return NextResponse.json(updated, { headers: { "Cache-Control": "no-store" } });
  } catch (err: any) {
    return NextResponse.json({ error: "DB update failed", raw: err?.message }, { status: 500 });
  }
}
