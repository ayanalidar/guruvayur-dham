"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon, Plus, Trash2, Check, X, RefreshCw,
  Wifi, WifiOff, Search, ShieldCheck, Globe, Server, MessageSquare,
  CreditCard, BarChart3, Mail, ExternalLink, AlertCircle, Zap,
} from "lucide-react";
import { useHashRoute } from "@/lib/router";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText } from "@/components/site/visuals";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { key: "OTA", label: "Travel Channels (OTAs)", icon: Globe },
  { key: "CHANNEL_MANAGER", label: "Channel Managers", icon: Server },
  { key: "HOSTING", label: "Hosting & Infrastructure", icon: Server },
  { key: "MESSAGING", label: "Messaging (WhatsApp/SMS)", icon: MessageSquare },
  { key: "PAYMENT", label: "Payment Gateways", icon: CreditCard },
  { key: "ANALYTICS", label: "Analytics & SEO", icon: BarChart3 },
  { key: "EMAIL", label: "Email Services", icon: Mail },
];

const CATEGORY_COLORS: Record<string, string> = {
  OTA: "text-blue-300 bg-blue-500/15",
  CHANNEL_MANAGER: "text-purple-300 bg-purple-500/15",
  HOSTING: "text-green-300 bg-green-500/15",
  MESSAGING: "text-green-300 bg-green-500/15",
  PAYMENT: "text-yellow-300 bg-yellow-500/15",
  ANALYTICS: "text-orange-300 bg-orange-500/15",
  EMAIL: "text-cyan-300 bg-cyan-500/15",
};

