"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FileText, RefreshCw, Search, Trash2, Copy, ExternalLink, Filter,
  Upload as UploadIcon, Loader2, ImageIcon, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { useHashRoute } from "@/lib/router";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText } from "@/components/site/visuals";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// ────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────
type Upload = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadedFrom: string;
  uploadedByName: string | null;
  refCount: number;
  createdAt: string;
};

type Summary = {
  totalFiles: number;
  totalBytes: number;
  totalMB: string;
  quotaBytes: number;
  quotaLabel: string;
};

// ────────────────────────────────────────────────────────────────────
// CONSTANTS
// ────────────────────────────────────────────────────────────────────
const BUCKETS = [
  { key: "all", label: "All" },
  { key: "content", label: "Content" },
  { key: "rooms", label: "Rooms" },
  { key: "poojas", label: "Poojas" },
  { key: "blog", label: "Blog" },
  { key: "gallery", label: "Gallery" },
  { key: "events", label: "Events" },
  { key: "misc", label: "Misc" },
] as const;

// ────────────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────────────
function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(2)} MB`;
  return `${(b / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso.slice(0, 10);
  }
}

function getBucketColor(bucket: string): string {
  const map: Record<string, string> = {
    content: "bg-champagne/15 text-champagne border-champagne/30",
    rooms: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    poojas: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    blog: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    gallery: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    events: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    misc: "bg-ivory/10 text-ivory/60 border-ivory/20",
  };
  return map[bucket] || map.misc;
}

