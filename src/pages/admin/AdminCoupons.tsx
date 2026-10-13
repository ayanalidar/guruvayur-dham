"use client";
import { useEffect, useState } from "react";
import { Tag, RefreshCw, Save, Plus, Trash2, X, Check } from "lucide-react";
import { useHashRoute } from "@/lib/router";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText } from "@/components/site/visuals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminCoupons() {
  const { navigate } = useHashRoute();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", description: "", type: "PERCENTAGE", value: 10, maxDiscount: "", minBooking: 1000, usageLimit: 0, validFrom: "2026-01-01", validTo: "2026-12-31" });

  const load = () => { setLoading(true); fetch("/api/coupons").then(r => r.json()).then(j => { setItems(j.coupons || []); setLoading(false); }); };
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => { load(); }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const create = async () => {
    const data: any = { ...form, maxDiscount: form.maxDiscount ? parseInt(form.maxDiscount) : undefined };
    try { await fetch("/api/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); toast.success("Coupon created"); setShowForm(false); setForm({ code: "", description: "", type: "PERCENTAGE", value: 10, maxDiscount: "", minBooking: 1000, usageLimit: 0, validFrom: "2026-01-01", validTo: "2026-12-31" }); load(); } catch { toast.error("Failed"); }
  };
  const toggle = async (id: string, active: boolean) => { await fetch("/api/coupons", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, data: { active: !active } }) }); load(); };
  const del = async (id: string) => { if (!confirm("Delete this coupon?")) return; await fetch("/api/coupons", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); toast.success("Deleted"); load(); };

  return (
    <div className="animate-page-reveal">
      <PageHeader eyebrow="Admin" icon={Tag} title={<>Manage <GoldFoilText>Coupons</GoldFoilText></>} subtitle="Create discount codes for promotions, festivals, and repeat guests." crumbs={[{ label: "Home", route: "/" }, { label: "Admin", route: "/admin" }, { label: "Coupons" }]} />
      <section className="bg-ink py-12"><div className="container-x">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-ivory/60">{items.length} coupons</p>
          <div className="flex gap-2">
            <button onClick={load} className="grid h-10 w-10 place-items-center rounded-full border border-champagne/20 text-champagne hover:bg-champagne/10"><RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /></button>
            <button onClick={() => setShowForm(!showForm)} className="btn-luxe"><Plus className="h-4 w-4" /> New Coupon</button>
          </div>
        </div>
        {showForm && (
          <div className="card-luxe mb-4 space-y-3 p-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div><Label className="text-[10px] uppercase text-ivory/50">Code</Label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="JANMASHTAMI20" /></div>
              <div><Label className="text-[10px] uppercase text-ivory/50">Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="20% off Janmashtami" /></div>
              <div><Label className="text-[10px] uppercase text-ivory/50">Type</Label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory"><option value="PERCENTAGE">Percentage (%)</option><option value="FLAT">Flat (₹)</option></select></div>
              <div><Label className="text-[10px] uppercase text-ivory/50">Value ({form.type === "PERCENTAGE" ? "%" : "₹"})</Label><Input type="number" value={form.value} onChange={e => setForm({ ...form, value: parseFloat(e.target.value) })} /></div>
              <div><Label className="text-[10px] uppercase text-ivory/50">Max Discount (₹)</Label><Input type="number" value={form.maxDiscount} onChange={e => setForm({ ...form, maxDiscount: e.target.value })} placeholder="500" /></div>
              <div><Label className="text-[10px] uppercase text-ivory/50">Min Booking (₹)</Label><Input type="number" value={form.minBooking} onChange={e => setForm({ ...form, minBooking: parseInt(e.target.value) })} /></div>
              <div><Label className="text-[10px] uppercase text-ivory/50">Usage Limit (0=unlimited)</Label><Input type="number" value={form.usageLimit} onChange={e => setForm({ ...form, usageLimit: parseInt(e.target.value) })} /></div>
              <div><Label className="text-[10px] uppercase text-ivory/50">Valid From</Label><Input type="date" value={form.validFrom} onChange={e => setForm({ ...form, validFrom: e.target.value })} /></div>
              <div><Label className="text-[10px] uppercase text-ivory/50">Valid To</Label><Input type="date" value={form.validTo} onChange={e => setForm({ ...form, validTo: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2"><button onClick={() => setShowForm(false)} className="btn-ghost-luxe">Cancel</button><button onClick={create} className="btn-luxe"><Save className="h-4 w-4" /> Create</button></div>
          </div>
        )}
        <div className="space-y-2">
          {items.map(c => (
            <div key={c.id} className="card-luxe flex items-center justify-between p-4">
              <div>
                <div className="flex items-center gap-2"><p className="font-mono font-bold text-gold-foil">{c.code}</p>{c.active ? <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[9px] font-bold text-green-300">ACTIVE</span> : <span className="rounded-full bg-ivory/10 px-2 py-0.5 text-[9px] font-bold text-ivory/40">INACTIVE</span>}</div>
                <p className="mt-1 text-xs text-ivory/50">{c.description || "No description"} · {c.type === "PERCENTAGE" ? `${c.value}% off` : `₹${c.value} off`} {c.maxDiscount ? `(max ₹${c.maxDiscount})` : ""} · Min ₹{c.minBooking} · Used {c.usedCount}/{c.usageLimit || "∞"}</p>
              </div>
              <div className="flex gap-2"><button onClick={() => toggle(c.id, c.active)} className="grid h-8 w-8 place-items-center rounded-lg border border-champagne/20 text-champagne hover:bg-champagne/10">{c.active ? <Check className="h-4 w-4 text-green-300" /> : <X className="h-4 w-4" />}</button><button onClick={() => del(c.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button></div>
            </div>
          ))}
        </div>
      </div></section>
    </div>
  );
}
