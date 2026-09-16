import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { getSetting } from "@/lib/settings";

/**
 * Database Backup API
 *
 * GET  /api/backup   — list existing backup files (Vercel Blob or local fs)
 * POST /api/backup   — create a new backup (pg_dump via child_process)
 *
 * Both MANAGER-only.
 *
 * Runtime detection:
 *   - On Vercel serverless (process.env.VERCEL === "1"), POST returns 503
 *     with instructions because pg_dump isn't available in the serverless
 *     runtime and you can't easily shell out to docker compose. GET still
 *     works if BLOB_READ_WRITE_TOKEN is set (lists Vercel Blob entries).
 *
 *   - On a self-hosted VPS (the canonical deploy target — see deploy.sh),
 *     both GET and POST work against the local filesystem.
 */

const execFileAsync = promisify(execFile);

const BACKUP_DIR = process.env.BACKUP_DIR
  || path.join(process.cwd(), "backups");

// Vercel Blob lazily imported only when needed (so the route doesn't crash
// in environments without @vercel/blob — e.g. tests or VPS deploys without
// the blob token configured).
async function listVercelBlobBackups() {
  const token = await getSetting("BLOB_READ_WRITE_TOKEN");
  if (!token) return [];
  // Dynamic import — the package is a runtime dependency so this is safe.
  const { list } = await import("@vercel/blob");
  const { blobs } = await list({ prefix: "backups/" });
  return blobs.map((b) => ({
    name: b.pathname.replace(/^\/?backups\//, ""),
    size: b.size,
    uploadedAt: b.uploadedAt,
    url: b.url,
    source: "vercel-blob" as const,
  }));
}

async function listLocalBackups() {
  try {
    // turbopackIgnore: suppress Vercel's "dynamic filesystem access" warning
    // (this code only runs on VPS, not Vercel serverless)
    const entries = await readdir(/*turbopackIgnore: true*/ BACKUP_DIR);
    const backups: Array<{
      name: string;
      size: number;
      uploadedAt: string;
      source: "local";
    }> = [];
    for (const name of entries) {
      // Only show likely backup files — anything matching backup-*.sql(.gz)?
      // deploy.sh produces "backup-YYYYMMDD-HHMMSS.sql.gz" files.
      if (!/^backup-.*\.sql(\.gz|\.bak)?$/i.test(name) && name.endsWith(".sql")) {
        continue;
      }
      try {
        const s = await stat(/*turbopackIgnore: true*/ path.join(BACKUP_DIR, name));
        backups.push({
          name,
          size: s.size,
          uploadedAt: s.mtime.toISOString(),
          source: "local",
        });
      } catch {
        // stat failed — skip
      }
    }
    return backups.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  } catch {
    return [];
  }
}

/**
 * GET /api/backup
 * Lists existing backups. On self-hosted: reads BACKUP_DIR/*.sql(.gz).
 * On Vercel: reads from Vercel Blob (if token configured).
 */
export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req, ["MANAGER"]);
  if (error) return error;

  const isVercel = process.env.VERCEL === "1";
  const token = await getSetting("BLOB_READ_WRITE_TOKEN");
  let backups: any[] = [];

  try {
    if (isVercel || token) {
      backups = backups.concat(await listVercelBlobBackups());
    }
    if (!isVercel) {
      backups = backups.concat(await listLocalBackups());
    }
  } catch (e: any) {
    return NextResponse.json(
      { error: "Failed to list backups", message: e?.message || "unknown" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    backups,
    runtime: isVercel ? "vercel-serverless" : "self-hosted",
    backupDir: isVercel ? null : BACKUP_DIR,
  });
}

const CreateBackupSchema = z.object({
  // Optional label appended to the filename — useful for "pre-migration"
  // or "manual" backups.
  label: z.string().max(50).optional(),
});