// ────────────────────────────────────────────────────────────────────
// STORAGE USAGE BAR — visual indicator of how much of the 1 GB
// Hobby plan is used. Green under 70%, amber 70-90%, red over 90%.
// ────────────────────────────────────────────────────────────────────
function StorageBar({ summary }: { summary: Summary | null }) {
  if (!summary) return null;
  const used = summary.totalBytes;
  const quota = summary.quotaBytes;
  const pct = Math.min(100, (used / quota) * 100);
  const colorClass =
    pct >= 90 ? "bg-rose-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";
  const label = pct >= 90 ? "Almost full — upgrade to Vercel Pro" : pct >= 70 ? "Getting full — clean up orphans" : "Healthy";

  return (
    <div className="card-luxe p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="font-serif text-base text-ivory">Storage Usage</p>
          <p className="text-[10px] uppercase tracking-wider text-ivory/40">{summary.quotaLabel}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm text-champagne">
            {formatBytes(used)} <span className="text-ivory/40">/ {formatBytes(quota)}</span>
          </p>
          <p className="text-[10px] uppercase tracking-wider text-ivory/40">{summary.totalFiles} files</p>
        </div>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-ivory/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={cn("absolute left-0 top-0 h-full rounded-full", colorClass)}
        />
      </div>
      <p className="mt-1.5 text-[10px] uppercase tracking-wider text-ivory/50">
        {pct.toFixed(1)}% used · {label}
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// UPLOAD CARD — single thumbnail in the grid
// ────────────────────────────────────────────────────────────────────
function UploadCard({
  upload,
  onDelete,
}: {
  upload: Upload;
  onDelete: (u: Upload) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(upload.url);
      toast.success("URL copied to clipboard");
    } catch {
      // Fallback for non-secure contexts
      const ta = document.createElement("textarea");
      ta.value = upload.url;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        toast.success("URL copied to clipboard");
      } catch {
        toast.error("Couldn't copy — copy manually");
      }
      document.body.removeChild(ta);
    }
  };

  const handleOpenUrl = () => {
    window.open(upload.url, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-luxe group overflow-hidden p-0"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-soft">
        {imgError ? (
          <div className="flex h-full w-full flex-col items-center justify-center text-ivory/30">
            <ImageIcon className="h-8 w-8" />
            <p className="mt-1 text-[10px] uppercase tracking-wider">Preview failed</p>
          </div>
        ) : (
          <img
            src={upload.url}
            alt={upload.filename}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}

        {/* Hover overlay with actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <button
            onClick={handleCopyUrl}
            title="Copy URL"
            className="grid h-9 w-9 place-items-center rounded-full border border-champagne/30 bg-ink-soft/80 text-champagne hover:bg-champagne/20"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={handleOpenUrl}
            title="Open in new tab"
            className="grid h-9 w-9 place-items-center rounded-full border border-champagne/30 bg-ink-soft/80 text-champagne hover:bg-champagne/20"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(upload)}
            disabled={deleting}
            title="Delete"
            className="grid h-9 w-9 place-items-center rounded-full border border-rose-400/30 bg-ink-soft/80 text-rose-400 hover:bg-rose-400/20 disabled:opacity-50"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Ref warning badge */}
        {upload.refCount > 0 && (
          <div className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
            <AlertTriangle className="h-2.5 w-2.5" />
            {upload.refCount} ref{upload.refCount > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="p-3">
        <p className="truncate font-mono text-xs text-ivory" title={upload.filename}>
          {upload.filename}
        </p>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              getBucketColor(upload.uploadedFrom)
            )}
          >
            {upload.uploadedFrom}
          </span>
          <span className="text-[10px] text-ivory/40">{formatBytes(upload.size)}</span>
        </div>
        <p className="mt-1 text-[10px] text-ivory/40">
          {formatDate(upload.createdAt)}
          {upload.uploadedByName ? ` · ${upload.uploadedByName}` : ""}
        </p>
      </div>
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ────────────────────────────────────────────────────────────────────
export default function AdminMedia() {
  const { navigate } = useHashRoute();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [bucket, setBucket] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/upload", { cache: "no-store" });
      if (!r.ok) {
        toast.error("Failed to load media");
        return;
      }
      const j = await r.json();
      setUploads(j.uploads || []);
      setSummary(j.summary || null);
    } catch {
      toast.error("Network error loading media");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = uploads.filter((u) => {
    if (bucket !== "all" && u.uploadedFrom !== bucket) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!u.filename.toLowerCase().includes(q) && !u.url.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleDelete = async (upload: Upload) => {
    // First, attempt without force — server may return 409 with references
    const confirm1 = window.confirm(
      `Delete "${upload.filename}"?\n\n` +
      (upload.refCount > 0
        ? `⚠️  This file is referenced ${upload.refCount} time(s) on the live site. Deleting it may break those pages.`
        : "This will permanently delete the file from Vercel Blob storage."
      ) +
      "\n\nThis cannot be undone."
    );
    if (!confirm1) return;

    try {
      const r = await fetch(`/api/upload/${upload.id}`, { method: "DELETE" });

      if (r.status === 409) {
        // File is referenced — show the references and ask for force-delete
        const j = await r.json();
        const refList = (j.references || [])
          .slice(0, 8)
          .map((ref: any) => `  • ${ref.table}: ${ref.key}`)
          .join("\n");
        const more = j.references.length > 8 ? `\n  ...and ${j.references.length - 8} more` : "";
        const force = window.confirm(
          `This file is referenced in ${j.references.length} place(s):\n\n${refList}${more}\n\n` +
          `Delete anyway? This WILL break those pages — the image will show as a broken icon.`
        );
        if (!force) return;
        // Retry with force=1
        const r2 = await fetch(`/api/upload/${upload.id}?force=1`, { method: "DELETE" });
        if (!r2.ok) {
          const e = await r2.json().catch(() => ({}));
          throw new Error(e.error || `HTTP ${r2.status}`);
        }
      } else if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || `HTTP ${r.status}`);
      }

      toast.success(`Deleted ${upload.filename}`);
      // Refresh list
      await load();
    } catch (err: any) {
      toast.error(err?.message || "Delete failed");
    }
  };

  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow="Admin"
        icon={FileText}
        title={<>Media <GoldFoilText>Library</GoldFoilText></>}
        subtitle="Browse, search, and manage every image uploaded to Vercel Blob. Delete orphans, copy URLs, monitor storage budget."
        crumbs={[
          { label: "Home", route: "/" },
          { label: "Admin", route: "/admin" },
          { label: "Media" },
        ]}
      />

      <section className="bg-ink py-12">
        <div className="container-x">
          {/* Top bar: storage + actions */}
          <div className="mb-6 grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <StorageBar summary={summary} />
            </div>
            <div className="card-luxe flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-serif text-base text-ivory">Quick Upload</p>
                <p className="text-[10px] uppercase tracking-wider text-ivory/40">
                  Goes to <span className="text-champagne">/admin/content</span>
                </p>
              </div>
              <button
                onClick={() => navigate("/admin/content")}
                className="btn-luxe"
                title="Go to Content editor to upload images"
              >
                <UploadIcon className="h-4 w-4" /> Upload
              </button>
            </div>
          </div>

          {/* Sticky toolbar: search + filter + refresh */}
          <div className="sticky top-20 z-30 mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-champagne/15 bg-ink-soft/90 p-4 backdrop-blur-md">
            <div className="flex flex-1 items-center gap-2">
              <Search className="h-4 w-4 text-ivory/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by filename or URL…"
                className="flex-1 bg-transparent text-sm text-ivory placeholder:text-ivory/40 focus:outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-[10px] uppercase text-ivory/50 hover:text-ivory"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-ivory/40" />
              <div className="flex flex-wrap gap-1">
                {BUCKETS.map((b) => (
                  <button
                    key={b.key}
                    onClick={() => setBucket(b.key)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors",
                      bucket === b.key
                        ? "border border-champagne/25 bg-champagne/10 text-champagne"
                        : "text-ivory/50 hover:bg-champagne/5 hover:text-ivory"
                    )}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={load}
              disabled={loading}
              className="grid h-10 w-10 place-items-center rounded-full border border-champagne/20 text-champagne hover:bg-champagne/10"
              title="Refresh"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </button>
          </div>

          {/* Result count */}
          <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-wider text-ivory/40">
            <p>
              {loading
                ? "Loading…"
                : `Showing ${filtered.length} of ${uploads.length} files`}
            </p>
            {filtered.length > 0 && (
              <p className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                Vercel Blob connected
              </p>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card-luxe overflow-hidden p-0">
                  <div className="aspect-[4/3] w-full animate-pulse bg-ivory/5" />
                  <div className="space-y-2 p-3">
                    <div className="h-3 w-3/4 animate-pulse rounded bg-ivory/5" />
                    <div className="h-2 w-1/2 animate-pulse rounded bg-ivory/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card-luxe grid place-items-center p-16 text-center">
              <div className="mb-3 grid h-12 w-12 place-items-center rounded-full border border-champagne/15 bg-ink-soft">
                <ImageIcon className="h-6 w-6 text-ivory/30" />
              </div>
              <p className="font-serif text-lg text-ivory">No images found</p>
              <p className="mt-1 text-sm text-ivory/50">
                {uploads.length === 0
                  ? "Upload your first image from the Content editor."
                  : "No files match your search or filter."}
              </p>
              {uploads.length === 0 && (
                <button onClick={() => navigate("/admin/content")} className="btn-luxe mt-5">
                  <UploadIcon className="h-4 w-4" /> Go to Content editor
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((u) => (
                <UploadCard key={u.id} upload={u} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
