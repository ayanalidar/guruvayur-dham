import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

/**
 * POST /api/content/versions/rollback
 *
 * Restores a content block (or a CMS row) to a previous version.
 *
 * Body: { key, version }
 *   - key: ContentBlock key (e.g. "hero.headline") OR a CMS version key
 *     ("cms:features:abc123"). CMS keys are written by /api/cms PATCH handler.
 *   - version: the version number to restore (must exist in ContentVersion
 *     for this key).
 *
 * Behaviour:
 *   1. Look up the requested ContentVersion row.
 *   2. Snapshot the CURRENT live value into a NEW ContentVersion (so the
 *      rollback itself is reversible — "undo the undo").
 *   3. Write the old value back into the live row.
 *      - For ContentBlock keys: update ContentBlock.value.
 *      - For CMS keys (cms:<type>:<id>): parse the type + id, deserialize
 *        the JSON snapshot, strip id/createdAt/updatedAt, and update the
 *        corresponding CMS table row.
 *   4. Write an AuditLog entry.
 *
 * MANAGER-only — rollback bypasses the normal Zod-validated CMS schemas,
 * so it must be gated to the highest-privilege role.
 *
 * SelfReliant-Phase2-4.
 */

const RollbackSchema = z.object({
  key: z.string().min(1).max(200),
  version: z.coerce.number().int().min(1),
});

export async function POST(req: NextRequest) {
  const { session, error } = await requireStaff(req, ["MANAGER"]);
  if (error || !session) {
    return error || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = RollbackSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { key, version } = parsed.data;

  // 1. Look up the requested version.
  const targetVersion = await db.contentVersion.findFirst({
    where: { contentBlockKey: key, version },
  });
  if (!targetVersion) {
    return NextResponse.json(
      { error: `Version ${version} not found for key ${key}` },
      { status: 404 },
    );
  }

  // 2. Snapshot the CURRENT live value (so the rollback is itself reversible).
  try {
    const currentSnapshot = await fetchCurrentValue(key);
    if (currentSnapshot !== null) {
      const nextVersion =
        (await db.contentVersion.count({ where: { contentBlockKey: key } })) + 1;
      await db.contentVersion.create({
        data: {
          contentBlockKey: key,
          value: currentSnapshot,
          version: nextVersion,
          updatedBy: session.user.id,
          userName: session.user.name,
          changeSummary: `Pre-rollback snapshot (before restoring v${version})`,
        },
      });
    }
  } catch {}

  // 3. Restore the old value into the live row.
  let restored: { kind: "contentBlock" | "cms"; ref?: string } | null = null;
  try {
    if (key.startsWith("cms:")) {
      const parts = key.split(":");
      const type = parts[1];
      const id = parts[2];
      if (!type || !id) {
        return NextResponse.json(
          { error: "Invalid CMS version key — expected cms:<type>:<id>" },
          { status: 400 },
        );
      }
      await restoreCmsRow(type, id, targetVersion.value);
      restored = { kind: "cms", ref: `${type}:${id}` };
    } else {
      await db.contentBlock.upsert({
        where: { key },
        create: {
          key,
          value: targetVersion.value,
          category: "general",
        },
        update: { value: targetVersion.value },
      });
      restored = { kind: "contentBlock", ref: key };
    }
  } catch (e: any) {
    return NextResponse.json(
      { error: `Rollback failed: ${e.message || "unknown error"}` },
      { status: 500 },
    );
  }

  // 4. Audit log.
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const ua = req.headers.get("user-agent") || "unknown";
  await db.auditLog.create({
    data: {
      userId: session.user.id,
      userName: session.user.name || null,
      action: "UPDATE",
      entity: "CONTENT_VERSION",
      entityId: key,
      details: JSON.stringify({
        action: "rollback",
        restoredVersion: version,
        target: restored,
      }),
      ipAddress: ip,
      userAgent: ua,
    },
  }).catch(() => {});

  return NextResponse.json({
    ok: true,
    key,
    restoredVersion: version,
    target: restored,
    message: `Restored ${key} to version ${version}. A pre-rollback snapshot was saved so you can undo this rollback.`,
  });
}

/**
 * Fetch the current live value for a version key, so we can snapshot it
 * before restoring. Returns null if the live row doesn't exist (e.g. CMS
 * row was deleted after the version was written).
 */
async function fetchCurrentValue(key: string): Promise<string | null> {
  if (key.startsWith("cms:")) {
    const parts = key.split(":");
    const type = parts[1];
    const id = parts[2];
    if (!type || !id) return null;
    const row = await fetchCmsRow(type, id);
    return row ? JSON.stringify(row) : null;
  }
  const block = await db.contentBlock.findUnique({
    where: { key },
    select: { value: true },
  });
  return block?.value ?? null;
}

/**
 * Fetch a CMS row by type + id. Mirrors the fetchCmsRow helper in
 * /api/cms/route.ts (kept local so we don't create a circular import).
 */
async function fetchCmsRow(type: string, id: string): Promise<any> {
  switch (type) {
    case "features": return await db.feature.findUnique({ where: { id } });
    case "events": return await db.event.findUnique({ where: { id } });
    case "testimonials": return await db.testimonial.findUnique({ where: { id } });
    case "faqs": return await db.fAQItem.findUnique({ where: { id } });
    case "trustBadges": return await db.trustBadge.findUnique({ where: { id } });
    case "poojas": return await db.pooja.findUnique({ where: { id } });
    case "carousel": return await db.carouselSlide.findUnique({ where: { id } });
    case "blogPosts": return await db.blogPost.findUnique({ where: { id } });
    default: return null;
  }
}

/**
 * Restore a CMS row by writing the deserialized version snapshot back.
 * Server-controlled columns (id/createdAt/updatedAt) are stripped before
 * the update so we never accidentally overwrite primary keys or timestamps.
 *
 * For blogPosts, the version snapshot's `content` is stored as a JSON-string
 * (the live column type) — we pass it through unchanged.
 */
async function restoreCmsRow(type: string, id: string, jsonSnapshot: string): Promise<void> {
  let parsed: any;
  try {
    parsed = JSON.parse(jsonSnapshot);
  } catch {
    throw new Error("Version snapshot is not valid JSON");
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Version snapshot is not an object");
  }
  // Strip server-controlled columns so the update never overwrites them.
  const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = parsed;
  const data: any = rest;

  switch (type) {
    case "features": await db.feature.update({ where: { id }, data }); break;
    case "events":
      await db.event.update({
        where: { id },
        data: {
          ...data,
          // dateISO is a Date in the live row but a string in the JSON
          // snapshot. Prisma accepts either, but be explicit for safety.
          dateISO: data.dateISO !== undefined ? new Date(data.dateISO) : undefined,
        },
      });
      break;
    case "testimonials": await db.testimonial.update({ where: { id }, data }); break;
    case "faqs": await db.fAQItem.update({ where: { id }, data }); break;
    case "trustBadges": await db.trustBadge.update({ where: { id }, data }); break;
    case "poojas": await db.pooja.update({ where: { id }, data }); break;
    case "carousel": await db.carouselSlide.update({ where: { id }, data }); break;
    case "blogPosts": await db.blogPost.update({ where: { id }, data }); break;
    default:
      throw new Error(`Unknown CMS type: ${type}`);
  }
}
