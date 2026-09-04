"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Radio, RefreshCw, Activity, CheckCircle2, XCircle, Wifi, WifiOff,
  Building2, Clock, ArrowRight,
} from "lucide-react";
import { useHashRoute } from "@/lib/router";
import { fetchChannelPartners, fetchSyncLogs } from "@/lib/api-client";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText } from "@/components/site/visuals";
import { cn } from "@/lib/utils";

const CHANNEL_META: Record<string, { color: string; gradient: string; logo: string }> = {
  BOOKING_COM: { color: "text-blue-400", gradient: "from-blue-500 to-blue-700", logo: "B.com" },
  MAKEMYTRIP: { color: "text-red-400", gradient: "from-red-500 to-red-700", logo: "MMT" },
  GOIBIBO: { color: "text-green-400", gradient: "from-green-500 to-green-700", logo: "GI" },
  AGODA: { color: "text-purple-400", gradient: "from-purple-500 to-purple-700", logo: "AG" },
};

const ACTION_LABELS: Record<string, string> = {
  BLOCK: "Inventory Blocked",
  UNBLOCK: "Inventory Released",
  BOOKING_RECEIVED: "Booking Received",
  SYNC_ERROR: "Sync Error",
};

export default function AdminChannels() {
  const { navigate } = useHashRoute();
  const [partners, setPartners] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [p, l] = await Promise.all([
      fetchChannelPartners(),
      fetchSyncLogs(undefined, 100),
    ]);
    setPartners(p);
    setLogs(l);
    setLoading(false);
  };
  useEffect(() => {
    let active = true;
    Promise.all([
      fetchChannelPartners(),
      fetchSyncLogs(undefined, 100),
    ]).then(([p, l]) => {
      if (!active) return;
      setPartners(p);
      setLogs(l);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const toggleConnect = async (code: string, connected: boolean) => {
    await fetch("/api/channel-partners", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, connected }),
    });
    load();
  };

  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow="Admin"
        icon={Radio}
        title={<>Channel <GoldFoilText>Manager</GoldFoilText></>}
        subtitle="Two-way sync with Booking.com, MakeMyTrip, Goibibo, and Agoda. Every booking — direct, walk-in, or from a channel — instantly blocks inventory on all other channels."
        crumbs={[{ label: "Home", route: "/" }, { label: "Admin", route: "/admin" }, { label: "Channels" }]}
      />

      <section className="bg-ink py-12">
        <div className="container-x">
          {/* Channel partner cards */}
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-serif text-2xl text-ivory">Connected Channels</h2>
            <button onClick={load} className="grid h-10 w-10 place-items-center rounded-full border border-champagne/20 text-champagne hover:bg-champagne/10">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {partners.map((p) => {
              const meta = CHANNEL_META[p.code] || { color: "text-champagne", gradient: "from-champagne to-gold-deep", logo: p.code.slice(0, 2) };
              return (
                <div key={p.code} className="card-luxe p-5">
                  <div className="flex items-start justify-between">
                    <div className={cn("grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br font-serif text-sm font-bold text-white", meta.gradient)}>
                      {meta.logo}
                    </div>
                    {p.connected ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-green-300">
                        <Wifi className="h-3 w-3" /> Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-300">
                        <WifiOff className="h-3 w-3" /> Off
                      </span>
                    )}
                  </div>
                  <p className="mt-3 font-serif text-lg text-ivory">{p.name}</p>
                  <div className="mt-3 space-y-1 text-xs text-ivory/60">
                    <p className="flex items-center justify-between"><span>Bookings</span><span className="font-semibold text-ivory">{p.bookingCount}</span></p>
                    <p className="flex items-center justify-between"><span>Revenue</span><span className="font-semibold text-gold-foil">₹{p.totalRevenue.toLocaleString("en-IN")}</span></p>
                    <p className="flex items-center justify-between"><span>Syncs (7d)</span><span className="font-semibold text-ivory">{p.syncsLast7Days}</span></p>
                    <p className="flex items-center justify-between"><span>Last sync</span><span className="font-semibold text-ivory">{p.lastSyncAt ? new Date(p.lastSyncAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}</span></p>
                  </div>
                  <button
                    onClick={() => toggleConnect(p.code, !p.connected)}
                    className={cn(
                      "mt-4 w-full rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                      p.connected
                        ? "border border-red-500/30 text-red-300 hover:bg-red-500/10"
                        : "btn-luxe"
                    )}
                  >
                    {p.connected ? "Disconnect" : "Connect"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* How sync works */}
          <div className="mt-8 rounded-2xl border border-champagne/15 bg-ink-card p-6">
            <h3 className="font-serif text-xl text-ivory">How Two-Way Sync Works</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
                <div className="mb-2 flex items-center gap-2 text-champagne">
                  <Building2 className="h-5 w-5" />
                  <span className="text-xs uppercase tracking-wider">1. Booking Made</span>
                </div>
                <p className="text-sm text-ivory/70">A guest books via any source — direct website, walk-in front desk, or any channel partner.</p>
              </div>
              <div className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
                <div className="mb-2 flex items-center gap-2 text-champagne">
                  <ArrowRight className="h-5 w-5" />
                  <span className="text-xs uppercase tracking-wider">2. Auto-Broadcast</span>
                </div>
                <p className="text-sm text-ivory/70">Our system instantly calls every other channel partner's API to mark those dates as sold out.</p>
              </div>
              <div className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
                <div className="mb-2 flex items-center gap-2 text-champagne">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-xs uppercase tracking-wider">3. Inventory Locked</span>
                </div>
                <p className="text-sm text-ivory/70">No double-bookings possible — the room is shown as unavailable on Booking.com, MakeMyTrip, Goibibo, and Agoda simultaneously.</p>
              </div>
            </div>
          </div>

          {/* Sync log */}
          <div className="mt-8">
            <h2 className="mb-4 flex items-center gap-2 font-serif text-2xl text-ivory">
              <Activity className="h-5 w-5 text-champagne" /> Sync Audit Log
            </h2>
            <div className="card-luxe overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto scroll-smooth-dark">
                {logs.map((log, i) => {
                  const meta = CHANNEL_META[log.channel] || { color: "text-champagne", gradient: "from-champagne to-gold-deep", logo: log.channel.slice(0, 2) };
                  return (
                    <div key={log.id} className={cn("flex items-start gap-3 p-4", i > 0 && "border-t border-champagne/5")}>
                      <div className={cn("grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-gradient-to-br font-serif text-[10px] font-bold text-white", meta.gradient)}>
                        {meta.logo}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-ivory">{log.message}</p>
                          <span className="flex-shrink-0 text-[10px] text-ivory/40">
                            {new Date(log.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px]">
                          <span className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold uppercase tracking-wider",
                            log.status === "SUCCESS" && "bg-green-500/15 text-green-300",
                            log.status === "FAILED" && "bg-red-500/15 text-red-300",
                            log.status === "PENDING" && "bg-yellow-500/15 text-yellow-300"
                          )}>
                            {log.status === "SUCCESS" ? <CheckCircle2 className="h-2.5 w-2.5" /> : <XCircle className="h-2.5 w-2.5" />}
                            {log.status}
                          </span>
                          <span className="rounded-full bg-ink/50 px-2 py-0.5 text-ivory/60">{ACTION_LABELS[log.action] || log.action}</span>
                          {log.booking && (
                            <span className="rounded-full bg-ink/50 px-2 py-0.5 font-mono text-champagne/80">{log.booking.reference}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {logs.length === 0 && (
                  <div className="p-12 text-center text-ivory/50">{loading ? "Loading…" : "No sync logs yet."}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
