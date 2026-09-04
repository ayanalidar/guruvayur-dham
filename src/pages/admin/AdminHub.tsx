"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, CalendarDays, FileText, BedDouble, Radio, Settings,
  Users, Utensils, Flame, Tag, TrendingUp, Building2, Image, BookOpen,
  Wrench, Receipt, Download, Bell, Bot, CloudSun, MapPin, Star, ShoppingCart,
  RefreshCw, Check, X, Plus, Phone, Mail, ExternalLink, AlertCircle,
  ShieldCheck, Lock,
} from "lucide-react";
import { useHashRoute } from "@/lib/router";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText, MagneticButton } from "@/components/site/visuals";
import LiveActivityFeed from "@/components/site/LiveActivityFeed";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SECTIONS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, route: "/admin" },
  { key: "bookings", label: "Bookings", icon: CalendarDays, route: "/admin/bookings" },
  { key: "crm", label: "CRM", icon: Users },
  { key: "housekeeping", label: "Housekeeping", icon: BedDouble },
  { key: "kitchen", label: "Kitchen", icon: Utensils },
  { key: "poojas", label: "Pooja Bookings", icon: Flame },
  { key: "pricing", label: "Pricing & Coupons", icon: TrendingUp },
  { key: "agents", label: "Travel Agents", icon: Building2 },
  { key: "content", label: "Content", icon: FileText, route: "/admin/content" },
  { key: "rooms", label: "Rooms", icon: BedDouble, route: "/admin/rooms" },
  { key: "channels", label: "Channels", icon: Radio, route: "/admin/channels" },
  { key: "blog", label: "Blog CMS", icon: BookOpen },
  { key: "gallery", label: "Gallery CMS", icon: Image },
  { key: "maintenance", label: "Maintenance", icon: Wrench },
  { key: "invoices", label: "Invoices", icon: Receipt },
  { key: "audit", label: "Night Audit", icon: Star },
  { key: "exports", label: "Exports", icon: Download },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "reviews", label: "Reviews", icon: Star },
  { key: "analytics", label: "Analytics", icon: TrendingUp },
  { key: "security", label: "Security", icon: ShieldCheck },
  { key: "chatbot", label: "AI Chatbot", icon: Bot },
  { key: "weather", label: "Weather & Crowd", icon: CloudSun },
  { key: "staff", label: "Staff", icon: Settings },
];

export default function AdminHub() {
  const { navigate } = useHashRoute();
  const [active, setActive] = useState("dashboard");
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    let active_ = true;
    fetch("/api/stats", { cache: "no-store" }).then(r => r.json()).then(s => {
      if (active_) setStats(s);
    });
    return () => { active_ = false; };
  }, []);

  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow="Admin Hub"
        icon={Settings}
        title={<>Complete <GoldFoilText>Operations Center</GoldFoilText></>}
        subtitle="Every feature — bookings, CRM, housekeeping, kitchen, poojas, pricing, content, channels, invoices, audits, and more — in one place."
        crumbs={[{ label: "Home", route: "/" }, { label: "Admin Hub" }]}
      />

      <section className="bg-ink py-12">
        <div className="container-x">
          {/* Section tabs */}
          <div className="mb-8 flex gap-1.5 overflow-x-auto no-scrollbar pb-2">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => {
                  if (s.route) navigate(s.route);
                  else setActive(s.key);
                }}
                className={cn(
                  "flex flex-shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all",
                  active === s.key && !s.route
                    ? "border border-champagne/30 bg-champagne/15 text-champagne"
                    : "border border-champagne/10 text-ivory/60 hover:border-champagne/25 hover:text-ivory"
                )}
              >
                <s.icon className="h-3.5 w-3.5" />
                {s.label}
              </button>
            ))}
          </div>

          {/* Section content */}
          <div className="card-luxe min-h-[400px] p-6">
            {active === "dashboard" && <DashboardSection stats={stats} />}
            {active === "crm" && <CRMSection />}
            {active === "housekeeping" && <HousekeepingSection />}
            {active === "kitchen" && <KitchenSection />}
            {active === "poojas" && <PoojaSection />}
            {active === "pricing" && <PricingSection />}
            {active === "agents" && <AgentsSection />}
            {active === "blog" && <BlogCMSSection />}
            {active === "gallery" && <GalleryCMSSection />}
            {active === "maintenance" && <MaintenanceSection />}
            {active === "invoices" && <InvoicesSection />}
            {active === "audit" && <AuditSection />}
            {active === "exports" && <ExportsSection />}
            {active === "notifications" && <NotificationsSection />}
            {active === "reviews" && <ReviewsSection />}
            {active === "analytics" && <AnalyticsSection />}
            {active === "security" && <SecuritySection />}
            {active === "chatbot" && <ChatbotSection />}
            {active === "weather" && <WeatherSection />}
            {active === "staff" && <StaffSection />}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============ DASHBOARD ============ */
function DashboardSection({ stats }: any) {
  return (
    <div>
      <h2 className="font-serif text-2xl text-ivory">Quick Overview</h2>
      <p className="mt-1 text-sm text-ivory/60">Live snapshot of your property. Click any tab above to dive deeper.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Rooms", value: stats?.totalRooms ?? "—", icon: BedDouble, sub: `${stats?.liveAvailability?.totalUnits ?? 0} units` },
          { label: "Active Bookings", value: stats?.activeBookings ?? "—", icon: CalendarDays, sub: `${stats?.bookingsNext7 ?? 0} in 7 days` },
          { label: "Occupancy Today", value: `${stats?.liveAvailability?.occupancyRate ?? 0}%`, icon: TrendingUp, sub: `${stats?.liveAvailability?.totalUnitsAvailable ?? 0} available` },
          { label: "Total Revenue", value: `₹${(stats?.totalRevenue ?? 0).toLocaleString("en-IN")}`, icon: Star, sub: "all-time" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
            <s.icon className="h-5 w-5 text-champagne" />
            <p className="mt-2 text-[10px] uppercase tracking-wider text-ivory/50">{s.label}</p>
            <p className="font-serif text-2xl text-gold-foil">{s.value}</p>
            <p className="text-xs text-ivory/50">{s.sub}</p>
          </div>
        ))}
      </div>
      {/* Live Activity Feed — real-time WebSocket */}
      <div className="mt-6">
        <LiveActivityFeed />
      </div>
      <div className="mt-6 rounded-xl border border-champagne/10 bg-ink/50 p-4 text-sm text-ivory/70">
        <AlertCircle className="mr-2 inline h-4 w-4 text-champagne" />
        <strong className="text-ivory">Live:</strong> New bookings, kitchen orders, channel syncs, and housekeeping updates appear in the feed above in real-time — no refresh needed.
      </div>
    </div>
  );
}

/* ============ CRM ============ */
function CRMSection() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  useEffect(() => {
    fetch(`/api/customers${search ? `?search=${encodeURIComponent(search)}` : ""}`, { cache: "no-store" })
      .then(r => r.json())
      .then(j => setCustomers(j.customers || []));
  }, [search]);
  return (
    <div>
      <h2 className="font-serif text-2xl text-ivory">Customer Relationship Management</h2>
      <p className="mt-1 text-sm text-ivory/60">Track every guest — booking history, revenue, loyalty points, tags.</p>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, phone, email, city…"
        className="mt-4 w-full rounded-xl border border-champagne/15 bg-ink/50 px-4 py-2.5 text-sm text-ivory placeholder:text-ivory/40 focus:border-champagne/40 focus:outline-none"
      />
      <div className="mt-4 space-y-2">
        {customers.map((c) => (
          <div key={c.id} className="flex items-center gap-4 rounded-xl border border-champagne/10 bg-ink/50 p-4">
            <div className="grid h-12 w-12 place-items-center rounded-full border border-champagne/20 bg-gradient-to-br from-champagne/15 to-transparent font-serif text-lg text-gold-foil">
              {c.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ivory">{c.name} {c.tags && <span className="ml-2 text-[10px] text-champagne">{c.tags}</span>}</p>
              <p className="text-xs text-ivory/50">{c.phone} · {c.email || "no email"} · {c.city || "—"}</p>
            </div>
            <div className="text-right">
              <p className="font-serif text-lg text-gold-foil">₹{c.totalRevenue.toLocaleString("en-IN")}</p>
              <p className="text-[10px] text-ivory/50">{c.totalBookings} bookings · {c.loyaltyPoints} pts</p>
            </div>
          </div>
        ))}
        {customers.length === 0 && <p className="py-8 text-center text-sm text-ivory/50">No customers found.</p>}
      </div>
    </div>
  );
}

