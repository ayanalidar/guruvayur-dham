"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, CalendarDays, FileText, BedDouble, Radio,
  TrendingUp, Users, IndianRupee, Activity, RefreshCw, ArrowLeft,
} from "lucide-react";
import { useHashRoute } from "@/lib/router";
import { fetchStats } from "@/lib/api-client";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText } from "@/components/site/visuals";
import { cn } from "@/lib/utils";

const CHANNEL_COLORS: Record<string, string> = {
  DIRECT: "from-champagne to-gold-deep",
  WALKIN: "from-saffron to-maroon",
  BOOKING_COM: "from-blue-500 to-blue-700",
  MAKEMYTRIP: "from-red-500 to-red-700",
  GOIBIBO: "from-green-500 to-green-700",
  AGODA: "from-purple-500 to-purple-700",
};
const CHANNEL_LABELS: Record<string, string> = {
  DIRECT: "Direct Website", WALKIN: "Walk-in",
  BOOKING_COM: "Booking.com", MAKEMYTRIP: "MakeMyTrip",
  GOIBIBO: "Goibibo", AGODA: "Agoda",
};

export default function AdminDashboard() {
  const { navigate } = useHashRoute();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setStats(await fetchStats());
    setLoading(false);
  };
  useEffect(() => {
    let active = true;
    fetchStats().then((s) => {
      if (active) {
        setStats(s);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow="Admin Dashboard"
        icon={LayoutDashboard}
        title={<>Guruvayur Dham <GoldFoilText>Control Center</GoldFoilText></>}
        subtitle="Real-time view of bookings, channel sync, and inventory across all distribution channels."
        crumbs={[{ label: "Home", route: "/" }, { label: "Admin" }]}
      />
      <section className="bg-ink py-12 lg:py-16">
        <div className="container-x">
          <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <AdminNavCard icon={CalendarDays} label="All Bookings" desc="View & manage" onClick={() => navigate("/admin/bookings")} />
            <AdminNavCard icon={FileText} label="Edit Content" desc="All site text" onClick={() => navigate("/admin/content")} />
            <AdminNavCard icon={BedDouble} label="Manage Rooms" desc="Prices & availability" onClick={() => navigate("/admin/rooms")} />
            <AdminNavCard icon={Radio} label="Channel Partners" desc="Sync & webhooks" onClick={() => navigate("/admin/channels")} />
            <AdminNavCard icon={RefreshCw} label="Refresh Stats" desc="Reload data" onClick={load} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={BedDouble} label="Total Rooms" value={stats?.totalRooms ?? "—"} sub={`${stats?.liveAvailability?.totalUnits ?? "—"} total units`} />
            <StatCard icon={CalendarDays} label="Active Bookings" value={stats?.activeBookings ?? "—"} sub={`${stats?.bookingsNext7 ?? "—"} arriving in 7 days`} />
            <StatCard icon={TrendingUp} label="Occupancy Today" value={`${stats?.liveAvailability?.occupancyRate ?? 0}%`} sub={`${stats?.liveAvailability?.totalUnitsAvailable ?? 0} units available`} />
            <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${(stats?.totalRevenue ?? 0).toLocaleString("en-IN")}`} sub="All-time confirmed" />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="card-luxe p-6">
              <h3 className="flex items-center gap-2 font-serif text-xl text-ivory"><Activity className="h-5 w-5 text-champagne" /> Today's Activity</h3>
              <div className="mt-4 space-y-3">
                <ActivityRow icon={Users} color="green" label="Arriving Today" value={stats?.arrivingToday ?? 0} />
                <ActivityRow icon={ArrowLeft} color="orange" label="Checking Out Today" value={stats?.checkingOutToday ?? 0} />
                <ActivityRow icon={RefreshCw} color="champagne" label="Channel Syncs (24h)" value={stats?.recentSyncs ?? 0} />
              </div>
            </div>
            <div className="card-luxe p-6 lg:col-span-2">
              <h3 className="flex items-center gap-2 font-serif text-xl text-ivory"><Radio className="h-5 w-5 text-champagne" /> Bookings by Channel</h3>
              <div className="mt-4 space-y-2">
                {(stats?.channelStats || []).map((c: any) => {
                  const total = stats?.channelStats?.reduce((s: number, x: any) => s + x.count, 0) || 1;
                  const pct = Math.round((c.count / total) * 100);
                  return (
                    <div key={c.source} className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-ivory">{CHANNEL_LABELS[c.source] || c.source}</span>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-ivory/60">{c.count} bookings</span>
                          <span className="font-semibold text-gold-foil">₹{c.revenue.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={cn("h-full rounded-full bg-gradient-to-r", CHANNEL_COLORS[c.source] || "from-champagne to-gold")}
                        />
                      </div>
                    </div>
                  );
                })}
                {(!stats?.channelStats || stats.channelStats.length === 0) && <p className="text-sm text-ivory/50">No bookings yet.</p>}
              </div>
            </div>
          </div>

          <div className="mt-8 card-luxe p-6">
            <h3 className="flex items-center gap-2 font-serif text-xl text-ivory"><BedDouble className="h-5 w-5 text-champagne" /> Live Availability — Today</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(stats?.liveAvailability?.rooms || []).map((r: any) => (
                <div key={r.room.slug} className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
                  <p className="text-sm font-semibold text-ivory">{r.room.name}</p>
                  <p className="text-xs text-ivory/50">{r.room.type}</p>
                  <p className="mt-2 font-serif text-2xl text-gold-foil">{r.available}</p>
                  <p className="text-[10px] uppercase tracking-wider text-ivory/40">units available</p>
                </div>
              ))}
              {(!stats?.liveAvailability?.rooms || stats.liveAvailability.rooms.length === 0) && <p className="text-sm text-ivory/50">No rooms available today.</p>}
            </div>
          </div>

          {loading && (
            <div className="mt-8 text-center text-sm text-ivory/50">
              <RefreshCw className="mx-auto h-5 w-5 animate-spin" /> Loading stats…
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function AdminNavCard({ icon: Icon, label, desc, onClick }: any) {
  return (
    <button onClick={onClick} className="card-luxe group flex items-center gap-3 p-4 text-left transition-all hover:shadow-luxe-lg">
      <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl border border-champagne/20 bg-gradient-to-br from-champagne/15 to-transparent text-champagne transition-transform group-hover:scale-110">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ivory">{label}</p>
        <p className="truncate text-xs text-ivory/50">{desc}</p>
      </div>
    </button>
  );
}

function StatCard({ icon: Icon, label, value, sub }: any) {
  return (
    <div className="card-luxe p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ivory/50">{label}</p>
          <p className="mt-1 font-serif text-3xl text-gold-foil">{value}</p>
          <p className="mt-1 text-xs text-ivory/50">{sub}</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-champagne/15 bg-gradient-to-br from-champagne/15 to-transparent text-champagne">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

function ActivityRow({ icon: Icon, color, label, value }: any) {
  const colorMap: Record<string, string> = {
    green: "bg-green-500/15 text-green-300",
    orange: "bg-orange-500/15 text-orange-300",
    champagne: "bg-champagne/15 text-champagne",
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-champagne/10 bg-ink/50 p-4">
      <div className={cn("grid h-10 w-10 place-items-center rounded-lg", colorMap[color])}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-ivory/50">{label}</p>
        <p className="font-serif text-2xl text-ivory">{value}</p>
      </div>
    </div>
  );
}