/**
 * POST /api/backup
 * Spawns pg_dump + gzip to create a timestamped .sql.gz backup.
 *
 * On Vercel serverless: returns 503 — pg_dump isn't available and you can't
 * shell out to docker. Operator should trigger backups via the VPS deploy
 * script (`./deploy.sh backup`) or a Vercel Cron hitting a self-hosted
 * webhook.
 *
 * On self-hosted: requires the `pg_dump` binary on PATH (or set
 * PG_DUMP_PATH env var), and the standard Postgres env vars
 * (POSTGRES_URL / DATABASE_URL / PGHOST / PGPORT / PGUSER / PGPASSWORD).
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requireStaff(req, ["MANAGER"]);
  if (error || !session) {
    return error || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Reject on Vercel — explain why.
  if (process.env.VERCEL === "1") {
    return NextResponse.json(
      {
        error: "Backup creation not available on Vercel serverless",
        instructions:
          "pg_dump isn't available in the serverless runtime. Run `./deploy.sh backup` on the VPS, " +
          "or set up a Vercel Cron that calls a self-hosted /backup webhook. Vercel Blob uploads of " +
          "manually-created backups will still appear in the GET /api/backup listing.",
      },
      { status: 503 },
    );
  }

  const parsed = CreateBackupSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { label } = parsed.data;

  // Resolve DB connection details. Prefer DATABASE_URL (Prisma standard);
  // fall back to component env vars that pg_dump understands natively.
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return NextResponse.json(
      { error: "DATABASE_URL not set — cannot run pg_dump" },
      { status: 500 },
    );
  }

  // Filename: backup-YYYYMMDD-HHMMSS[-label].sql.gz
  const ts = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15); // 20260101-120000
  const safeLabel = label ? `-${label.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 50)}` : "";
  const filename = `backup-${ts}${safeLabel}.sql.gz`;
  const filepath = path.join(BACKUP_DIR, filename);

  // pg_dump accepts a connection string via --dbname="postgresql://..."
  // and writes to stdout. We pipe through gzip on the JS side to avoid
  // needing gzip on PATH (Node has zlib built in — but spawning gzip
  // directly is simpler and keeps the binary stream untouched).
  const pgDumpPath = process.env.PG_DUMP_PATH || "pg_dump";
  const gzipPath = process.env.GZIP_PATH || "gzip";

  try {
    // Ensure the backups directory exists. We use fs.mkdir via child_process
    // equivalent — actually Node fs.mkdir is fine.
    const { mkdir } = await import("node:fs/promises");
    await mkdir(BACKUP_DIR, { recursive: true });

    // Shell out: pg_dump "<DATABASE_URL>" | gzip > filepath
    // We do this as a single shell pipeline via /bin/sh so we don't have
    // to manually plumb stdout between two execFile calls.
    const { exec } = await import("node:child_process");
    const execAsync = promisify(exec);
    await execAsync(
      `"${pgDumpPath}" --no-owner --no-privileges --clean --if-exists "${databaseUrl}" | "${gzipPath}" > "${filepath}"`,
      { maxBuffer: 1024 * 1024 * 1024 }, // 1GB cap on stdout buffering — should be plenty for a hotel DB
    );

    // Stat the result so we can return size.
    const s = await stat(filepath);

    // Audit-log the backup creation.
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const ua = req.headers.get("user-agent") || "unknown";
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name || null,
        action: "CREATE",
        entity: "BACKUP",
        entityId: filename,
        details: JSON.stringify({ filename, size: s.size, path: filepath }),
        ipAddress: ip,
        userAgent: ua,
      },
    });

    return NextResponse.json({
      ok: true,
      backup: {
        name: filename,
        size: s.size,
        uploadedAt: s.mtime.toISOString(),
        source: "local",
        path: filepath,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        error: "Backup failed",
        message: e?.message || "unknown error",
        // Include stderr if available — helps debugging pg_dump failures.
        stderr: e?.stderr || null,
      },
      { status: 500 },
    );
  }
}

// Avoid unused-import warnings for nodes we don't directly call.
void execFileAsync;
