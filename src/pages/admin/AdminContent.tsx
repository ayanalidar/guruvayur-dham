"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, RefreshCw, Save, Check, Search, RotateCcw,
} from "lucide-react";
import { useHashRoute } from "@/lib/router";
import { fetchContent, updateContent } from "@/lib/api-client";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText } from "@/components/site/visuals";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const CATEGORIES = [
  { key: "site", label: "Site Settings" },
  { key: "hero", label: "Hero Section" },
  { key: "whyChooseUs", label: "Why Choose Us" },
  { key: "rooms", label: "Rooms Section" },
  { key: "pooja", label: "Pooja Section" },
  { key: "about", label: "About Section" },
  { key: "contact", label: "Contact Section" },
  { key: "events", label: "Events Section" },
  { key: "blog", label: "Blog Section" },
  { key: "testimonials", label: "Testimonials Section" },
  { key: "faq", label: "FAQ Section" },
  { key: "gallery", label: "Gallery Section" },
  { key: "darshan", label: "Plan Your Darshan" },
  { key: "footer", label: "Footer" },
];

export default function AdminContent() {
  const { navigate } = useHashRoute();
  const [blocks, setBlocks] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("site");

  const load = async () => {
    const r = await fetch("/api/content", { cache: "no-store" });
    const j = await r.json();
    setBlocks(j.blocks || []);
    const d: Record<string, string> = {};
    for (const b of j.blocks || []) d[b.key] = b.value;
    setDrafts(d);
    setLoading(false);
  };
  useEffect(() => {
    let active = true;
    fetch("/api/content", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (!active) return;
        setBlocks(j.blocks || []);
        const d: Record<string, string> = {};
        for (const b of j.blocks || []) d[b.key] = b.value;
        setDrafts(d);
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const filtered = blocks.filter((b) => {
    if (b.category !== category) return false;
    if (search && !b.key.toLowerCase().includes(search.toLowerCase()) && !b.label?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const isDirty = (key: string) => drafts[key] !== blocks.find((b) => b.key === key)?.value;

  const save = async () => {
    const updates = Object.keys(drafts)
      .filter((k) => isDirty(k))
      .map((k) => ({ key: k, value: drafts[k] }));
    if (updates.length === 0) {
      toast.info("No changes to save");
      return;
    }
    setSaving(true);
    try {
      await updateContent(updates);
      toast.success(`Saved ${updates.length} change${updates.length > 1 ? "s" : ""}. Visible on the website now.`);
      await load();
    } catch (e) {
      toast.error("Failed to save changes");
    }
    setSaving(false);
  };

  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow="Admin"
        icon={FileText}
        title={<>Edit <GoldFoilText>Site Content</GoldFoilText></>}
        subtitle="Every piece of text on the website is editable here. Changes go live instantly after saving."
        crumbs={[{ label: "Home", route: "/" }, { label: "Admin", route: "/admin" }, { label: "Content" }]}
      />

      <section className="bg-ink py-12">
        <div className="container-x">
          {/* Sticky toolbar */}
          <div className="sticky top-20 z-30 mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-champagne/15 bg-ink-soft/90 p-4 backdrop-blur-md">
            <div className="flex flex-1 items-center gap-2">
              <Search className="h-4 w-4 text-ivory/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search content blocks…"
                className="flex-1 bg-transparent text-sm text-ivory placeholder:text-ivory/40 focus:outline-none"
              />
            </div>
            <button onClick={load} className="grid h-10 w-10 place-items-center rounded-full border border-champagne/20 text-champagne hover:bg-champagne/10">
              <RefreshCw className="h-4 w-4" />
            </button>
            <button onClick={save} disabled={saving} className="btn-luxe">
              {saving ? <><RefreshCw className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save Changes</>}
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            {/* Category sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-44 space-y-1">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setCategory(c.key)}
                    className={cn(
                      "block w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all",
                      category === c.key
                        ? "border border-champagne/25 bg-champagne/10 text-champagne"
                        : "text-ivory/60 hover:bg-champagne/5 hover:text-ivory"
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content editor */}
            <div className="lg:col-span-3">
              <div className="space-y-4">
                {filtered.map((b) => {
                  const dirty = isDirty(b.key);
                  const isLong = b.value.length > 100 || b.value.includes("\n");
                  return (
                    <div key={b.key} className={cn("card-luxe p-5", dirty && "border-champagne/40")}>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div>
                          <p className="font-serif text-base text-ivory">{b.label || b.key}</p>
                          <p className="font-mono text-[10px] text-ivory/40">{b.key}</p>
                        </div>
                        {dirty && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-saffron/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-saffron">
                            <span className="h-1.5 w-1.5 rounded-full bg-saffron" /> Unsaved
                          </span>
                        )}
                      </div>
                      {isLong ? (
                        <Textarea
                          value={drafts[b.key] || ""}
                          onChange={(e) => setDrafts({ ...drafts, [b.key]: e.target.value })}
                          rows={Math.min(8, Math.max(3, b.value.split("\n").length + 1))}
                          className="resize-y"
                        />
                      ) : (
                        <Input
                          value={drafts[b.key] || ""}
                          onChange={(e) => setDrafts({ ...drafts, [b.key]: e.target.value })}
                        />
                      )}
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="card-luxe p-12 text-center text-ivory/50">
                    {loading ? "Loading…" : "No content blocks in this category."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
