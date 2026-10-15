"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, RefreshCw, Search, Trash2, Copy, ExternalLink, Filter,
  Upload as UploadIcon, Loader2, ImageIcon, AlertTriangle, CheckCircle2,
  X, CheckSquare, Square, Check,
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

// Bucket options shown in the Upload modal dropdown
const UPLOAD_BUCKETS = BUCKETS.filter((b) => b.key !== "all");

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
// STORAGE USAGE BAR
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
// UPLOAD MODAL — file picker + preview + bucket selector + progress
// ────────────────────────────────────────────────────────────────────
function UploadModal({
  open,
  onClose,
  onUploaded,
}: {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [bucket, setBucket] = useState<string>("misc");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate / revoke object URL preview
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setFile(null);
      setBucket("misc");
      setPreview("");
      setUploading(false);
      setDragOver(false);
    }
  }, [open]);

  const handleFile = (f: File) => {
    // Validate before showing preview
    const okTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!okTypes.includes(f.type.toLowerCase())) {
      toast.error(`Unsupported type: ${f.type || "unknown"}. Allowed: JPG, PNG, WebP, GIF.`);
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error(`File too large: ${(f.size / 1024 / 1024).toFixed(2)} MB. Max: 5 MB.`);
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", bucket);
    try {
      const r = await fetch("/api/upload", { method: "POST", body: formData });
      const j = await r.json();
      if (j.error) {
        toast.error(j.error);
      } else {
        toast.success(`Uploaded ${j.filename} · ${formatBytes(j.size)}`);
        onUploaded();
        onClose();
      }
    } catch (e) {
      toast.error("Network error during upload");
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 grid place-items-center bg-ink/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl border border-champagne/20 bg-ink-card p-6 shadow-luxe-lg"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-serif text-lg text-ivory">Upload Image</p>
              <p className="text-[10px] uppercase tracking-wider text-ivory/40">JPG · PNG · WebP · GIF · max 5 MB</p>
            </div>
            <button
              onClick={onClose}
              disabled={uploading}
              className="grid h-8 w-8 place-items-center rounded-full border border-champagne/15 text-ivory/60 hover:bg-champagne/10 hover:text-ivory"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Drop zone / file picker */}
          {!file ? (
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handleFile(f);
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors",
                dragOver
                  ? "border-champagne bg-champagne/10"
                  : "border-champagne/20 bg-ink-soft hover:border-champagne/40 hover:bg-champagne/5"
              )}
            >
              <UploadIcon className="h-8 w-8 text-champagne/60" />
              <p className="mt-2 text-sm text-ivory/70">Drop file here or click to browse</p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-ivory/30">
                JPG · PNG · WebP · GIF · max 5 MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </label>
          ) : (
            <div className="space-y-3">
              {/* Preview */}
              <div className="relative overflow-hidden rounded-xl border border-champagne/15 bg-ink-soft">
                <img
                  src={preview}
                  alt={file.name}
                  className="mx-auto max-h-48 w-auto object-contain"
                />
              </div>

              {/* File info */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <p className="truncate font-mono text-ivory/70" title={file.name}>
                  {file.name}
                </p>
                <span className="text-ivory/40">{formatBytes(file.size)}</span>
              </div>

              {/* Bucket selector */}
              <div>
                <p className="mb-1.5 text-[10px] uppercase tracking-wider text-ivory/50">
                  Categorize as
                </p>
                <div className="flex flex-wrap gap-1">
                  {UPLOAD_BUCKETS.map((b) => (
                    <button
                      key={b.key}
                      onClick={() => setBucket(b.key)}
                      disabled={uploading}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors disabled:opacity-50",
                        bucket === b.key
                          ? "border border-champagne/25 bg-champagne/10 text-champagne"
                          : "border border-ivory/10 text-ivory/50 hover:bg-champagne/5 hover:text-ivory"
                      )}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFile(null)}
                  disabled={uploading}
                  className="flex-1 rounded-full border border-ivory/15 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-ivory/60 hover:bg-ivory/5"
                >
                  Choose different
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn-luxe flex-1"
                >
                  {uploading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                  ) : (
                    <><UploadIcon className="h-4 w-4" /> Upload</>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ────────────────────────────────────────────────────────────────────
// BULK DELETE CONFIRMATION MODAL
// ────────────────────────────────────────────────────────────────────
type BulkDeletePlan = {
  toDelete: Upload[];
  toSkip: Upload[]; // referenced files user chose to skip
};

function BulkDeleteModal({
  plan,
  open,
  onClose,
  onConfirm,
  onDeleteOne,
}: {
  plan: BulkDeletePlan | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (force: boolean) => void;
  onDeleteOne: (id: string) => void; // for individual skip toggle
}) {
  if (!plan || !open) return null;
  const total = plan.toDelete.length + plan.toSkip.length;
  const hasRefs = plan.toSkip.length > 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 grid place-items-center bg-ink/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-2xl border border-champagne/20 bg-ink-card p-6 shadow-luxe-lg"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full border border-rose-400/30 bg-rose-500/10">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
            </div>
            <div>
              <p className="font-serif text-lg text-ivory">Delete {total} image{total > 1 ? "s" : ""}?</p>
              <p className="text-[10px] uppercase tracking-wider text-ivory/40">This cannot be undone</p>
            </div>
          </div>

          {hasRefs && (
            <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
              <p className="text-sm text-amber-400">
                <AlertTriangle className="mr-1 inline h-4 w-4" />
                {plan.toSkip.length} of {total} selected image{plan.toSkip.length > 1 ? "s are" : " is"} referenced on the live site — deleting will break those pages.
              </p>
              <div className="mt-2 max-h-32 overflow-y-auto space-y-1 text-xs">
                {plan.toSkip.slice(0, 10).map((u) => (
                  <div key={u.id} className="flex items-center gap-2 text-ivory/60">
                    <span className="truncate">{u.filename}</span>
                    <span className="text-amber-400">({u.refCount} ref{u.refCount > 1 ? "s" : ""})</span>
                  </div>
                ))}
                {plan.toSkip.length > 10 && (
                  <p className="text-ivory/40">…and {plan.toSkip.length - 10} more</p>
                )}
              </div>
            </div>
          )}

          <div className="mb-4 text-sm text-ivory/70">
            {plan.toDelete.length > 0 ? (
              <p>
                <CheckCircle2 className="mr-1 inline h-4 w-4 text-emerald-400" />
                {plan.toDelete.length} unreferenced image{plan.toDelete.length > 1 ? "s" : ""} will be deleted from Vercel Blob.
              </p>
            ) : (
              <p className="text-ivory/50">All selected images are referenced. You can force-delete them anyway, but pages will show broken images.</p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-full border border-ivory/15 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-ivory/60 hover:bg-ivory/5"
            >
              Cancel
            </button>
            {plan.toDelete.length > 0 && (
              <button
                onClick={() => onConfirm(false)}
                className="flex-1 rounded-full bg-rose-500/20 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-rose-300 hover:bg-rose-500/30"
              >
                Delete {plan.toDelete.length} unreferenced
              </button>
            )}
            <button
              onClick={() => onConfirm(true)}
              className="flex-1 rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-rose-400 hover:bg-rose-500/25"
            >
              Force delete all {total}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ────────────────────────────────────────────────────────────────────
// UPLOAD CARD — single thumbnail in the grid
// ────────────────────────────────────────────────────────────────────
function UploadCard({
  upload,
  onDelete,
  selectMode,
  isSelected,
  onToggleSelect,
}: {
  upload: Upload;
  onDelete: (u: Upload) => void;
  selectMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(upload.url);
      toast.success("URL copied to clipboard");
    } catch {
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
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "card-luxe group overflow-hidden p-0 transition-all",
        selectMode && isSelected && "ring-2 ring-champagne"
      )}
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

        {/* Select-mode checkbox (top-left) */}
        {selectMode && (
          <button
            onClick={() => onToggleSelect(upload.id)}
            className={cn(
              "absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-md border backdrop-blur-sm transition-colors",
              isSelected
                ? "border-champagne bg-champagne text-ink"
                : "border-ivory/30 bg-ink/60 text-ivory/60 hover:border-champagne hover:text-champagne"
            )}
          >
            {isSelected ? <Check className="h-4 w-4" /> : <Square className="h-3.5 w-3.5" />}
          </button>
        )}

        {/* Ref warning badge */}
        {upload.refCount > 0 && (
          <div className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
            <AlertTriangle className="h-2.5 w-2.5" />
            {upload.refCount} ref{upload.refCount > 1 ? "s" : ""}
          </div>
        )}

        {/* Hover overlay with actions — only when NOT in select mode */}
        {!selectMode && (
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
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Selection state for bulk delete
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeletePlan, setBulkDeletePlan] = useState<BulkDeletePlan | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0, current: "" });

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

  // ── Selection handlers ──────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelectedIds(new Set(filtered.map((u) => u.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    clearSelection();
  };

  // ── Single delete (existing flow, kept for non-select-mode) ──────
  const handleDelete = async (upload: Upload) => {
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
      // Remove from selection if it was selected
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(upload.id);
        return next;
      });
      await load();
    } catch (err: any) {
      toast.error(err?.message || "Delete failed");
    }
  };

  // ── Bulk delete flow ─────────────────────────────────────────────
  const startBulkDelete = () => {
    const selected = uploads.filter((u) => selectedIds.has(u.id));
    if (selected.length === 0) return;

    // Split into referenced (skip-by-default) and unreferenced (delete-by-default)
    const toSkip = selected.filter((u) => u.refCount > 0);
    const toDelete = selected.filter((u) => u.refCount === 0);
    setBulkDeletePlan({ toDelete, toSkip });
  };

  const confirmBulkDelete = async (force: boolean) => {
    if (!bulkDeletePlan) return;
    setBulkDeleting(true);
    setBulkDeletePlan(null); // close modal

    // Build the final list to delete
    const targets = force
      ? [...bulkDeletePlan.toDelete, ...bulkDeletePlan.toSkip]
      : bulkDeletePlan.toDelete;

    if (targets.length === 0) {
      toast.info("Nothing to delete — all selected images are referenced. Use 'Force delete' to override.");
      setBulkDeleting(false);
      return;
    }

    setBulkProgress({ done: 0, total: targets.length, current: targets[0]?.filename || "" });

    let ok = 0;
    let fail = 0;
    for (let i = 0; i < targets.length; i++) {
      const u = targets[i];
      setBulkProgress({ done: i, total: targets.length, current: u.filename });
      try {
        const url = force
          ? `/api/upload/${u.id}?force=1`
          : `/api/upload/${u.id}`;
        const r = await fetch(url, { method: "DELETE" });
        if (r.ok) ok++;
        else fail++;
      } catch {
        fail++;
      }
    }

    setBulkProgress({ done: targets.length, total: targets.length, current: "" });
    setBulkDeleting(false);
    clearSelection();
    await load();

    if (fail === 0) {
      toast.success(`Deleted ${ok} image${ok > 1 ? "s" : ""}`);
    } else {
      toast.error(`${ok} deleted, ${fail} failed — see logs`);
    }
  };

  const selectedCount = selectedIds.size;

  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow="Admin"
        icon={FileText}
        title={<>Media <GoldFoilText>Library</GoldFoilText></>}
        subtitle="Browse, search, upload, and manage every image in Vercel Blob. Bulk-delete orphans, copy URLs, monitor storage budget."
        crumbs={[
          { label: "Home", route: "/" },
          { label: "Admin", route: "/admin" },
          { label: "Media" },
        ]}
      />

      <section className="bg-ink py-12">
        <div className="container-x">
          {/* Top bar: storage + upload action */}
          <div className="mb-6 grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <StorageBar summary={summary} />
            </div>
            <div className="card-luxe flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-serif text-base text-ivory">Upload</p>
                <p className="text-[10px] uppercase tracking-wider text-ivory/40">
                  Goes to Vercel Blob CDN
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-luxe"
                title="Open upload dialog"
              >
                <UploadIcon className="h-4 w-4" /> Upload Image
              </button>
            </div>
          </div>

          {/* Sticky toolbar */}
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

            {/* Select mode toggle */}
            <button
              onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
              className={cn(
                "grid h-10 w-10 place-items-center rounded-full border transition-colors",
                selectMode
                  ? "border-champagne bg-champagne/15 text-champagne"
                  : "border-champagne/20 text-champagne hover:bg-champagne/10"
              )}
              title={selectMode ? "Exit select mode" : "Enter select mode"}
            >
              {selectMode ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
            </button>

            <button
              onClick={load}
              disabled={loading}
              className="grid h-10 w-10 place-items-center rounded-full border border-champagne/20 text-champagne hover:bg-champagne/10"
              title="Refresh"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </button>
          </div>

          {/* Select-mode sub-toolbar */}
          <AnimatePresence>
            {selectMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-champagne/15 bg-ink-soft/50 p-3">
                  <p className="text-xs text-ivory/60">
                    {selectedCount > 0
                      ? `${selectedCount} selected`
                      : "Click thumbnails to select"}
                  </p>
                  <div className="flex-1" />
                  <button
                    onClick={selectAllVisible}
                    disabled={filtered.length === 0}
                    className="text-[10px] uppercase tracking-wider text-ivory/60 hover:text-champagne disabled:opacity-30"
                  >
                    Select all visible ({filtered.length})
                  </button>
                  <button
                    onClick={clearSelection}
                    disabled={selectedCount === 0}
                    className="text-[10px] uppercase tracking-wider text-ivory/60 hover:text-champagne disabled:opacity-30"
                  >
                    Clear
                  </button>
                  <button
                    onClick={exitSelectMode}
                    className="text-[10px] uppercase tracking-wider text-ivory/60 hover:text-champagne"
                  >
                    Exit select mode
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
                  ? "Upload your first image to get started."
                  : "No files match your search or filter."}
              </p>
              {uploads.length === 0 && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="btn-luxe mt-5"
                >
                  <UploadIcon className="h-4 w-4" /> Upload your first image
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              <AnimatePresence>
                {filtered.map((u) => (
                  <UploadCard
                    key={u.id}
                    upload={u}
                    onDelete={handleDelete}
                    selectMode={selectMode}
                    isSelected={selectedIds.has(u.id)}
                    onToggleSelect={toggleSelect}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* Floating bulk action bar */}
      <AnimatePresence>
        {selectMode && selectedCount > 0 && !bulkDeleting && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2"
          >
            <div className="flex items-center gap-3 rounded-full border border-champagne/25 bg-ink-card/95 px-4 py-2.5 shadow-luxe-lg backdrop-blur-md">
              <p className="text-xs text-ivory">
                <span className="font-mono text-champagne">{selectedCount}</span> selected
              </p>
              <div className="h-4 w-px bg-ivory/20" />
              <button
                onClick={startBulkDelete}
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-400 hover:text-rose-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete {selectedCount} selected
              </button>
              <div className="h-4 w-px bg-ivory/20" />
              <button
                onClick={clearSelection}
                className="text-[10px] uppercase tracking-wider text-ivory/60 hover:text-ivory"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk delete progress overlay */}
      <AnimatePresence>
        {bulkDeleting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-ink/80 backdrop-blur-sm p-4"
          >
            <div className="w-full max-w-sm rounded-2xl border border-champagne/20 bg-ink-card p-6 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-champagne" />
              <p className="mt-3 font-serif text-lg text-ivory">Deleting…</p>
              <p className="mt-1 text-xs text-ivory/50">
                {bulkProgress.done} / {bulkProgress.total}
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ivory/10">
                <div
                  className="h-full bg-champagne transition-all"
                  style={{
                    width: `${bulkProgress.total > 0 ? (bulkProgress.done / bulkProgress.total) * 100 : 0}%`,
                  }}
                />
              </div>
              {bulkProgress.current && (
                <p className="mt-2 truncate font-mono text-[10px] text-ivory/40">
                  {bulkProgress.current}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <UploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploaded={load}
      />
      <BulkDeleteModal
        plan={bulkDeletePlan}
        open={!!bulkDeletePlan}
        onClose={() => setBulkDeletePlan(null)}
        onConfirm={confirmBulkDelete}
        onDeleteOne={() => {}}
      />
    </div>
  );
}