/* ============ HOUSEKEEPING ============ */
function HousekeepingSection() {
  const [rooms, setRooms] = useState<any[]>([]);
  const load = () => {
    fetch("/api/housekeeping", { cache: "no-store" }).then(r => r.json()).then(j => setRooms(j.rooms || []));
  };
  useEffect(() => { load(); }, []);
  const updateStatus = async (roomNumber: string, status: string) => {
    await fetch("/api/housekeeping", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomNumber, status }),
    });
    toast.success(`Room ${roomNumber} marked as ${status}`);
    load();
  };
  const statusColors: any = {
    READY: "bg-green-500/15 text-green-300 border-green-500/30",
    OCCUPIED: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    DIRTY: "bg-red-500/15 text-red-300 border-red-500/30",
    CLEANING: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    INSPECT: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    MAINTENANCE: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  };
  return (
    <div>
      <h2 className="font-serif text-2xl text-ivory">Housekeeping Dashboard</h2>
      <p className="mt-1 text-sm text-ivory/60">Tap a room to update its status. Bulk actions below.</p>
      <div className="mt-4 flex gap-2">
        <button onClick={() => fetch("/api/housekeeping", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fromStatus: "DIRTY", toStatus: "CLEANING", assignedTo: "Ravi Menon" }) }).then(load)} className="rounded-full border border-champagne/20 px-3 py-1.5 text-xs text-champagne hover:bg-champagne/10">
          Mark all dirty → cleaning
        </button>
        <button onClick={() => fetch("/api/housekeeping", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fromStatus: "CLEANING", toStatus: "READY" }) }).then(load)} className="rounded-full border border-champagne/20 px-3 py-1.5 text-xs text-champagne hover:bg-champagne/10">
          Mark all cleaning → ready
        </button>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {rooms.map((r) => (
          <div key={r.roomNumber} className={cn("rounded-xl border p-4 text-center", statusColors[r.status] || "border-champagne/10 bg-ink/50")}>
            <p className="font-serif text-2xl text-ivory">{r.roomNumber}</p>
            <p className="text-[10px] uppercase tracking-wider opacity-80">{r.status}</p>
            {r.assignedTo && <p className="mt-1 text-[10px] opacity-70">{r.assignedTo}</p>}
            <select
              value={r.status}
              onChange={(e) => updateStatus(r.roomNumber, e.target.value)}
              className="mt-2 w-full rounded-lg border border-champagne/15 bg-ink/80 px-2 py-1 text-[10px] text-ivory focus:outline-none"
            >
              <option value="READY">READY</option>
              <option value="OCCUPIED">OCCUPIED</option>
              <option value="DIRTY">DIRTY</option>
              <option value="CLEANING">CLEANING</option>
              <option value="INSPECT">INSPECT</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ KITCHEN ============ */
function KitchenSection() {
  const [orders, setOrders] = useState<any[]>([]);
  const [menu, setMenu] = useState<any[]>([]);
  const load = () => {
    Promise.all([
      fetch("/api/kitchen-orders", { cache: "no-store" }).then(r => r.json()),
      fetch("/api/menu", { cache: "no-store" }).then(r => r.json()),
    ]).then(([o, m]) => {
      setOrders(o.orders || []);
      setMenu(m.items || []);
    });
  };
  useEffect(() => { load(); }, []);
  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/kitchen-orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    toast.success(`Order status → ${status}`);
    load();
  };
  return (
    <div>
      <h2 className="font-serif text-2xl text-ivory">Kitchen Orders</h2>
      <p className="mt-1 text-sm text-ivory/60">Orders come in from QR codes in each room. Mark as preparing → ready → delivered.</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {orders.slice(0, 12).map((o) => {
          const items = JSON.parse(o.items);
          return (
            <div key={o.id} className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs text-champagne">{o.reference}</p>
                  <p className="font-serif text-lg text-ivory">Room {o.roomNumber}</p>
                  <p className="text-xs text-ivory/50">{o.guestName} · {new Date(o.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                  o.status === "NEW" && "bg-red-500/15 text-red-300",
                  o.status === "PREPARING" && "bg-yellow-500/15 text-yellow-300",
                  o.status === "READY" && "bg-green-500/15 text-green-300",
                  o.status === "DELIVERED" && "bg-ivory/10 text-ivory/60",
                )}>{o.status}</span>
              </div>
              <div className="mt-3 space-y-1 text-sm text-ivory/70">
                {items.map((it: any, i: number) => <p key={i}>• {it.name} × {it.qty || 1}</p>)}
              </div>
              <p className="mt-2 font-semibold text-gold-foil">₹{o.total}</p>
              {o.notes && <p className="mt-1 text-xs text-ivory/50 italic">📝 {o.notes}</p>}
              <div className="mt-3 flex gap-1.5">
                {o.status === "NEW" && <button onClick={() => updateStatus(o.id, "PREPARING")} className="flex-1 rounded-full bg-yellow-500/15 px-2 py-1 text-[10px] font-semibold text-yellow-300">▶ Start</button>}
                {o.status === "PREPARING" && <button onClick={() => updateStatus(o.id, "READY")} className="flex-1 rounded-full bg-green-500/15 px-2 py-1 text-[10px] font-semibold text-green-300">✓ Ready</button>}
                {o.status === "READY" && <button onClick={() => updateStatus(o.id, "DELIVERED")} className="flex-1 rounded-full bg-ivory/10 px-2 py-1 text-[10px] font-semibold text-ivory">📦 Delivered</button>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-8">
        <h3 className="font-serif text-lg text-ivory">Menu ({menu.length} items)</h3>
        <p className="text-xs text-ivory/50">Scan QR in any room to order. Kitchen printer auto-prints new orders.</p>
      </div>
    </div>
  );
}

/* ============ POOJA BOOKINGS ============ */
function PoojaSection() {
  const [bookings, setBookings] = useState<any[]>([]);
  const load = () => {
    fetch("/api/pooja-bookings", { cache: "no-store" }).then(r => r.json()).then(j => setBookings(j.bookings || []));
  };
  useEffect(() => { load(); }, []);
  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/pooja-bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    toast.success(`Pooja status → ${status}`);
    load();
  };
  const statusColors: any = {
    SCHEDULED: "bg-blue-500/15 text-blue-300",
    AT_TEMPLE: "bg-yellow-500/15 text-yellow-300",
    COMPLETED: "bg-green-500/15 text-green-300",
    PRASADAM_READY: "bg-saffron/15 text-saffron",
    PICKED_UP: "bg-ivory/10 text-ivory/60",
    CANCELLED: "bg-red-500/15 text-red-300",
  };
  return (
    <div>
      <h2 className="font-serif text-2xl text-ivory">Pooja Bookings</h2>
      <p className="mt-1 text-sm text-ivory/60">Track pooja status from booking → temple → prasadam ready → picked up. Guest auto-notified at each step.</p>
      <div className="mt-6 space-y-3">
        {bookings.map((b) => (
          <div key={b.id} className="flex items-center gap-4 rounded-xl border border-champagne/10 bg-ink/50 p-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl border border-champagne/20 bg-gradient-to-br from-saffron/15 to-transparent">
              <Flame className="h-5 w-5 text-saffron" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-lg text-ivory">{b.poojaName}</p>
              <p className="text-xs text-ivory/50">{b.reference} · {b.guestName} · {b.guestPhone}</p>
              <p className="text-xs text-ivory/50">Preferred: {new Date(b.preferredDate).toLocaleDateString("en-IN", { day: "numeric", month: "long" })} · ₹{b.amount}</p>
            </div>
            <div className="text-right">
              <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", statusColors[b.status])}>{b.status.replace(/_/g, " ")}</span>
              <select
                value={b.status}
                onChange={(e) => updateStatus(b.id, e.target.value)}
                className="mt-2 block rounded-lg border border-champagne/15 bg-ink/80 px-2 py-1 text-[10px] text-ivory focus:outline-none"
              >
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="AT_TEMPLE">AT_TEMPLE</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="PRASADAM_READY">PRASADAM_READY</option>
                <option value="PICKED_UP">PICKED_UP</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>
        ))}
        {bookings.length === 0 && <p className="py-8 text-center text-sm text-ivory/50">No pooja bookings yet.</p>}
      </div>
    </div>
  );
}

/* ============ PRICING & COUPONS ============ */
function PricingSection() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [testCode, setTestCode] = useState("");
  const [testAmount, setTestAmount] = useState("2000");
  const [testResult, setTestResult] = useState<any>(null);
  const load = () => {
    fetch("/api/coupons", { cache: "no-store" }).then(r => r.json()).then(j => setCoupons(j.coupons || []));
  };
  useEffect(() => { load(); }, []);
  const testCoupon = async () => {
    const r = await fetch("/api/coupons", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: testCode, bookingAmount: parseInt(testAmount) }),
    });
    setTestResult(await r.json());
  };
  return (
    <div>
      <h2 className="font-serif text-2xl text-ivory">Dynamic Pricing & Coupons</h2>
      <p className="mt-1 text-sm text-ivory/60">Active rules auto-apply: weekend surge (1.3×), early-bird (-15%), last-minute (-15%). Test coupons below.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
          <p className="text-xs uppercase tracking-wider text-ivory/50">Active Pricing Rules</p>
          <div className="mt-2 space-y-1 text-sm">
            <p className="flex justify-between text-ivory/70"><span>Weekend Surge (Fri, Sat)</span><span className="text-gold-foil">+30%</span></p>
            <p className="flex justify-between text-ivory/70"><span>Early Bird (30+ days)</span><span className="text-green-300">-10%</span></p>
            <p className="flex justify-between text-ivory/70"><span>Last-Minute (same day)</span><span className="text-green-300">-15%</span></p>
            <p className="flex justify-between text-ivory/70"><span>Summer Off-Season</span><span className="text-green-300">-15%</span></p>
            <p className="flex justify-between text-ivory/70"><span>Ekadasi Early Bird</span><span className="text-green-300">-15%</span></p>
          </div>
        </div>
        <div className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
          <p className="text-xs uppercase tracking-wider text-ivory/50">Test Coupon</p>
          <div className="mt-2 flex gap-2">
            <input value={testCode} onChange={(e) => setTestCode(e.target.value.toUpperCase())} placeholder="EARLYBIRD10" className="flex-1 rounded-lg border border-champagne/15 bg-ink px-3 py-1.5 text-sm text-ivory focus:outline-none" />
            <input value={testAmount} onChange={(e) => setTestAmount(e.target.value)} type="number" className="w-24 rounded-lg border border-champagne/15 bg-ink px-3 py-1.5 text-sm text-ivory focus:outline-none" />
            <button onClick={testCoupon} className="rounded-lg bg-champagne px-3 py-1.5 text-sm font-semibold text-ink">Test</button>
          </div>
          {testResult && (
            <div className={cn("mt-3 rounded-lg p-3 text-sm", testResult.valid ? "bg-green-500/10 text-green-300" : "bg-red-500/10 text-red-300")}>
              {testResult.message}
              {testResult.valid && <p className="mt-1 font-bold">Discount: ₹{testResult.discount}</p>}
            </div>
          )}
        </div>
      </div>
      <h3 className="mt-8 font-serif text-lg text-ivory">All Coupons ({coupons.length})</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((c) => (
          <div key={c.id} className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono font-bold text-champagne">{c.code}</p>
                <p className="mt-1 text-xs text-ivory/60">{c.description}</p>
              </div>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", c.active ? "bg-green-500/15 text-green-300" : "bg-red-500/15 text-red-300")}>{c.active ? "ACTIVE" : "INACTIVE"}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-gold-foil">{c.type === "PERCENTAGE" ? `${c.value}% off` : `₹${c.value} off`}</span>
              <span className="text-ivory/50">{c.usedCount}/{c.usageLimit || "∞"} used</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ TRAVEL AGENTS ============ */
function AgentsSection() {
  const [agents, setAgents] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/travel-agents", { cache: "no-store" }).then(r => r.json()).then(j => setAgents(j.agents || []));
  }, []);
  return (
    <div>
      <h2 className="font-serif text-2xl text-ivory">B2B Travel Agents</h2>
      <p className="mt-1 text-sm text-ivory/60">Agents get commission-based bookings with deferred payment. Track outstanding balances.</p>
      <div className="mt-6 space-y-3">
        {agents.map((a) => (
          <div key={a.id} className="flex items-center gap-4 rounded-xl border border-champagne/10 bg-ink/50 p-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl border border-champagne/20 bg-gradient-to-br from-champagne/15 to-transparent">
              <Building2 className="h-5 w-5 text-champagne" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-lg text-ivory">{a.companyName}</p>
              <p className="text-xs text-ivory/50">{a.contactName} · {a.phone} · {a.email || "—"}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-ivory/50">Commission: {(a.commissionRate * 100).toFixed(0)}%</p>
              <p className="font-serif text-lg text-gold-foil">₹{a.outstanding.toLocaleString("en-IN")}</p>
              <p className="text-[10px] text-ivory/50">outstanding of ₹{a.creditLimit.toLocaleString("en-IN")} limit</p>
              <p className="text-[10px] text-ivory/50">{a.totalBookings} bookings</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ BLOG CMS ============ */
function BlogCMSSection() {
  const [posts, setPosts] = useState<any[]>([]);
  const load = () => {
    fetch("/api/blog-posts", { cache: "no-store" }).then(r => r.json()).then(j => setPosts(j.posts || []));
  };
  useEffect(() => { load(); }, []);
  return (
    <div>
      <h2 className="font-serif text-2xl text-ivory">Blog CMS</h2>
      <p className="mt-1 text-sm text-ivory/60">Manage blog articles. Edit, publish, unpublish — changes go live instantly.</p>
      <div className="mt-6 space-y-3">
        {posts.map((p) => (
          <div key={p.id} className="flex items-center gap-4 rounded-xl border border-champagne/10 bg-ink/50 p-4">
            <img src={p.image} alt={p.title} className="h-16 w-24 flex-shrink-0 rounded-lg object-cover photo-cinematic" />
            <div className="flex-1 min-w-0">
              <p className="font-serif text-base text-ivory line-clamp-1">{p.title}</p>
              <p className="text-xs text-ivory/50">{p.category} · {p.readTime} · {p.date} · {p.content?.length || 0} paragraphs</p>
            </div>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", p.published ? "bg-green-500/15 text-green-300" : "bg-yellow-500/15 text-yellow-300")}>{p.published ? "PUBLISHED" : "DRAFT"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ GALLERY CMS ============ */
function GalleryCMSSection() {
  const [images, setImages] = useState<any[]>([]);
  const [tab, setTab] = useState("Rooms");
  useEffect(() => {
    fetch(`/api/gallery?tab=${tab}`, { cache: "no-store" }).then(r => r.json()).then(j => setImages(j.images || []));
  }, [tab]);
  return (
    <div>
      <h2 className="font-serif text-2xl text-ivory">Gallery CMS</h2>
      <p className="mt-1 text-sm text-ivory/60">Manage gallery images per tab. Reorder, edit captions, delete.</p>
      <div className="mt-4 flex gap-2">
        {["Rooms", "Temple", "Facilities", "Surroundings"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", tab === t ? "border border-champagne/30 bg-champagne/15 text-champagne" : "border border-champagne/10 text-ivory/60")}>{t}</button>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img) => (
          <div key={img.id} className="overflow-hidden rounded-xl border border-champagne/10 bg-ink/50">
            <img src={img.src} alt={img.alt} className="aspect-square w-full object-cover photo-cinematic" />
            <div className="p-3">
              <p className="text-xs text-ivory line-clamp-1">{img.caption}</p>
              <p className="text-[10px] text-ivory/40">Order: {img.sortOrder}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ MAINTENANCE ============ */
function MaintenanceSection() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const load = () => {
    fetch("/api/maintenance", { cache: "no-store" }).then(r => r.json()).then(j => setBlocks(j.blocks || []));
  };
  useEffect(() => { load(); }, []);
  return (
    <div>
      <h2 className="font-serif text-2xl text-ivory">Maintenance Mode</h2>
      <p className="mt-1 text-sm text-ivory/60">Block rooms for repairs — auto-removed from all channels + housekeeping marked.</p>
      <div className="mt-6 space-y-3">
        {blocks.map((b) => (
          <div key={b.id} className="flex items-center gap-4 rounded-xl border border-champagne/10 bg-ink/50 p-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl border border-orange-500/20 bg-orange-500/10 text-orange-300">
              <Wrench className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-base text-ivory">{b.roomSlug} {b.roomNumber && `(${b.roomNumber})`}</p>
              <p className="text-xs text-ivory/50">{b.reason} · {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}</p>
              {b.cost && <p className="text-xs text-gold-foil">Cost: ₹{b.cost}</p>}
            </div>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", b.status === "SCHEDULED" ? "bg-yellow-500/15 text-yellow-300" : b.status === "IN_PROGRESS" ? "bg-orange-500/15 text-orange-300" : "bg-green-500/15 text-green-300")}>{b.status.replace(/_/g, " ")}</span>
          </div>
        ))}
        {blocks.length === 0 && <p className="py-8 text-center text-sm text-ivory/50">No maintenance blocks scheduled.</p>}
      </div>
    </div>
  );
}

/* ============ INVOICES ============ */
function InvoicesSection() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);
  useEffect(() => {
    fetch("/api/bookings", { cache: "no-store" }).then(r => r.json()).then(j => setBookings(j.bookings || []));
  }, []);
  const loadInvoice = async (bookingId: string) => {
    const r = await fetch(`/api/invoice?bookingId=${bookingId}`);
    const j = await r.json();
    setSelected(j.booking);
    setInvoice(j.invoice);
  };
  const saveInvoice = async () => {
    await fetch("/api/invoice", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoice),
    });
    toast.success("Invoice saved — ready for PDF/print");
  };
  return (
    <div>
      <h2 className="font-serif text-2xl text-ivory">Custom Invoice Generator</h2>
      <p className="mt-1 text-sm text-ivory/60">Every field is editable. Pick a booking → edit → save → print/email.</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-2 max-h-[500px] overflow-y-auto scroll-smooth-dark">
          {bookings.map((b) => (
            <button key={b.id} onClick={() => loadInvoice(b.id)} className={cn("block w-full rounded-xl border p-3 text-left", selected?.id === b.id ? "border-champagne/40 bg-champagne/10" : "border-champagne/10 bg-ink/50")}>
              <p className="font-mono text-xs text-champagne">{b.reference}</p>
              <p className="text-sm text-ivory">{b.guestName}</p>
              <p className="text-[10px] text-ivory/50">₹{b.amount} · {new Date(b.checkIn).toLocaleDateString()}</p>
            </button>
          ))}
        </div>
        <div className="lg:col-span-2">
          {invoice ? (
            <div className="rounded-xl border border-champagne/10 bg-ink/50 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Invoice #" value={invoice.invoiceNumber} onChange={(v) => setInvoice({ ...invoice, invoiceNumber: v })} />
                <Field label="Date" value={invoice.invoiceDate} onChange={(v) => setInvoice({ ...invoice, invoiceDate: v })} />
                <Field label="From Name" value={invoice.fromName} onChange={(v) => setInvoice({ ...invoice, fromName: v })} />
                <Field label="To Name" value={invoice.toName} onChange={(v) => setInvoice({ ...invoice, toName: v })} />
                <Field label="From GST" value={invoice.fromGST} onChange={(v) => setInvoice({ ...invoice, fromGST: v })} />
                <Field label="To GST" value={invoice.toGST} onChange={(v) => setInvoice({ ...invoice, toGST: v })} />
              </div>
              <div className="mt-4">
                <p className="text-[10px] uppercase tracking-wider text-ivory/50">Items</p>
                {invoice.items.map((it: any, i: number) => (
                  <div key={i} className="mt-1 grid grid-cols-12 gap-2 text-xs">
                    <input value={it.description} onChange={(e) => { const items = [...invoice.items]; items[i] = { ...it, description: e.target.value }; setInvoice({ ...invoice, items }); }} className="col-span-6 rounded border border-champagne/15 bg-ink px-2 py-1 text-ivory" />
                    <input value={it.hsn} onChange={(e) => { const items = [...invoice.items]; items[i] = { ...it, hsn: e.target.value }; setInvoice({ ...invoice, items }); }} className="col-span-2 rounded border border-champagne/15 bg-ink px-2 py-1 text-ivory" />
                    <input type="number" value={it.qty} onChange={(e) => { const items = [...invoice.items]; items[i] = { ...it, qty: parseInt(e.target.value) || 0 }; setInvoice({ ...invoice, items }); }} className="col-span-1 rounded border border-champagne/15 bg-ink px-2 py-1 text-ivory" />
                    <input type="number" value={it.rate} onChange={(e) => { const items = [...invoice.items]; items[i] = { ...it, rate: parseInt(e.target.value) || 0, amount: (parseInt(e.target.value) || 0) * it.qty }; setInvoice({ ...invoice, items }); }} className="col-span-2 rounded border border-champagne/15 bg-ink px-2 py-1 text-ivory" />
                    <span className="col-span-1 py-1 text-right text-gold-foil">₹{it.amount}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <div className="space-y-1">
                  <Field label="Notes" value={invoice.notes} onChange={(v) => setInvoice({ ...invoice, notes: v })} />
                  <Field label="Terms" value={invoice.terms} onChange={(v) => setInvoice({ ...invoice, terms: v })} />
                </div>
                <div className="space-y-1 rounded-lg border border-champagne/10 bg-ink p-3">
                  <p className="flex justify-between text-ivory/70"><span>Subtotal</span><span>₹{invoice.subtotal}</span></p>
                  <p className="flex justify-between text-ivory/70"><span>CGST ({invoice.cgstRate}%)</span><span>₹{invoice.cgst}</span></p>
                  <p className="flex justify-between text-ivory/70"><span>SGST ({invoice.sgstRate}%)</span><span>₹{invoice.sgst}</span></p>
                  <p className="flex justify-between border-t border-champagne/10 pt-1 font-serif text-lg text-gold-foil"><span>Total</span><span>₹{invoice.total}</span></p>
                </div>
              </div>
              <button onClick={saveInvoice} className="btn-luxe mt-4">
                <Check className="h-4 w-4" /> Save Invoice
              </button>
            </div>
          ) : (
            <div className="grid h-full place-items-center rounded-xl border border-dashed border-champagne/15 p-12 text-center">
              <p className="text-sm text-ivory/50">Select a booking to generate its invoice</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: any) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-ivory/50">{label}</label>
      <input value={value || ""} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-1.5 text-sm text-ivory focus:border-champagne/40 focus:outline-none" />
    </div>
  );
}

/* ============ NIGHT AUDIT ============ */
function AuditSection() {
  const [audit, setAudit] = useState<any>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  useEffect(() => {
    fetch(`/api/night-audit?date=${date}`, { cache: "no-store" }).then(r => r.json()).then(setAudit);
  }, [date]);
  if (!audit) return <div className="py-12 text-center text-sm text-ivory/50">Loading audit…</div>;
  return (
    <div>
      <h2 className="font-serif text-2xl text-ivory">Night Audit Report</h2>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-4 rounded-lg border border-champagne/15 bg-ink px-3 py-1.5 text-sm text-ivory" />
      <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {[
          { label: "Arrivals", value: audit.summary.arrivals, icon: Users },
          { label: "Departures", value: audit.summary.departures, icon: CalendarDays },
          { label: "In-house Guests", value: audit.summary.inHouseGuests, icon: BedDouble },
          { label: "Occupancy", value: `${audit.summary.occupancyRate}%`, icon: TrendingUp },
          { label: "New Bookings", value: audit.summary.newBookings, icon: Plus },
          { label: "Cancellations", value: audit.summary.cancellations, icon: X },
          { label: "Pooja Bookings", value: audit.summary.poojaBookingsToday, icon: Flame },
          { label: "Kitchen Orders", value: audit.summary.kitchenOrdersToday, icon: Utensils },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
            <s.icon className="h-5 w-5 text-champagne" />
            <p className="mt-2 text-[10px] uppercase tracking-wider text-ivory/50">{s.label}</p>
            <p className="font-serif text-2xl text-gold-foil">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-champagne/10 bg-ink/50 p-4">
        <p className="font-serif text-lg text-ivory">Revenue Reconciliation</p>
        <div className="mt-3 space-y-1 text-sm">
          <p className="flex justify-between text-ivory/70"><span>Expected Revenue</span><span className="text-gold-foil">₹{audit.revenue.expected.toLocaleString("en-IN")}</span></p>
          <p className="flex justify-between text-ivory/70"><span>Cash Collected</span><span>₹{audit.revenue.cash.toLocaleString("en-IN")}</span></p>
          <p className="flex justify-between text-ivory/70"><span>Card Collected</span><span>₹{audit.revenue.card.toLocaleString("en-IN")}</span></p>
          <p className="flex justify-between text-ivory/70"><span>UPI Collected</span><span>₹{audit.revenue.upi.toLocaleString("en-IN")}</span></p>
          <p className="flex justify-between border-t border-champagne/10 pt-1 font-semibold text-ivory"><span>Total Collected</span><span className="text-gold-foil">₹{audit.revenue.totalCollected.toLocaleString("en-IN")}</span></p>
          <p className="flex justify-between text-ivory/70"><span>Discrepancy</span><span className={audit.revenue.discrepancy === 0 ? "text-green-300" : "text-red-300"}>₹{audit.revenue.discrepancy}</span></p>
        </div>
      </div>
    </div>
  );
}

/* ============ EXPORTS ============ */
function ExportsSection() {
  const exports = [
    { type: "bookings", label: "All Bookings", desc: "Every booking with guest, room, dates, amount, source" },
    { type: "customers", label: "CRM Customers", desc: "All customers with booking history, revenue, loyalty" },
    { type: "revenue", label: "Revenue Report", desc: "Date-wise revenue breakdown for accounting" },
    { type: "channel-sync", label: "Channel Sync Logs", desc: "Audit trail of all channel sync operations" },
    { type: "pooja-bookings", label: "Pooja Bookings", desc: "All pooja bookings with status" },
    { type: "kitchen-orders", label: "Kitchen Orders", desc: "All food orders with totals" },
    { type: "travel-agents", label: "Travel Agents", desc: "B2B agent performance & outstanding" },
  ];
  return (
    <div>
      <h2 className="font-serif text-2xl text-ivory">CSV / Excel Exports</h2>
      <p className="mt-1 text-sm text-ivory/60">Download data for accounting, tax filing, or analysis. Opens in Excel/Google Sheets.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {exports.map((e) => (
          <a key={e.type} href={`/api/export?type=${e.type}`} className="flex items-center gap-4 rounded-xl border border-champagne/10 bg-ink/50 p-4 transition-all hover:border-champagne/30 hover:bg-champagne/5">
            <div className="grid h-12 w-12 place-items-center rounded-xl border border-champagne/20 bg-gradient-to-br from-champagne/15 to-transparent">
              <Download className="h-5 w-5 text-champagne" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-base text-ivory">{e.label}</p>
              <p className="text-xs text-ivory/50">{e.desc}</p>
            </div>
            <ExternalLink className="h-4 w-4 text-champagne" />
          </a>
        ))}
      </div>
    </div>
  );
}

/* ============ NOTIFICATIONS ============ */
function NotificationsSection() {
  const [notifs, setNotifs] = useState<any[]>([]);
  const load = () => {
    fetch("/api/notifications", { cache: "no-store" }).then(r => r.json()).then(j => setNotifs(j.notifications || []));
  };
  useEffect(() => { load(); }, []);
  const typeColors: any = {
    WHATSAPP: "bg-green-500/15 text-green-300",
    SMS: "bg-blue-500/15 text-blue-300",
    EMAIL: "bg-purple-500/15 text-purple-300",
    TELEGRAM: "bg-cyan-500/15 text-cyan-300",
  };
  return (
    <div>
      <h2 className="font-serif text-2xl text-ivory">Notifications Log</h2>
      <p className="mt-1 text-sm text-ivory/60">Every SMS, Email, WhatsApp, and Telegram sent — automated or manual.</p>
      <div className="mt-6 max-h-[600px] space-y-2 overflow-y-auto scroll-smooth-dark">
        {notifs.map((n) => (
          <div key={n.id} className="rounded-xl border border-champagne/10 bg-ink/50 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", typeColors[n.type] || "bg-ivory/10 text-ivory/60")}>{n.type}</span>
                <span className="text-xs text-ivory/70">{n.recipient}</span>
              </div>
              <span className="text-[10px] text-ivory/40">{new Date(n.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            {n.subject && <p className="mt-1 text-xs font-semibold text-ivory">{n.subject}</p>}
            <p className="mt-1 text-xs text-ivory/60 line-clamp-3">{n.body}</p>
            <div className="mt-1 flex items-center gap-2 text-[10px]">
              <span className={cn("rounded-full px-2 py-0.5", n.status === "SENT" ? "bg-green-500/15 text-green-300" : n.status === "FAILED" ? "bg-red-500/15 text-red-300" : "bg-yellow-500/15 text-yellow-300")}>{n.status}</span>
              {n.relatedRef && <span className="font-mono text-champagne/70">{n.relatedRef}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ AI CHATBOT TEST ============ */
function ChatbotSection() {
  const [messages, setMessages] = useState<any[]>([{ role: "bot", text: "Namaskaram! I'm your Guruvayur Dham AI guide. Ask me anything about the temple, darshan, rooms, poojas, or festivals." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const send = async () => {
    if (!input.trim()) return;
    const msg = input;
    setMessages([...messages, { role: "user", text: msg }]);
    setInput("");
    setLoading(true);
    const r = await fetch("/api/ai-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });
    const j = await r.json();
    setMessages((m) => [...m, { role: "bot", text: j.reply }]);
    setLoading(false);
  };
  return (
    <div>
      <h2 className="font-serif text-2xl text-ivory">AI Chatbot — Guruvayur Guide</h2>
      <p className="mt-1 text-sm text-ivory/60">Test the AI chatbot that answers pilgrim questions 24×7. Powered by Z.ai LLM with Guruvayur-specific knowledge base.</p>
      <div className="mt-6 rounded-xl border border-champagne/10 bg-ink/50 p-4">
        <div className="max-h-[400px] space-y-3 overflow-y-auto scroll-smooth-dark">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[80%] rounded-2xl px-4 py-2 text-sm", m.role === "user" ? "bg-champagne text-ink" : "bg-ink border border-champagne/15 text-ivory")}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && <div className="text-center text-xs text-ivory/50">AI is thinking…</div>}
        </div>
        <div className="mt-4 flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask about darshan timings, dress code, poojas…" className="flex-1 rounded-full border border-champagne/15 bg-ink px-4 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" />
          <button onClick={send} className="btn-luxe">Send</button>
        </div>
      </div>
    </div>
  );
}

/* ============ WEATHER & CROWD ============ */
function WeatherSection() {
  const [weather, setWeather] = useState<any>(null);
  const [crowd, setCrowd] = useState<any>(null);
  useEffect(() => {
    fetch("/api/weather", { cache: "no-store" }).then(r => r.json()).then(setWeather);
    fetch("/api/crowd-forecast", { cache: "no-store" }).then(r => r.json()).then(setCrowd);
  }, []);
  return (
    <div>
      <h2 className="font-serif text-2xl text-ivory">Weather & Crowd Forecast</h2>
      <p className="mt-1 text-sm text-ivory/60">Live Guruvayur weather + 7-day forecast + crowd prediction based on bookings & festival calendar.</p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {weather && (
          <div className="rounded-xl border border-champagne/10 bg-ink/50 p-5">
            <div className="flex items-center gap-3">
              <CloudSun className="h-8 w-8 text-champagne" />
              <div>
                <p className="font-serif text-3xl text-gold-foil">{weather.current?.temp || weather.requestedDate?.tempRange?.[0]}°C</p>
                <p className="text-xs text-ivory/60">{weather.current?.condition || weather.requestedDate?.season}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-ivory/70">{weather.current?.description || weather.requestedDate?.description}</p>
            {weather.current && <p className="mt-1 text-xs text-ivory/50">Humidity: {weather.current.humidity}% · Rain chance: {weather.current.rainChance}%</p>}
            <div className="mt-4 grid grid-cols-7 gap-1">
              {weather.forecast?.map((f: any, i: number) => (
                <div key={i} className="rounded-lg border border-champagne/10 bg-ink/50 p-2 text-center">
                  <p className="text-[10px] text-ivory/50">{f.day}</p>
                  <p className="font-serif text-sm text-ivory">{f.temp}°</p>
                  <p className="text-[9px] text-ivory/40">{f.rain}%</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {crowd && (
          <div className="rounded-xl border border-champagne/10 bg-ink/50 p-5">
            <p className="text-xs uppercase tracking-wider text-ivory/50">Today's Crowd Forecast</p>
            <p className="mt-2 font-serif text-3xl text-gold-foil">{crowd.level}</p>
            <p className="text-sm text-ivory/70">{crowd.reason}</p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-ink">
              <div className="h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" style={{ width: `${crowd.percentage}%` }} />
            </div>
            <p className="mt-2 text-xs text-ivory/50">{crowd.percentage}% expected occupancy</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ REVIEWS ============ */
function ReviewsSection() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newReview, setNewReview] = useState({ authorName: "", rating: 5, text: "", source: "MANUAL", featured: false });

  const load = () => {
    fetch("/api/reviews?limit=100", { cache: "no-store" })
      .then(r => r.json())
      .then(j => { setReviews(j.reviews || []); setStats(j.stats); });
  };
  useEffect(() => { load(); }, []);

  const importGoogle = async () => {
    setImporting(true);
    try {
      const r = await fetch("/api/reviews/google-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareUrl: "https://share.google/x0YWO22UQQiol8qYa" }),
      });
      const j = await r.json();
      toast.success(j.message || `Imported ${j.imported} reviews`);
      load();
    } catch {
      toast.error("Import failed");
    }
    setImporting(false);
  };

  const addReview = async () => {
    if (!newReview.authorName || !newReview.text) {
      toast.error("Author name and text required");
      return;
    }
    const r = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReview),
    });
    const j = await r.json();
    if (j.error) toast.error(j.error);
    else {
      toast.success("Review added — now live on the website");
      setShowAdd(false);
      setNewReview({ authorName: "", rating: 5, text: "", source: "MANUAL", featured: false });
      load();
    }
  };

  const togglePublished = async (id: string, published: boolean) => {
    await fetch("/api/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, data: { published: !published } }),
    });
    load();
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    await fetch("/api/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, data: { featured: !featured } }),
    });
    load();
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
    toast.success("Review deleted");
    load();
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-ivory">Reviews Management</h2>
          <p className="mt-1 text-sm text-ivory/60">Import Google reviews, add manual reviews, moderate visibility. Changes appear on the website in real-time.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={importGoogle} disabled={importing} className="rounded-full border border-champagne/20 px-4 py-2 text-xs font-semibold text-champagne hover:bg-champagne/10 disabled:opacity-40">
            {importing ? <><RefreshCw className="mr-1 inline h-3 w-3 animate-spin" /> Importing…</> : <>Import from Google</>}
          </button>
          <button onClick={() => setShowAdd(!showAdd)} className="btn-luxe">
            <Plus className="h-4 w-4" /> Add Review
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
            <p className="text-[10px] uppercase tracking-wider text-ivory/50">Total Reviews</p>
            <p className="font-serif text-2xl text-gold-foil">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
            <p className="text-[10px] uppercase tracking-wider text-ivory/50">Average Rating</p>
            <p className="font-serif text-2xl text-gold-foil">{stats.averageRating} ★</p>
          </div>
          <div className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
            <p className="text-[10px] uppercase tracking-wider text-ivory/50">5-Star Reviews</p>
            <p className="font-serif text-2xl text-green-300">{stats.fiveStar}</p>
          </div>
          <div className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
            <p className="text-[10px] uppercase tracking-wider text-ivory/50">Google Source</p>
            <p className="font-serif text-2xl text-champagne">{reviews.filter(r => r.source === "GOOGLE").length}</p>
          </div>
        </div>
      )}

      {/* Add review form */}
      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-6 overflow-hidden">
          <div className="card-luxe p-5">
            <h3 className="font-serif text-lg text-ivory">Add New Review</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Author Name *</label>
                <input value={newReview.authorName} onChange={(e) => setNewReview({ ...newReview, authorName: e.target.value })} className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" placeholder="Guest Name" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Rating</label>
                <select value={newReview.rating} onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })} className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:outline-none">
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} stars</option>)}
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label className="text-[10px] uppercase tracking-wider text-ivory/50">Review Text *</label>
              <textarea value={newReview.text} onChange={(e) => setNewReview({ ...newReview, text: e.target.value })} rows={3} className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none resize-none" placeholder="Review text…" />
            </div>
            <div className="mt-3 flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-ivory/70">
                <input type="checkbox" checked={newReview.featured} onChange={(e) => setNewReview({ ...newReview, featured: e.target.checked })} className="accent-champagne" />
                Featured (show on homepage)
              </label>
              <select value={newReview.source} onChange={(e) => setNewReview({ ...newReview, source: e.target.value })} className="rounded-lg border border-champagne/15 bg-ink px-3 py-1.5 text-xs text-ivory focus:outline-none">
                <option value="MANUAL">Manual</option>
                <option value="GOOGLE">Google</option>
                <option value="BOOKING_COM">Booking.com</option>
                <option value="MAKEMYTRIP">MakeMyTrip</option>
              </select>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={addReview} className="btn-luxe">Add Review</button>
              <button onClick={() => setShowAdd(false)} className="btn-ghost-luxe">Cancel</button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pending reviews (guest-submitted, awaiting moderation) */}
      {reviews.filter(r => r.source === "GUEST_SUBMITTED" && !r.moderated).length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 flex items-center gap-2 font-serif text-lg text-saffron">
            <AlertCircle className="h-5 w-5" /> Pending Moderation ({reviews.filter(r => r.source === "GUEST_SUBMITTED" && !r.moderated).length})
          </h3>
          <div className="space-y-3">
            {reviews.filter(r => r.source === "GUEST_SUBMITTED" && !r.moderated).map((r) => (
              <div key={r.id} className="rounded-xl border border-saffron/30 bg-saffron/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full border border-champagne/20 bg-gradient-to-br from-saffron/15 to-transparent font-serif text-sm text-gold-foil">
                      {r.authorName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ivory">{r.authorName}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={cn("h-3 w-3", i < r.rating ? "fill-gold text-gold" : "fill-ivory/10 text-ivory/10")} />
                          ))}
                        </div>
                        <span className="text-xs text-ivory/40">{new Date(r.reviewDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                        {r.guestEmail && <span className="text-xs text-ivory/40">· {r.guestEmail}</span>}
                        {r.roomSlug && <span className="text-xs text-ivory/40">· {r.roomSlug}</span>}
                      </div>
                      <p className="mt-2 text-sm text-ivory/70">{r.text}</p>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 flex-col gap-1.5">
                    <button onClick={async () => {
                      await fetch("/api/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id, data: { published: true, moderated: true, moderatedAt: new Date() } }) });
                      toast.success("Review approved & published");
                      load();
                    }} className="rounded-full bg-green-500/15 px-3 py-1 text-[10px] font-semibold text-green-300 hover:bg-green-500/25">
                      ✓ Approve
                    </button>
                    <button onClick={async () => {
                      await fetch("/api/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id, data: { published: false, moderated: true, moderatedAt: new Date() } }) });
                      toast.success("Review rejected");
                      load();
                    }} className="rounded-full bg-red-500/15 px-3 py-1 text-[10px] font-semibold text-red-300 hover:bg-red-500/25">
                      ✗ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews list */}
      <div className="mt-6 space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className={cn("rounded-xl border p-4", r.published ? "border-champagne/10 bg-ink/50" : "border-red-500/20 bg-red-500/5 opacity-60")}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {r.authorAvatar ? (
                  <img src={r.authorAvatar} alt={r.authorName} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="grid h-10 w-10 place-items-center rounded-full border border-champagne/20 bg-gradient-to-br from-champagne/15 to-transparent font-serif text-sm text-gold-foil">
                    {r.authorName.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ivory">{r.authorName}</p>
                    <span className="rounded-full bg-ink/50 px-2 py-0.5 text-[10px] text-champagne">{r.source}</span>
                    {r.featured && <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] text-gold">★ Featured</span>}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn("h-3 w-3", i < r.rating ? "fill-gold text-gold" : "fill-ivory/10 text-ivory/10")} />
                      ))}
                    </div>
                    <span className="text-xs text-ivory/40">{new Date(r.reviewDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <p className="mt-2 text-sm text-ivory/70 line-clamp-3">{r.text}</p>
                </div>
              </div>
              <div className="flex flex-shrink-0 flex-col gap-1.5">
                <button onClick={() => togglePublished(r.id, r.published)} className={cn("rounded-full px-2 py-1 text-[10px] font-semibold", r.published ? "bg-green-500/15 text-green-300" : "bg-red-500/15 text-red-300")}>
                  {r.published ? "Published" : "Hidden"}
                </button>
                <button onClick={() => toggleFeatured(r.id, r.featured)} className={cn("rounded-full px-2 py-1 text-[10px] font-semibold", r.featured ? "bg-gold/15 text-gold" : "bg-ink/50 text-ivory/50")}>
                  ★ Feature
                </button>
                <button onClick={() => deleteReview(r.id)} className="rounded-full bg-red-500/10 px-2 py-1 text-[10px] font-semibold text-red-300 hover:bg-red-500/20">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {reviews.length === 0 && <p className="py-8 text-center text-sm text-ivory/50">No reviews yet. Click "Import from Google" to seed demo reviews.</p>}
      </div>
    </div>
  );
}

/* ============ ANALYTICS ============ */
function AnalyticsSection() {
  const [data, setData] = useState<any>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    let active = true;
    fetch(`/api/analytics?days=${days}`, { cache: "no-store" })
      .then(r => r.json())
      .then(j => { if (active) setData(j); });
    return () => { active = false; };
  }, [days]);

  if (!data) return <div className="py-12 text-center text-sm text-ivory/50"><RefreshCw className="mx-auto h-6 w-6 animate-spin" /> Loading analytics…</div>;

  const funnel = data.funnel;
  const maxRevenue = Math.max(...(data.revenueTrend || []).map((r: any) => r.revenue), 1);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-ivory">Analytics Dashboard</h2>
          <p className="mt-1 text-sm text-ivory/60">Booking funnel, revenue trends, channel performance, and occupancy forecast.</p>
        </div>
        <select value={days} onChange={(e) => setDays(parseInt(e.target.value))} className="rounded-full border border-champagne/15 bg-ink px-3 py-1.5 text-xs text-ivory focus:outline-none">
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Summary cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
          <p className="text-[10px] uppercase tracking-wider text-ivory/50">Total Revenue</p>
          <p className="font-serif text-2xl text-gold-foil">₹{(data.summary.totalRevenue || 0).toLocaleString("en-IN")}</p>
          <p className="text-xs text-ivory/50">{data.summary.totalBookings} bookings</p>
        </div>
        <div className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
          <p className="text-[10px] uppercase tracking-wider text-ivory/50">Avg Booking Value</p>
          <p className="font-serif text-2xl text-gold-foil">₹{(data.summary.avgBookingValue || 0).toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
          <p className="text-[10px] uppercase tracking-wider text-ivory/50">Conversion Rate</p>
          <p className="font-serif text-2xl text-gold-foil">{funnel.conversionRate}%</p>
          <p className="text-xs text-ivory/50">{funnel.bookingCompleted} bookings from {funnel.visitors} visitors</p>
        </div>
        <div className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
          <p className="text-[10px] uppercase tracking-wider text-ivory/50">Sentiment Score</p>
          <p className="font-serif text-2xl text-green-300">{data.reviewSentiment.sentimentScore > 0 ? "+" : ""}{data.reviewSentiment.sentimentScore}</p>
          <p className="text-xs text-ivory/50">{data.reviewSentiment.totalReviews} reviews</p>
        </div>
      </div>

      {/* Booking funnel */}
      <div className="mt-6 rounded-xl border border-champagne/10 bg-ink/50 p-5">
        <h3 className="font-serif text-lg text-ivory">Booking Funnel</h3>
        <div className="mt-4 space-y-3">
          {[
            { label: "Visitors", value: funnel.visitors, pct: 100, color: "from-blue-500 to-blue-700" },
            { label: "Started Booking", value: funnel.bookingStarted, pct: funnel.startRate, color: "from-yellow-500 to-yellow-700" },
            { label: "Completed Booking", value: funnel.bookingCompleted, pct: funnel.completionRate, color: "from-green-500 to-green-700" },
          ].map((s, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ivory/70">{s.label}</span>
                <span className="text-ivory">{s.value} <span className="text-xs text-ivory/40">({s.pct}%)</span></span>
              </div>
              <div className="mt-1 h-3 overflow-hidden rounded-full bg-ink">
                <motion.div initial={{ width: 0 }} animate={{ width: `${s.pct}%` }} transition={{ duration: 0.8 }} className={cn("h-full rounded-full bg-gradient-to-r", s.color)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue trend */}
      <div className="mt-6 rounded-xl border border-champagne/10 bg-ink/50 p-5">
        <h3 className="font-serif text-lg text-ivory">Revenue Trend ({data.summary.period})</h3>
        <div className="mt-4 flex items-end gap-1" style={{ height: "120px" }}>
          {(data.revenueTrend || []).slice(-30).map((r: any, i: number) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-gradient-to-t from-champagne/40 to-champagne"
              style={{ height: `${(r.revenue / maxRevenue) * 100}%`, minHeight: "2px" }}
              title={`${r.date}: ₹${r.revenue} (${r.bookings} bookings)`}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-ivory/40">
          <span>{(data.revenueTrend || [])[0]?.date || "—"}</span>
          <span>{(data.revenueTrend || [])[(data.revenueTrend || []).length - 1]?.date || "—"}</span>
        </div>
      </div>

      {/* Channel + Room performance */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-champagne/10 bg-ink/50 p-5">
          <h3 className="font-serif text-lg text-ivory">Channel Performance</h3>
          <div className="mt-3 space-y-2">
            {(data.channelPerformance || []).map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-champagne/5 bg-ink/30 p-3 text-sm">
                <span className="text-ivory/70">{c.source.replace(/_/g, " ")}</span>
                <div className="text-right">
                  <span className="text-ivory">{c.bookings} bookings</span>
                  <span className="ml-3 font-semibold text-gold-foil">₹{c.revenue.toLocaleString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-champagne/10 bg-ink/50 p-5">
          <h3 className="font-serif text-lg text-ivory">Room Performance</h3>
          <div className="mt-3 space-y-2">
            {(data.roomPerformance || []).map((r: any, i: number) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-champagne/5 bg-ink/30 p-3 text-sm">
                <span className="text-ivory/70">{r.name}</span>
                <div className="text-right">
                  <span className="text-ivory">{r.bookings} bookings</span>
                  <span className="ml-3 font-semibold text-gold-foil">₹{r.revenue.toLocaleString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Occupancy forecast */}
      <div className="mt-6 rounded-xl border border-champagne/10 bg-ink/50 p-5">
        <h3 className="font-serif text-lg text-ivory">14-Day Occupancy Forecast</h3>
        <div className="mt-4 grid grid-cols-7 gap-2 sm:grid-cols-14">
          {(data.occupancyForecast || []).map((f: any, i: number) => (
            <div key={i} className="rounded-lg border border-champagne/10 bg-ink/30 p-2 text-center">
              <p className="text-[10px] text-ivory/50">{new Date(f.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric" })}</p>
              <p className={cn("font-serif text-lg", f.occupancy >= 80 ? "text-red-300" : f.occupancy >= 50 ? "text-yellow-300" : "text-green-300")}>{f.occupancy}%</p>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-ink">
                <div className={cn("h-full rounded-full", f.occupancy >= 80 ? "bg-red-500" : f.occupancy >= 50 ? "bg-yellow-500" : "bg-green-500")} style={{ width: `${f.occupancy}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review sentiment */}
      <div className="mt-6 rounded-xl border border-champagne/10 bg-ink/50 p-5">
        <h3 className="font-serif text-lg text-ivory">Review Sentiment Analysis</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4 text-center">
            <p className="text-[10px] uppercase tracking-wider text-ivory/50">Positive Mentions</p>
            <p className="font-serif text-2xl text-green-300">{data.reviewSentiment.positiveMentions}</p>
            <p className="text-xs text-ivory/40">clean, comfortable, divine…</p>
          </div>
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-center">
            <p className="text-[10px] uppercase tracking-wider text-ivory/50">Negative Mentions</p>
            <p className="font-serif text-2xl text-red-300">{data.reviewSentiment.negativeMentions}</p>
            <p className="text-xs text-ivory/40">noisy, small, overpriced…</p>
          </div>
          <div className="rounded-lg border border-champagne/20 bg-champagne/5 p-4 text-center">
            <p className="text-[10px] uppercase tracking-wider text-ivory/50">Sentiment Score</p>
            <p className={cn("font-serif text-2xl", data.reviewSentiment.sentimentScore > 0 ? "text-green-300" : "text-red-300")}>
              {data.reviewSentiment.sentimentScore > 0 ? "+" : ""}{data.reviewSentiment.sentimentScore}
            </p>
            <p className="text-xs text-ivory/40">-100 to +100 scale</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ SECURITY ============ */
function SecuritySection() {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [pushCount, setPushCount] = useState(0);

  const load = () => {
    fetch("/api/audit-log?limit=20", { cache: "no-store" }).then(r => r.json()).then(j => setAuditLogs(j.logs || []));
    fetch("/api/push/subscribe", { cache: "no-store" }).then(r => r.json()).then(j => setPushCount(j.subscribers || 0));
  };
  useEffect(() => { load(); }, []);

  const actionColors: any = {
    LOGIN: "bg-green-500/15 text-green-300",
    LOGOUT: "bg-ivory/10 text-ivory/60",
    CREATE: "bg-blue-500/15 text-blue-300",
    UPDATE: "bg-yellow-500/15 text-yellow-300",
    DELETE: "bg-red-500/15 text-red-300",
    EXPORT: "bg-purple-500/15 text-purple-300",
  };

  return (
    <div>
      <h2 className="font-serif text-2xl text-ivory">Security & Audit</h2>
      <p className="mt-1 text-sm text-ivory/60">Track all admin actions, push notification subscribers, and security events.</p>

      {/* Security overview */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
          <ShieldCheck className="h-5 w-5 text-champagne" />
          <p className="mt-2 text-[10px] uppercase tracking-wider text-ivory/50">Admin Protection</p>
          <p className="font-serif text-lg text-green-300">Active</p>
          <p className="text-xs text-ivory/50">All /admin routes guarded</p>
        </div>
        <div className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
          <Bell className="h-5 w-5 text-champagne" />
          <p className="mt-2 text-[10px] uppercase tracking-wider text-ivory/50">Push Subscribers</p>
          <p className="font-serif text-lg text-gold-foil">{pushCount}</p>
          <p className="text-xs text-ivory/50">users subscribed</p>
        </div>
        <div className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
          <Lock className="h-5 w-5 text-champagne" />
          <p className="mt-2 text-[10px] uppercase tracking-wider text-ivory/50">2FA Support</p>
          <p className="font-serif text-lg text-green-300">Ready</p>
          <p className="text-xs text-ivory/50">TOTP + backup codes</p>
        </div>
      </div>

      {/* Password reset + 2FA info */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-champagne/10 bg-ink/50 p-5">
          <h3 className="font-serif text-lg text-ivory">Password Reset</h3>
          <p className="mt-1 text-xs text-ivory/60">Guests can request a password reset link via email. The link is valid for 1 hour.</p>
          <div className="mt-3 rounded-lg border border-champagne/10 bg-ink/30 p-3 text-xs text-ivory/50">
            <p>Flow: Login → "Forgot Password?" → Enter email → Receive link → Set new password → Auto-login</p>
            <p className="mt-1">API: <code className="text-champagne">/api/auth/forgot-password</code> → <code className="text-champagne">/api/auth/reset-password</code></p>
          </div>
          <p className="mt-2 text-xs text-ivory/40">Note: Emails are simulated (logged to notification table). Add SendGrid/Twilio credentials for real email.</p>
        </div>
        <div className="rounded-xl border border-champagne/10 bg-ink/50 p-5">
          <h3 className="font-serif text-lg text-ivory">2FA (TOTP)</h3>
          <p className="mt-1 text-xs text-ivory/60">Staff can enable 2FA using Google Authenticator, Authy, or any TOTP app.</p>
          <div className="mt-3 rounded-lg border border-champagne/10 bg-ink/30 p-3 text-xs text-ivory/50">
            <p>Flow: Staff settings → "Enable 2FA" → Scan QR → Enter 6-digit code → 2FA enabled</p>
            <p className="mt-1">Includes 8 backup codes for recovery.</p>
            <p className="mt-1">API: <code className="text-champagne">/api/auth/2fa</code> (POST=setup, PUT=verify, GET=status)</p>
          </div>
        </div>
      </div>

      {/* Audit log */}
      <div className="mt-6">
        <h3 className="mb-3 font-serif text-lg text-ivory">Recent Activity (Audit Log)</h3>
        <div className="card-luxe max-h-[500px] overflow-y-auto scroll-smooth-dark">
          {auditLogs.map((log, i) => (
            <div key={log.id} className={cn("flex items-start gap-3 p-3", i > 0 && "border-t border-champagne/5")}>
              <span className={cn("flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", actionColors[log.action] || "bg-ivory/10 text-ivory/60")}>
                {log.action}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ivory">
                  <span className="font-semibold">{log.userName || "System"}</span>
                  <span className="text-ivory/50"> · {log.entity}</span>
                  {log.entityId && <span className="text-ivory/40"> · {log.entityId.slice(-8)}</span>}
                </p>
                {log.details && <p className="text-xs text-ivory/40">{log.details}</p>}
                <p className="text-[10px] text-ivory/30">
                  {new Date(log.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  {log.ipAddress && ` · ${log.ipAddress}`}
                </p>
              </div>
            </div>
          ))}
          {auditLogs.length === 0 && <p className="py-8 text-center text-sm text-ivory/50">No audit logs yet.</p>}
        </div>
      </div>
    </div>
  );
}

/* ============ STAFF ============ */
function StaffSection() {
  const [staff, setStaff] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/staff", { cache: "no-store" }).then(r => r.json()).then(j => setStaff(j.staff || []));
  }, []);
  const roleColors: any = {
    MANAGER: "bg-gold/15 text-gold",
    RECEPTIONIST: "bg-blue-500/15 text-blue-300",
    HOUSEKEEPING: "bg-green-500/15 text-green-300",
    ACCOUNTANT: "bg-purple-500/15 text-purple-300",
  };
  return (
    <div>
      <h2 className="font-serif text-2xl text-ivory">Staff & Roles</h2>
      <p className="mt-1 text-sm text-ivory/60">Manage staff accounts. Each role sees different parts of the admin.</p>
      <div className="mt-6 space-y-3">
        {staff.map((s) => (
          <div key={s.id} className="flex items-center gap-4 rounded-xl border border-champagne/10 bg-ink/50 p-4">
            <div className="grid h-12 w-12 place-items-center rounded-full border border-champagne/20 bg-gradient-to-br from-champagne/15 to-transparent font-serif text-lg text-gold-foil">
              {s.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-base text-ivory">{s.name}</p>
              <p className="text-xs text-ivory/50">{s.email} · {s.phone || "no phone"}</p>
            </div>
            <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", roleColors[s.role])}>{s.role}</span>
            <span className="font-mono text-xs text-champagne">PIN: {s.pin}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
