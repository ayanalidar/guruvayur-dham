"use client";
import { useEffect, useState } from "react";
import { Sparkles, RefreshCw, Save, Plus, Trash2, X, Check, IndianRupee } from "lucide-react";
import { useHashRoute } from "@/lib/router";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText } from "@/components/site/visuals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminPoojas() {
  const { navigate } = useHashRoute();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", price: 51, duration: "15 min", description: "", prasadam: "", image: "", significance: "", active: true });

  const load = () => { setLoading(true); fetch("/api/poojas-admin").then(r => r.json()).then(j => { setItems(j.poojas || j || []); setLoading(false); }); };
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => { load(); }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const startEdit = (p: any) => { setEditing(p); setForm({ name: p.name, price: p.price, duration: p.duration || "", description: p.description || "", prasadam: p.prasadam || "", image: p.image || "", significance: p.significance || "", active: p.active }); setShowForm(true); };
  const startNew = () => { setEditing(null); setForm({ name: "", price: 51, duration: "15 min", description: "", prasadam: "", image: "", significance: "", active: true }); setShowForm(true); };

  const save = async () => {
    try {
      if (editing) {
        await fetch("/api/poojas-admin", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, data: form }) });
        toast.success("Pooja updated");
      } else {
        await fetch("/api/poojas-admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        toast.success("Pooja created");
      }
      setShowForm(false); setEditing(null); load();
    } catch { toast.error("Failed"); }
  };
  const del = async (id: string) => { if (!confirm("Delete this pooja?")) return; await fetch("/api/poojas-admin", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); toast.success("Deleted"); load(); };
  const toggle = async (id: string, active: boolean) => { await fetch("/api/poojas-admin", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, data: { active: !active } }) }); load(); };

  return (
    <div className="animate-page-reveal">
      <PageHeader eyebrow="Admin" icon={Sparkles} title={<>Manage <GoldFoilText>Poojas</GoldFoilText></>} subtitle="Add, edit, and manage temple pooja offerings and prices." crumbs={[{ label: "Home", route: "/" }, { label: "Admin", route: "/admin" }, { label: "Poojas" }]} />
      <section className="bg-ink py-12"><div className="container-x">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-ivory/60">{items.length} poojas</p>
          <div className="flex gap-2">
            <button onClick={load} className="grid h-10 w-10 place-items-center rounded-full border border-champagne/20 text-champagne hover:bg-champagne/10"><RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /></button>
            <button onClick={startNew} className="btn-luxe"><Plus className="h-4 w-4" /> New Pooja</button>
          </div>
        </div>
        {showForm && (
          <div className="card-luxe mb-4 space-y-3 p-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="col-span-2"><Label className="text-[10px] uppercase text-ivory/50">Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Mangala Aarti" /></div>
              <div><Label className="text-[10px] uppercase text-ivory/50">Price (₹)</Label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: parseInt(e.target.value) })} /></div>
              <div><Label className="text-[10px] uppercase text-ivory/50">Duration</Label><Input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="15 min" /></div>
              <div><Label className="text-[10px] uppercase text-ivory/50">Image URL</Label><Input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." /></div>
            </div>
            <div><Label className="text-[10px] uppercase text-ivory/50">Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Pooja description..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-[10px] uppercase text-ivory/50">Prasadam</Label><Input value={form.prasadam} onChange={e => setForm({ ...form, prasadam: e.target.value })} placeholder="Blessed flowers + sweets" /></div>
              <div><Label className="text-[10px] uppercase text-ivory/50">Significance</Label><Input value={form.significance} onChange={e => setForm({ ...form, significance: e.target.value })} placeholder="Brings prosperity..." /></div>
            </div>
            <div className="flex justify-end gap-2"><button onClick={() => { setShowForm(false); setEditing(null); }} className="btn-ghost-luxe">Cancel</button><button onClick={save} className="btn-luxe"><Save className="h-4 w-4" /> {editing ? "Update" : "Create"}</button></div>
          </div>
        )}
        <div className="space-y-2">
          {items.map(p => (
            <div key={p.id} className="card-luxe flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {p.image && <img src={p.image} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />}
                <div>
                  <div className="flex items-center gap-2"><p className="font-serif text-sm text-ivory">{p.name}</p>{p.active ? <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[9px] font-bold text-green-300">ACTIVE</span> : <span className="rounded-full bg-ivory/10 px-2 py-0.5 text-[9px] font-bold text-ivory/40">INACTIVE</span>}</div>
                  <p className="mt-0.5 text-xs text-ivory/50">₹{p.price} · {p.duration || "—"} · {p.prasadam || "No prasadam"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(p)} className="rounded-lg border border-champagne/20 px-3 py-1.5 text-xs font-semibold text-champagne hover:bg-champagne/10">Edit</button>
                <button onClick={() => toggle(p.id, p.active)} className="grid h-8 w-8 place-items-center rounded-lg border border-champagne/20 text-champagne hover:bg-champagne/10">{p.active ? <Check className="h-4 w-4 text-green-300" /> : <X className="h-4 w-4" />}</button>
                <button onClick={() => del(p.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div></section>
    </div>
  );
}