export default function SettingsPage() {
  const { navigate } = useHashRoute();
  const [configs, setConfigs] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("OTA");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ apiKey: "", apiSecret: "", hotelId: "", apiEndpoint: "", webhookUrl: "" });
  const [showAdd, setShowAdd] = useState(false);
  const [newPartner, setNewPartner] = useState({ code: "", name: "", category: "OTA" });

  // SEO state
  const [seoData, setSeoData] = useState<any>(null);
  const [seoRunning, setSeoRunning] = useState(false);

  const load = () => {
    fetch("/api/channel-config", { cache: "no-store" })
      .then(r => r.json())
      .then(j => setConfigs(j.configs || []));
    fetch("/api/seo-audit", { cache: "no-store" })
      .then(r => r.json())
      .then(j => setSeoData(j));
  };
  useEffect(() => { load(); }, []);

  const filtered = configs.filter(c => {
    if (activeCategory && c.category !== activeCategory) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const saveConfig = async (id: string) => {
    const data: any = {};
    if (editForm.apiKey) data.apiKey = editForm.apiKey;
    if (editForm.apiSecret) data.apiSecret = editForm.apiSecret;
    if (editForm.hotelId) data.hotelId = editForm.hotelId;
    if (editForm.apiEndpoint) data.apiEndpoint = editForm.apiEndpoint;
    if (editForm.webhookUrl) data.webhookUrl = editForm.webhookUrl;

    await fetch("/api/channel-config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, data }),
    });
    toast.success("API credentials saved");
    setEditingId(null);
    setEditForm({ apiKey: "", apiSecret: "", hotelId: "", apiEndpoint: "", webhookUrl: "" });
    load();
  };

  const testConnection = async (id: string) => {
    toast.info("Testing connection…");
    const r = await fetch("/api/channel-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const j = await r.json();
    if (j.success) toast.success(j.message);
    else toast.error(j.message);
    load();
  };

  const deleteConfig = async (id: string) => {
    if (!confirm("Remove this channel partner?")) return;
    await fetch(`/api/channel-config?id=${id}`, { method: "DELETE" });
    toast.success("Channel removed");
    load();
  };

  const addPartner = async () => {
    if (!newPartner.code || !newPartner.name) {
      toast.error("Code and name required");
      return;
    }
    const r = await fetch("/api/channel-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPartner),
    });
    const j = await r.json();
    if (j.error) toast.error(j.error);
    else {
      toast.success("Partner added");
      setShowAdd(false);
      setNewPartner({ code: "", name: "", category: "OTA" });
      load();
    }
  };

  const runSeoAudit = async () => {
    setSeoRunning(true);
    toast.info("Running SEO audit — checking base HTML, SPA routes, sitemap, robots.txt, manifest…");
    try {
      const r = await fetch("/api/seo-audit", { method: "POST" });
      const j = await r.json();
      if (j.error) {
        toast.error(j.error);
      } else {
        toast.success(
          `SEO audit complete · ${j.audited} items · avg ${j.avgScore}/100 · ${j.totalIssues} issue${j.totalIssues === 1 ? "" : "s"} found`
        );
        load();
      }
    } catch (e: any) {
      toast.error(`Audit failed: ${e.message}`);
    }
    setSeoRunning(false);
  };

  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow="Admin Settings"
        icon={SettingsIcon}
        title={<>Unified <GoldFoilText>Settings</GoldFoilText></>}
        subtitle="Manage all channel partners, API keys, hosting, messaging, payments, and SEO from one place. Add any partner, configure credentials, test connections."
        crumbs={[{ label: "Home", route: "/" }, { label: "Admin", route: "/admin" }, { label: "Settings" }]}
      />

      <section className="bg-ink py-12">
        <div className="container-x">
          {/* SEO Quick Action Bar */}
          <div className="mb-8 rounded-2xl border border-champagne/15 bg-ink-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl border border-orange-500/20 bg-orange-500/10">
                  <Zap className="h-6 w-6 text-orange-300" />
                </span>
                <div>
                  <p className="font-serif text-lg text-ivory">SEO Optimization</p>
                  <p className="text-xs text-ivory/50">
                    {seoData ? `Last audit: ${seoData.total} pages, avg score ${seoData.avgScore}/100` : "No audit run yet"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={runSeoAudit} disabled={seoRunning} className="btn-luxe text-xs">
                  {seoRunning ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Running…</> : <><Zap className="h-3.5 w-3.5" /> Run SEO Audit</>}
                </button>
              </div>
            </div>

            {/* SEO scores + issues */}
            {seoData && seoData.audits && seoData.audits.length > 0 && (
              <div className="mt-4 space-y-3">
                {/* Summary line */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-ivory/60">
                  <span><strong className="text-ivory">{seoData.total}</strong> audits</span>
                  <span>Avg score: <strong className={cn((seoData.avgScore || 0) >= 80 ? "text-green-300" : (seoData.avgScore || 0) >= 50 ? "text-yellow-300" : "text-red-300")}>{seoData.avgScore}/100</strong></span>
                  <span>Total issues: <strong className="text-red-300">{seoData.audits.reduce((s: number, a: any) => s + (a.issues ? JSON.parse(a.issues).length : 0), 0)}</strong></span>
                </div>

                {/* Per-page score cards */}
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {seoData.audits.slice(0, 14).map((a: any, i: number) => {
                    const issues: string[] = a.issues ? (() => { try { return JSON.parse(a.issues); } catch { return []; } })() : [];
                    return (
                      <details key={i} className="group rounded-lg border border-champagne/10 bg-ink/50 p-3 text-left">
                        <summary className="cursor-pointer list-none">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-[11px] font-medium text-ivory/70">{a.page}</p>
                            <p className={cn("font-serif text-lg leading-none", a.score >= 80 ? "text-green-300" : a.score >= 50 ? "text-yellow-300" : "text-red-300")}>
                              {a.score}
                            </p>
                          </div>
                          {issues.length > 0 && (
                            <p className="mt-1 text-[10px] text-ivory/40">
                              {issues.length} issue{issues.length === 1 ? "" : "s"} · click to expand
                            </p>
                          )}
                          {issues.length === 0 && (
                            <p className="mt-1 text-[10px] text-green-300/60">All checks passed</p>
                          )}
                        </summary>
                        {issues.length > 0 && (
                          <ul className="mt-2 space-y-1 border-t border-champagne/10 pt-2">
                            {issues.map((iss: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-1.5 text-[10px] text-ivory/60">
                                <AlertCircle className="mt-0.5 h-2.5 w-2.5 flex-shrink-0 text-orange-300" />
                                <span>{iss}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </details>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Category tabs */}
          <div className="mb-4 flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                  activeCategory === cat.key
                    ? "border border-champagne/30 bg-champagne/15 text-champagne"
                    : "border border-champagne/10 text-ivory/60 hover:bg-champagne/5"
                )}
              >
                <cat.icon className="h-3 w-3" /> {cat.label}
              </button>
            ))}
          </div>

          {/* Search + Add */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-full border border-champagne/15 bg-ink/50 px-4 py-2">
              <Search className="h-4 w-4 text-ivory/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search partners…"
                className="flex-1 bg-transparent text-sm text-ivory placeholder:text-ivory/40 focus:outline-none"
              />
            </div>
            <button onClick={() => setShowAdd(!showAdd)} className="btn-luxe text-xs whitespace-nowrap">
              <Plus className="h-3.5 w-3.5" /> Add Partner
            </button>
          </div>

          {/* Add partner form */}
          {showAdd && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-4 overflow-hidden">
              <div className="card-luxe p-5">
                <h3 className="font-serif text-lg text-ivory">Add New Channel Partner</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <input value={newPartner.code} onChange={(e) => setNewPartner({ ...newPartner, code: e.target.value.toUpperCase() })} placeholder="Code (e.g. NEW_OTA)" className="rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" />
                  <input value={newPartner.name} onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })} placeholder="Name (e.g. New OTA)" className="rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" />
                  <select value={newPartner.category} onChange={(e) => setNewPartner({ ...newPartner, category: e.target.value })} className="rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:outline-none">
                    {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={addPartner} className="btn-luxe text-xs">Add</button>
                  <button onClick={() => setShowAdd(false)} className="btn-ghost-luxe text-xs">Cancel</button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Partner cards */}
          <div className="space-y-3">
            {filtered.map((c) => (
              <div key={c.id} className="card-luxe p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className={cn("grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg text-xs font-bold", CATEGORY_COLORS[c.category] || "bg-ink/50 text-ivory/60")}>
                      {c.code.slice(0, 2)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-ivory">{c.name}</p>
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", c.connected ? "bg-green-500/15 text-green-300" : "bg-ivory/10 text-ivory/40")}>
                          {c.connected ? (
                            <span className="flex items-center gap-1"><Wifi className="h-2.5 w-2.5" /> Connected</span>
                          ) : (
                            <span className="flex items-center gap-1"><WifiOff className="h-2.5 w-2.5" /> Not Connected</span>
                          )}
                        </span>
                        <span className="rounded-full bg-ink/50 px-2 py-0.5 text-[10px] text-ivory/40">{c.category}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-ivory/50">
                        Code: <code className="font-mono text-champagne">{c.code}</code>
                        {c.apiKey && <span className="ml-3">Key: <code className="font-mono text-champagne">{c.apiKey}</code></span>}
                        {c.hotelId && <span className="ml-3">Hotel ID: <code className="font-mono text-champagne">{c.hotelId}</code></span>}
                      </p>
                      {c.lastSyncMessage && (
                        <p className={cn("mt-1 text-xs", c.lastSyncStatus === "SUCCESS" ? "text-green-300" : "text-red-300")}>
                          {c.lastSyncStatus}: {c.lastSyncMessage}
                          {c.lastSyncAt && <span className="text-ivory/40"> · {new Date(c.lastSyncAt).toLocaleString("en-IN")}</span>}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 gap-1.5">
                    {editingId === c.id ? (
                      <>
                        <button onClick={() => saveConfig(c.id)} className="rounded-full bg-green-500/15 px-3 py-1 text-[10px] font-semibold text-green-300 hover:bg-green-500/25">
                          <Check className="h-3 w-3" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="rounded-full bg-red-500/15 px-3 py-1 text-[10px] font-semibold text-red-300">
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditingId(c.id); setEditForm({ apiKey: "", apiSecret: "", hotelId: c.hotelId || "", apiEndpoint: c.apiEndpoint || "", webhookUrl: c.webhookUrl || "" }); }} className="rounded-full border border-champagne/20 px-3 py-1 text-[10px] font-semibold text-champagne hover:bg-champagne/10">
                          Configure
                        </button>
                        {c.connected && (
                          <button onClick={() => testConnection(c.id)} className="rounded-full border border-champagne/20 px-3 py-1 text-[10px] font-semibold text-champagne hover:bg-champagne/10">
                            Test
                          </button>
                        )}
                        <button onClick={() => deleteConfig(c.id)} className="rounded-full bg-red-500/10 px-3 py-1 text-[10px] font-semibold text-red-300 hover:bg-red-500/20">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Edit form */}
                {editingId === c.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 overflow-hidden">
                    <div className="grid gap-3 rounded-lg border border-champagne/10 bg-ink/30 p-4 sm:grid-cols-2">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-ivory/50">API Key</label>
                        <input type="password" value={editForm.apiKey} onChange={(e) => setEditForm({ ...editForm, apiKey: e.target.value })} placeholder="Enter API key" className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-ivory/50">API Secret</label>
                        <input type="password" value={editForm.apiSecret} onChange={(e) => setEditForm({ ...editForm, apiSecret: e.target.value })} placeholder="Enter API secret" className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-ivory/50">Hotel/Property ID</label>
                        <input value={editForm.hotelId} onChange={(e) => setEditForm({ ...editForm, hotelId: e.target.value })} placeholder="e.g. 123456" className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-ivory/50">API Endpoint</label>
                        <input value={editForm.apiEndpoint} onChange={(e) => setEditForm({ ...editForm, apiEndpoint: e.target.value })} placeholder="https://api.partner.com" className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] uppercase tracking-wider text-ivory/50">Webhook URL (where they send bookings to us)</label>
                        <input value={editForm.webhookUrl} onChange={(e) => setEditForm({ ...editForm, webhookUrl: e.target.value })} placeholder="https://guruvayurdham.com/api/channel-inbox" className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" />
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-ivory/40">
                      💡 When you get API credentials from {c.name}, enter them here and click Test. The system will automatically sync inventory and receive bookings.
                    </p>
                  </motion.div>
                )}
              </div>
            ))}
            {filtered.length === 0 && <p className="py-8 text-center text-sm text-ivory/50">No partners in this category. Click "Add Partner" to add one.</p>}
          </div>

          {/* Summary stats */}
          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
              <p className="text-[10px] uppercase tracking-wider text-ivory/50">Total Partners</p>
              <p className="font-serif text-2xl text-gold-foil">{configs.length}</p>
            </div>
            <div className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
              <p className="text-[10px] uppercase tracking-wider text-ivory/50">Connected</p>
              <p className="font-serif text-2xl text-green-300">{configs.filter(c => c.connected).length}</p>
            </div>
            <div className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
              <p className="text-[10px] uppercase tracking-wider text-ivory/50">Not Connected</p>
              <p className="font-serif text-2xl text-yellow-300">{configs.filter(c => !c.connected).length}</p>
            </div>
            <div className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
              <p className="text-[10px] uppercase tracking-wider text-ivory/50">SEO Score</p>
              <p className={cn("font-serif text-2xl", (seoData?.avgScore || 0) >= 80 ? "text-green-300" : (seoData?.avgScore || 0) >= 50 ? "text-yellow-300" : "text-red-300")}>
                {seoData?.avgScore || 0}/100
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
