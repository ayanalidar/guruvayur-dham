"use client";
import { useEffect, useState } from "react";
import { HelpCircle, RefreshCw, Save, Plus, Trash2, X, Check, ChevronUp, ChevronDown } from "lucide-react";
import { useHashRoute } from "@/lib/router";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText } from "@/components/site/visuals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminFAQs() {
  const { navigate } = useHashRoute();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ question: "", answer: "", active: true, sortOrder: 0 });

  const load = () => { setLoading(true); fetch("/api/cms?type=faqs").then(r => r.json()).then(j => { setItems(j.items || j.faqs || []); setLoading(false); }); };
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => { load(); }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const startEdit = (f: any) => { setEditing(f); setForm({ question: f.question, answer: f.answer, active: f.active, sortOrder: f.sortOrder || 0 }); setShowForm(true); };
  const startNew = () => { setEditing(null); setForm({ question: "", answer: "", active: true, sortOrder: items.length }); setShowForm(true); };

  const save = async () => {
    try {
      if (editing) {
        await fetch("/api/cms", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "faqs", id: editing.id, data: form }) });
        toast.success("FAQ updated");
      } else {
        await fetch("/api/cms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "faqs", ...form }) });
        toast.success("FAQ created");
      }
      setShowForm(false); setEditing(null); load();
    } catch { toast.error("Failed"); }
  };
  const del = async (id: string) => { if (!confirm("Delete this FAQ?")) return; await fetch("/api/cms", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "faqs", id }) }); toast.success("Deleted"); load(); };
  const toggle = async (id: string, active: boolean) => { await fetch("/api/cms", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "faqs", id, data: { active: !active } }) }); load(); };

  return (
    <div className="animate-page-reveal">
      <PageHeader eyebrow="Admin" icon={HelpCircle} title={<>Manage <GoldFoilText>FAQs</GoldFoilText></>} subtitle="Add, edit, and reorder frequently asked questions shown on the FAQ page." crumbs={[{ label: "Home", route: "/" }, { label: "Admin", route: "/admin" }, { label: "FAQs" }]} />
      <section className="bg-ink py-12"><div className="container-x">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-ivory/60">{items.length} FAQs</p>
          <div className="flex gap-2">
            <button onClick={load} className="grid h-10 w-10 place-items-center rounded-full border border-champagne/20 text-champagne hover:bg-champagne/10"><RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /></button>
            <button onClick={startNew} className="btn-luxe"><Plus className="h-4 w-4" /> New FAQ</button>
          </div>
        </div>
        {showForm && (
          <div className="card-luxe mb-4 space-y-3 p-5">
            <div><Label className="text-[10px] uppercase text-ivory/50">Question</Label><Input value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} placeholder="What is the check-in time?" /></div>
            <div><Label className="text-[10px] uppercase text-ivory/50">Answer</Label><Textarea value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} rows={4} placeholder="Standard check-in is 11:30 AM..." /></div>
            <div className="flex justify-end gap-2"><button onClick={() => { setShowForm(false); setEditing(null); }} className="btn-ghost-luxe">Cancel</button><button onClick={save} className="btn-luxe"><Save className="h-4 w-4" /> {editing ? "Update" : "Create"}</button></div>
          </div>
        )}
        <div className="space-y-2">
          {items.map(f => (
            <div key={f.id} className="card-luxe flex items-start justify-between p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-serif text-sm text-ivory">{f.question}</p>
                  {f.active ? <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[9px] font-bold text-green-300">ACTIVE</span> : <span className="rounded-full bg-ivory/10 px-2 py-0.5 text-[9px] font-bold text-ivory/40">INACTIVE</span>}
                </div>
                <p className="mt-1 text-xs text-ivory/50 line-clamp-2">{f.answer}</p>
              </div>
              <div className="flex gap-1 ml-3">
                <button onClick={() => startEdit(f)} className="rounded-lg border border-champagne/20 px-3 py-1.5 text-xs font-semibold text-champagne hover:bg-champagne/10">Edit</button>
                <button onClick={() => toggle(f.id, f.active)} className="grid h-8 w-8 place-items-center rounded-lg border border-champagne/20 text-champagne hover:bg-champagne/10">{f.active ? <Check className="h-4 w-4 text-green-300" /> : <X className="h-4 w-4" />}</button>
                <button onClick={() => del(f.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div></section>
    </div>
  );
}
