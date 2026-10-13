"use client";
import { useEffect, useState } from "react";
import { Calendar, RefreshCw, Save, Plus, Trash2, X, Check } from "lucide-react";
import { useHashRoute } from "@/lib/router";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText } from "@/components/site/visuals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminEvents() {
  const { navigate } = useHashRoute();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", date: "", dateISO: "", description: "", highlight: "", image: "", active: true });

  const load = () => { setLoading(true); fetch("/api/events-admin").then(r => r.json()).then(j => { setItems(j.events || []); setLoading(false); }); };
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => { load(); }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const startEdit = (e: any) => { setEditing(e); setForm({ name: e.name, date: e.date || "", dateISO: e.dateISO ? new Date(e.dateISO).toISOString().slice(0, 10) : "", description: e.description || "", highlight: e.highlight || "", image: e.image || "", active: e.active }); setShowForm(true); };
  const startNew = () => { setEditing(null); setForm({ name: "", date: "", dateISO: "", description: "", highlight: "", image: "", active: true }); setShowForm(true); };

  const save = async () => {
    try {
      if (editing) {
        await fetch("/api/events-admin", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, data: form }) });
        toast.success("Event updated");
      } else {
        await fetch("/api/events-admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        toast.success("Event created");
      }
      setShowForm(false); setEditing(null); load();
    } catch { toast.error("Failed"); }
  };
  const del = async (id: string) => { if (!confirm("Delete this event?")) return; await fetch("/api/events-admin", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); toast.success("Deleted"); load(); };
  const toggle = async (id: string, active: boolean) => { await fetch("/api/events-admin", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, data: { active: !active } }) }); load(); };

  return (
    <div className="animate-page-reveal">
      <PageHeader eyebrow="Admin" icon={Calendar} title={<>Manage <GoldFoilText>Events</GoldFoilText></>} subtitle="Add, edit, and manage festival calendar dates. Update dates yearly." crumbs={[{ label: "Home", route: "/" }, { label: "Admin", route: "/admin" }, { label: "Events" }]} />
      <section className="bg-ink py-12"><div className="container-x">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-ivory/60">{items.length} events</p>
          <div className="flex gap-2">
            <button onClick={load} className="grid h-10 w-10 place-items-center rounded-full border border-champagne/20 text-champagne hover:bg-champagne/10"><RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /></button>
            <button onClick={startNew} className="btn-luxe"><Plus className="h-4 w-4" /> New Event</button>
          </div>
        </div>
        {showForm && (
          <div className="card-luxe mb-4 space-y-3 p-5">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-[10px] uppercase text-ivory/50">Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Shri Krishna Janmashtami" /></div>
              <div><Label className="text-[10px] uppercase text-ivory/50">Date (display)</Label><Input value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} placeholder="Aug 26, 2026" /></div>
              <div><Label className="text-[10px] uppercase text-ivory/50">Date (ISO)</Label><Input type="date" value={form.dateISO} onChange={e => setForm({ ...form, dateISO: e.target.value })} /></div>
              <div><Label className="text-[10px] uppercase text-ivory/50">Image URL</Label><Input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." /></div>
            </div>
            <div><Label className="text-[10px] uppercase text-ivory/50">Highlight</Label><Input value={form.highlight} onChange={e => setForm({ ...form, highlight: e.target.value })} placeholder="Midnight abhishek at Krishna Janmabhoomi" /></div>
            <div><Label className="text-[10px] uppercase text-ivory/50">Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Festival description..." /></div>
            <div className="flex justify-end gap-2"><button onClick={() => { setShowForm(false); setEditing(null); }} className="btn-ghost-luxe">Cancel</button><button onClick={save} className="btn-luxe"><Save className="h-4 w-4" /> {editing ? "Update" : "Create"}</button></div>
          </div>
        )}
        <div className="space-y-2">
          {items.map(e => (
            <div key={e.id} className="card-luxe flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {e.image && <img src={e.image} alt={e.name} className="h-12 w-12 rounded-lg object-cover" />}
                <div>
                  <div className="flex items-center gap-2"><p className="font-serif text-sm text-ivory">{e.name}</p>{e.active ? <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[9px] font-bold text-green-300">ACTIVE</span> : <span className="rounded-full bg-ivory/10 px-2 py-0.5 text-[9px] font-bold text-ivory/40">INACTIVE</span>}</div>
                  <p className="mt-0.5 text-xs text-ivory/50">{e.date || "No date"} · {e.highlight || "No highlight"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(e)} className="rounded-lg border border-champagne/20 px-3 py-1.5 text-xs font-semibold text-champagne hover:bg-champagne/10">Edit</button>
                <button onClick={() => toggle(e.id, e.active)} className="grid h-8 w-8 place-items-center rounded-lg border border-champagne/20 text-champagne hover:bg-champagne/10">{e.active ? <Check className="h-4 w-4 text-green-300" /> : <X className="h-4 w-4" />}</button>
                <button onClick={() => del(e.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div></section>
    </div>
  );
}
