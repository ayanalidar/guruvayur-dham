"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Image as ImageIcon, Upload, Plus, Trash2, Save, X, RefreshCw,
  Flame, BedDouble, GalleryHorizontal, Loader2, Check, ArrowUp, ArrowDown,
  CalendarDays, Star, HelpCircle, ShieldCheck, BookOpen, FileText, Settings,
} from "lucide-react";
import { useHashRoute } from "@/lib/router";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText } from "@/components/site/visuals";
import { SEO_PAGES, getSEOPage } from "@/lib/seo-pages";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { invalidateCMSCache } from "@/lib/use-cms";

type Tab = "rooms" | "poojas" | "gallery" | "carousel" | "features" | "events" | "testimonials" | "faqs" | "trustBadges" | "blogPosts" | "seoPages" | "pricingRules";

export default function CMSPage() {
  const [tab, setTab] = useState<Tab>("rooms");

  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow="Content Management"
        icon={ImageIcon}
        title={<>CMS <GoldFoilText>Editor</GoldFoilText></>}
        subtitle="Edit room images, pooja offerings, gallery photos, and hero carousel. Upload your own images — all changes go live instantly."
        crumbs={[{ label: "Home", route: "/" }, { label: "Admin", route: "/admin" }, { label: "CMS" }]}
      />

      <section className="bg-ink py-12">
        <div className="container-x">
          {/* Tabs */}
          <div className="mb-6 flex gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { key: "rooms" as Tab, label: "Rooms", icon: BedDouble },
              { key: "poojas" as Tab, label: "Poojas", icon: Flame },
              { key: "gallery" as Tab, label: "Gallery", icon: ImageIcon },
              { key: "carousel" as Tab, label: "Carousel", icon: GalleryHorizontal },
              { key: "features" as Tab, label: "Why Us", icon: Check },
              { key: "events" as Tab, label: "Events", icon: CalendarDays },
              { key: "testimonials" as Tab, label: "Reviews", icon: Star },
              { key: "faqs" as Tab, label: "FAQs", icon: HelpCircle },
              { key: "trustBadges" as Tab, label: "Badges", icon: ShieldCheck },
              { key: "blogPosts" as Tab, label: "Blog", icon: BookOpen },
              { key: "seoPages" as Tab, label: "SEO Pages", icon: FileText },
              { key: "pricingRules" as Tab, label: "Pricing", icon: Settings },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex flex-shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                  tab === t.key
                    ? "border border-champagne/30 bg-champagne/15 text-champagne"
                    : "border border-champagne/10 text-ivory/60 hover:bg-champagne/5"
                )}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </div>

          {tab === "rooms" && <RoomsCMS />}
          {tab === "poojas" && <PoojaCMS />}
          {tab === "gallery" && <GalleryCMS />}
          {tab === "carousel" && <CarouselCMS />}
          {tab === "features" && <GenericCMS type="features" title="Why Choose Us" fields={[{ key: "icon", label: "Icon (lucide name)" }, { key: "title", label: "Title" }, { key: "text", label: "Description", textarea: true }]} />}
          {tab === "events" && <GenericCMS type="events" title="Events & Festivals" fields={[{ key: "name", label: "Event Name" }, { key: "date", label: "Date Display" }, { key: "highlight", label: "Highlight" }, { key: "image", label: "Image URL", image: true }, { key: "description", label: "Description", textarea: true }]} />}
          {tab === "testimonials" && <GenericCMS type="testimonials" title="Testimonials" fields={[{ key: "name", label: "Guest Name" }, { key: "city", label: "City" }, { key: "rating", label: "Rating (1-5)" }, { key: "room", label: "Room (optional)" }, { key: "text", label: "Review Text", textarea: true }]} />}
          {tab === "faqs" && <GenericCMS type="faqs" title="FAQs" fields={[{ key: "question", label: "Question" }, { key: "answer", label: "Answer", textarea: true }]} />}
          {tab === "trustBadges" && <GenericCMS type="trustBadges" title="Trust Badges" fields={[{ key: "icon", label: "Icon (lucide name)" }, { key: "text", label: "Badge Text" }]} />}
          {tab === "blogPosts" && <BlogCMS />}
          {tab === "seoPages" && <SEOPagesCMS />}
          {tab === "pricingRules" && <PricingRulesCMS />}
        </div>
      </section>
    </div>
  );
}

/* ============ IMAGE UPLOADER COMPONENT ============ */
function ImageUploader({ onUpload, label }: { onUpload: (url: string) => void; label: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: formData });
      const j = await r.json();
      if (j.error) {
        toast.error(j.error);
      } else {
        onUpload(j.url);
        toast.success("Image uploaded");
      }
    } catch {
      toast.error("Upload failed");
    }
    setUploading(false);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-2 rounded-lg border border-champagne/20 bg-ink/50 px-3 py-2 text-xs font-semibold text-champagne transition-colors hover:bg-champagne/10 disabled:opacity-40"
      >
        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        {uploading ? "Uploading…" : label}
      </button>
    </div>
  );
}

/* ============ ROOMS CMS ============ */
function RoomsCMS() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editImage, setEditImage] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: "",
    slug: "",
    type: "AC",
    price: 1500,
    capacity: 2,
    size: "200 sq.ft",
    bedType: "1 Double Bed",
    shortDesc: "",
    description: "",
    image: "",
    badge: "",
    totalUnits: 1,
  });

  const load = () => {
    invalidateCMSCache();
    fetch("/api/rooms", { cache: "no-store" }).then(r => r.json()).then(j => setRooms(j.rooms || []));
  };
  useEffect(() => { load(); }, []);

  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

  const addRoom = async () => {
    if (!newRoom.name || !newRoom.slug) {
      toast.error("Name and slug are required");
      return;
    }
    const r = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newRoom, slug: slugify(newRoom.slug) }),
    });
    const j = await r.json();
    if (j.error) {
      toast.error(j.error);
      return;
    }
    toast.success("Room added"); invalidateCMSCache();// — visible on website now");
    setShowAdd(false);
    setNewRoom({
      name: "", slug: "", type: "AC", price: 1500, capacity: 2,
      size: "200 sq.ft", bedType: "1 Double Bed", shortDesc: "",
      description: "", image: "", badge: "", totalUnits: 1,
    });
    load();
  };

  const saveImage = async (id: string) => {
    await fetch("/api/rooms", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, data: { image: editImage } }),
    });
    toast.success("Room image updated — live on website now");
    setEditing(null);
    load();
  };

  const deleteRoom = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This will remove the room, its availability, and rate plans. Existing bookings will be preserved for audit.`)) return;
    const r = await fetch(`/api/rooms?id=${id}`, { method: "DELETE" });
    const j = await r.json();
    if (j.error) {
      toast.error(j.error);
      return;
    }
    toast.success(`"${name}" deleted`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-ivory">Room Images & Details</h2>
          <p className="mt-1 text-sm text-ivory/60">Upload real room photos, edit details, or add new rooms. Changes appear on the website instantly.</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-luxe text-xs">
          <Plus className="h-4 w-4" /> Add Room
        </button>
      </div>

      {/* Add room form */}
      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 overflow-hidden">
          <div className="card-luxe p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Room Name</label>
                <input
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value, slug: slugify(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none"
                  placeholder="Deluxe AC Room"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Slug (URL)</label>
                <input
                  value={newRoom.slug}
                  onChange={(e) => setNewRoom({ ...newRoom, slug: slugify(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none font-mono"
                  placeholder="deluxe-ac-room"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Type</label>
                <select
                  value={newRoom.type}
                  onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:outline-none"
                >
                  <option value="AC">AC</option>
                  <option value="Non-AC">Non-AC</option>
                  <option value="Family">Family</option>
                  <option value="Deluxe">Deluxe</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Price (₹/night)</label>
                <input
                  type="number"
                  value={newRoom.price}
                  onChange={(e) => setNewRoom({ ...newRoom, price: parseInt(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none"
                  placeholder="1500"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Capacity (guests)</label>
                <input
                  type="number"
                  value={newRoom.capacity}
                  onChange={(e) => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) || 2 })}
                  className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none"
                  placeholder="2"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Total Units</label>
                <input
                  type="number"
                  value={newRoom.totalUnits}
                  onChange={(e) => setNewRoom({ ...newRoom, totalUnits: parseInt(e.target.value) || 1 })}
                  className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Size</label>
                <input
                  value={newRoom.size}
                  onChange={(e) => setNewRoom({ ...newRoom, size: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none"
                  placeholder="200 sq.ft"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Bed Type</label>
                <input
                  value={newRoom.bedType}
                  onChange={(e) => setNewRoom({ ...newRoom, bedType: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none"
                  placeholder="1 Double Bed"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Short Description</label>
                <input
                  value={newRoom.shortDesc}
                  onChange={(e) => setNewRoom({ ...newRoom, shortDesc: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none"
                  placeholder="Queen bed, AC, courtyard-facing, quiet."
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Full Description (shown on room detail page)</label>
                <textarea
                  value={newRoom.description}
                  onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none resize-none"
                  placeholder="Detailed description of the room, amenities, view, etc."
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Badge (e.g. 'Most Popular')</label>
                <input
                  value={newRoom.badge}
                  onChange={(e) => setNewRoom({ ...newRoom, badge: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none"
                  placeholder="Most Popular"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Room Image</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    value={newRoom.image}
                    onChange={(e) => setNewRoom({ ...newRoom, image: e.target.value })}
                    className="flex-1 rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:outline-none"
                    placeholder="Upload or paste image URL"
                  />
                  <ImageUploader label="Upload" onUpload={(url) => setNewRoom({ ...newRoom, image: url })} />
                </div>
                {newRoom.image && !newRoom.image.startsWith("data:") && (
                  <img src={newRoom.image} alt="Preview" className="mt-2 h-20 w-32 rounded-lg object-cover" />
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={addRoom} className="btn-luxe text-xs">Create Room</button>
              <button onClick={() => setShowAdd(false)} className="btn-ghost-luxe text-xs">Cancel</button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="mt-6 space-y-4">
        {rooms.map((room) => (
          <div key={room.id} className="card-luxe overflow-hidden p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              {/* Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl sm:w-48 flex-shrink-0">
                <img src={editing === room.id ? editImage : room.image} alt={room.name} className="h-full w-full object-cover photo-cinematic" />
                {editing === room.id && (
                  <div className="absolute inset-0 grid place-items-center bg-ink/70">
                    <ImageUploader label="Upload New Image" onUpload={(url) => setEditImage(url)} />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-serif text-lg text-ivory">{room.name}</p>
                    <p className="text-xs text-ivory/50">{room.type} · ₹{room.price}/night · {room.capacity} guests</p>
                  </div>
                  {editing === room.id ? (
                    <div className="flex gap-2">
                      <ImageUploader label="Change Image" onUpload={(url) => setEditImage(url)} />
                      <button onClick={() => saveImage(room.id)} className="rounded-full bg-green-500/15 px-3 py-1.5 text-xs font-semibold text-green-300 hover:bg-green-500/25">
                        <Save className="h-3.5 w-3.5" /> Save
                      </button>
                      <button onClick={() => setEditing(null)} className="rounded-full bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-300">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(room.id); setEditImage(room.image); }} className="rounded-full border border-champagne/20 px-3 py-1.5 text-xs font-semibold text-champagne hover:bg-champagne/10">
                        <Upload className="h-3.5 w-3.5 mr-1 inline" /> Change Image
                      </button>
                      <button onClick={() => deleteRoom(room.id, room.name)} className="rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20">
                        <Trash2 className="h-3.5 w-3.5 mr-1 inline" /> Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Image URL display — hide only if base64 data URL */}
                {(() => {
                  const url = editing === room.id ? editImage : room.image;
                  if (!url || url.startsWith("data:")) return null;
                  const displayUrl = url.length > 60 ? url.substring(0, 57) + "..." : url;
                  return <p className="mt-1 text-[10px] text-ivory/40 truncate">{displayUrl}</p>;
                })()}

                {/* Editable fields */}
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <EditableField label="Name" value={room.name} onSave={(v) => fetch("/api/rooms", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: room.id, data: { name: v } }) }).then(load)} />
                  <EditableField label="Price (₹)" value={String(room.price)} type="number" onSave={(v) => fetch("/api/rooms", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: room.id, data: { price: parseInt(v) } }) }).then(load)} />
                  <EditableField label="Short Description" value={room.shortDesc} onSave={(v) => fetch("/api/rooms", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: room.id, data: { shortDesc: v } }) }).then(load)} />
                  <EditableField label="Total Units" value={String(room.totalUnits)} type="number" onSave={(v) => fetch("/api/rooms", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: room.id, data: { totalUnits: parseInt(v) } }) }).then(load)} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditableField({ label, value, type = "text", onSave }: { label: string; value: string; type?: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-ivory/50">{label}</label>
      {editing ? (
        <div className="flex gap-1">
          <input type={type} value={val} onChange={(e) => setVal(e.target.value)} className="flex-1 rounded-lg border border-champagne/15 bg-ink px-2 py-1 text-sm text-ivory focus:border-champagne/40 focus:outline-none" />
          <button onClick={() => { onSave(val); setEditing(false); toast.success(`${label} updated`); }} className="rounded bg-green-500/20 px-2 text-xs text-green-300">
            <Check className="h-3 w-3" />
          </button>
          <button onClick={() => { setVal(value); setEditing(false); }} className="rounded bg-red-500/20 px-2 text-xs text-red-300">
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button onClick={() => setEditing(true)} className="block w-full truncate text-left text-sm text-ivory hover:text-champagne">
          {value} <span className="text-[10px] text-ivory/30">✎</span>
        </button>
      )}
    </div>
  );
}

/* ============ POOJA CMS ============ */
function PoojaCMS() {
  const [poojas, setPoojas] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newPooja, setNewPooja] = useState({ name: "", price: 51, duration: "15 min", description: "", prasadam: "", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400&fit=crop", significance: "" });

  const load = () => {
    invalidateCMSCache();
    fetch("/api/poojas-admin", { cache: "no-store" }).then(r => r.json()).then(j => setPoojas(j.poojas || []));
  };
  useEffect(() => { load(); }, []);

  const addPooja = async () => {
    if (!newPooja.name) { toast.error("Name required"); return; }
    await fetch("/api/poojas-admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newPooja) });
    toast.success("Pooja added");
    setShowAdd(false);
    setNewPooja({ name: "", price: 51, duration: "15 min", description: "", prasadam: "", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400&fit=crop", significance: "" });
    load();
  };

  const deletePooja = async (id: string) => {
    if (!confirm("Delete this pooja?")) return;
    await fetch(`/api/poojas-admin?id=${id}`, { method: "DELETE" });
    toast.success("Pooja deleted");
    load();
  };

  const updateField = async (id: string, field: string, value: any) => {
    await fetch("/api/poojas-admin", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, data: { [field]: value } }) });
    toast.success(`${field} updated`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-ivory">Pooja Offerings</h2>
          <p className="mt-1 text-sm text-ivory/60">Add, edit, or delete poojas. Changes appear on the website instantly.</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-luxe text-xs">
          <Plus className="h-4 w-4" /> Add Pooja
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 overflow-hidden">
          <div className="card-luxe p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={newPooja.name} onChange={(e) => setNewPooja({ ...newPooja, name: e.target.value })} placeholder="Pooja Name *" className="rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:outline-none" />
              <input type="number" value={newPooja.price} onChange={(e) => setNewPooja({ ...newPooja, price: parseInt(e.target.value) })} placeholder="Price (₹)" className="rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:outline-none" />
              <input value={newPooja.duration} onChange={(e) => setNewPooja({ ...newPooja, duration: e.target.value })} placeholder="Duration (e.g. 15 min)" className="rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:outline-none" />
              <input value={newPooja.prasadam} onChange={(e) => setNewPooja({ ...newPooja, prasadam: e.target.value })} placeholder="Prasadam included" className="rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:outline-none" />
              <textarea value={newPooja.description} onChange={(e) => setNewPooja({ ...newPooja, description: e.target.value })} placeholder="Description" rows={2} className="sm:col-span-2 rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:outline-none resize-none" />
              <textarea value={newPooja.significance} onChange={(e) => setNewPooja({ ...newPooja, significance: e.target.value })} placeholder="Significance" rows={2} className="sm:col-span-2 rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:outline-none resize-none" />
              <div className="sm:col-span-2 flex items-center gap-3">
                <img src={newPooja.image} alt="Preview" className="h-16 w-24 rounded-lg object-cover" />
                <ImageUploader label="Upload Pooja Image" onUpload={(url) => setNewPooja({ ...newPooja, image: url })} />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={addPooja} className="btn-luxe text-xs">Add Pooja</button>
              <button onClick={() => setShowAdd(false)} className="btn-ghost-luxe text-xs">Cancel</button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pooja list */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {poojas.map((p) => (
          <div key={p.id} className="card-luxe overflow-hidden p-4">
            <div className="flex gap-3">
              <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg">
                <img src={p.image} alt={p.name} className="h-full w-full object-cover photo-cinematic" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-serif text-base text-ivory">{p.name}</p>
                    <p className="text-xs text-gold-foil">₹{p.price} · {p.duration}</p>
                  </div>
                  <button onClick={() => deletePooja(p.id)} className="rounded-full bg-red-500/10 px-2 py-1 text-[10px] font-semibold text-red-300 hover:bg-red-500/20">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <p className="mt-1 text-xs text-ivory/50 line-clamp-2">{p.description}</p>
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <EditableField label="Name" value={p.name} onSave={(v) => updateField(p.id, "name", v)} />
              <EditableField label="Price" value={String(p.price)} type="number" onSave={(v) => updateField(p.id, "price", parseInt(v))} />
              <EditableField label="Duration" value={p.duration} onSave={(v) => updateField(p.id, "duration", v)} />
              <EditableField label="Prasadam" value={p.prasadam} onSave={(v) => updateField(p.id, "prasadam", v)} />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <ImageUploader label="Change Image" onUpload={(url) => updateField(p.id, "image", url)} />
              <span className="text-[10px] text-ivory/30">{p.image.slice(-30)}</span>
            </div>
          </div>
        ))}
        {poojas.length === 0 && <p className="py-8 text-center text-sm text-ivory/50">No poojas yet. Click "Add Pooja" to create one.</p>}
      </div>
    </div>
  );
}

/* ============ GALLERY CMS ============ */
function GalleryCMS() {
  const [images, setImages] = useState<any[]>([]);
  const [tab, setTab] = useState("Rooms");

  const load = () => {
    invalidateCMSCache();
    fetch(`/api/gallery?tab=${tab}`, { cache: "no-store" }).then(r => r.json()).then(j => setImages(j.images || []));
  };
  useEffect(() => { load(); }, [tab]);

  const addImage = async (url: string) => {
    await fetch("/api/gallery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tab, src: url, alt: `${tab} photo`, caption: `${tab} at Guruvayur Dham` }) });
    toast.success("Photo added to gallery");
    load();
  };

  const deleteImage = async (id: string) => {
    if (!confirm("Delete this photo?")) return;
    await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
    toast.success("Photo deleted");
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-ivory">Gallery Photos</h2>
          <p className="mt-1 text-sm text-ivory/60">Upload real photos of your property. They appear in the gallery instantly.</p>
        </div>
        <ImageUploader label="Upload Photo" onUpload={addImage} />
      </div>

      {/* Tab selector */}
      <div className="mt-4 flex gap-1.5">
        {["Rooms", "Temple", "Facilities", "Surroundings"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", tab === t ? "border border-champagne/30 bg-champagne/15 text-champagne" : "border border-champagne/10 text-ivory/60")}>
            {t}
          </button>
        ))}
      </div>

      {/* Image grid */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img) => (
          <div key={img.id} className="group relative overflow-hidden rounded-xl border border-champagne/10">
            <img src={img.src} alt={img.alt} className="aspect-square w-full object-cover photo-cinematic" />
            <div className="absolute inset-0 grid place-items-center bg-ink/70 opacity-0 transition-opacity group-hover:opacity-100">
              <button onClick={() => deleteImage(img.id)} className="rounded-full bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-300">
                <Trash2 className="h-3.5 w-3.5 mr-1 inline" /> Delete
              </button>
            </div>
          </div>
        ))}
        {images.length === 0 && <p className="col-span-full py-8 text-center text-sm text-ivory/50">No photos in this category. Upload some!</p>}
      </div>
    </div>
  );
}

/* ============ CAROUSEL CMS ============ */
function CarouselCMS() {
  const [slides, setSlides] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newSlide, setNewSlide] = useState({ title: "", subtitle: "", image: "", ctaText: "Book Now", ctaLink: "/#/book" });

  const load = () => {
    invalidateCMSCache();
    fetch("/api/carousel", { cache: "no-store" }).then(r => r.json()).then(j => setSlides(j.slides || []));
  };
  useEffect(() => { load(); }, []);

  const addSlide = async () => {
    if (!newSlide.title || !newSlide.image) { toast.error("Title and image required"); return; }
    await fetch("/api/carousel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newSlide) });
    toast.success("Carousel slide added");
    setShowAdd(false);
    setNewSlide({ title: "", subtitle: "", image: "", ctaText: "Book Now", ctaLink: "/#/book" });
    load();
  };

  const deleteSlide = async (id: string) => {
    if (!confirm("Delete this slide?")) return;
    await fetch(`/api/carousel?id=${id}`, { method: "DELETE" });
    toast.success("Slide deleted");
    load();
  };

  const updateField = async (id: string, field: string, value: any) => {
    await fetch("/api/carousel", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, data: { [field]: value } }) });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-ivory">Hero Carousel</h2>
          <p className="mt-1 text-sm text-ivory/60">Slides that appear below the hero section. Upload images, add titles and CTAs.</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-luxe text-xs">
          <Plus className="h-4 w-4" /> Add Slide
        </button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 overflow-hidden">
          <div className="card-luxe p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={newSlide.title} onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })} placeholder="Slide Title *" className="rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:outline-none" />
              <input value={newSlide.subtitle} onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })} placeholder="Subtitle (optional)" className="rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:outline-none" />
              <input value={newSlide.ctaText} onChange={(e) => setNewSlide({ ...newSlide, ctaText: e.target.value })} placeholder="Button Text" className="rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:outline-none" />
              <input value={newSlide.ctaLink} onChange={(e) => setNewSlide({ ...newSlide, ctaLink: e.target.value })} placeholder="Button Link" className="rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:outline-none" />
              <div className="sm:col-span-2 flex items-center gap-3">
                {newSlide.image && <img src={newSlide.image} alt="Preview" className="h-16 w-24 rounded-lg object-cover" />}
                <ImageUploader label="Upload Slide Image" onUpload={(url) => setNewSlide({ ...newSlide, image: url })} />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={addSlide} className="btn-luxe text-xs">Add Slide</button>
              <button onClick={() => setShowAdd(false)} className="btn-ghost-luxe text-xs">Cancel</button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="mt-6 space-y-3">
        {slides.map((s, i) => (
          <div key={s.id} className="card-luxe overflow-hidden p-4">
            <div className="flex gap-4">
              <img src={s.image} alt={s.title} className="h-20 w-32 flex-shrink-0 rounded-lg object-cover photo-cinematic" />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-serif text-base text-ivory">{s.title}</p>
                    <p className="text-xs text-ivory/50">{s.subtitle}</p>
                    <p className="mt-1 text-xs text-champagne">Button: {s.ctaText} → {s.ctaLink}</p>
                  </div>
                  <button onClick={() => deleteSlide(s.id)} className="rounded-full bg-red-500/10 px-2 py-1 text-[10px] font-semibold text-red-300">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <ImageUploader label="Change Image" onUpload={(url) => updateField(s.id, "image", url)} />
                  <EditableField label="Title" value={s.title} onSave={(v) => updateField(s.id, "title", v)} />
                </div>
              </div>
            </div>
          </div>
        ))}
        {slides.length === 0 && (
          <div className="rounded-xl border border-dashed border-champagne/20 p-8 text-center">
            <GalleryHorizontal className="mx-auto h-8 w-8 text-ivory/30" />
            <p className="mt-2 text-sm text-ivory/50">No carousel slides yet. Click "Add Slide" to create one.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ GENERIC CMS (for features, events, testimonials, faqs, trustBadges) ============ */
interface CMSField {
  key: string;
  label: string;
  textarea?: boolean;
  image?: boolean;
}

function GenericCMS({ type, title, fields }: { type: string; title: string; fields: CMSField[] }) {
  const [items, setItems] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState<Record<string, string>>({});

  const load = () => {
    invalidateCMSCache();
    fetch(`/api/cms?type=${type}`, { cache: "no-store" })
      .then(r => r.json())
      .then(j => setItems(j.data || []));
  };
  useEffect(() => { load(); }, [type]);

  const addItem = async () => {
    const data: any = { ...newItem, sortOrder: items.length };
    if (newItem.rating) data.rating = parseInt(newItem.rating);
    await fetch("/api/cms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data }),
    });
    toast.success(`${title} item added`);
    setShowAdd(false);
    setNewItem({});
    load();
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/cms?type=${type}&id=${id}`, { method: "DELETE" });
    toast.success("Deleted");
    load();
  };

  const updateField = async (id: string, field: string, value: any) => {
    const data: any = { [field]: field === "rating" ? parseInt(value) : value };
    await fetch("/api/cms", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id, data }),
    });
    toast.success(`${field} updated`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-ivory">{title}</h2>
          <p className="mt-1 text-sm text-ivory/60">Add, edit, or delete {title.toLowerCase()}. Changes appear on the website instantly.</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-luxe text-xs">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 overflow-hidden">
          <div className="card-luxe p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map((f) => (
                <div key={f.key} className={f.textarea ? "sm:col-span-2" : ""}>
                  <label className="text-[10px] uppercase tracking-wider text-ivory/50">{f.label}</label>
                  {f.textarea ? (
                    <textarea
                      value={newItem[f.key] || ""}
                      onChange={(e) => setNewItem({ ...newItem, [f.key]: e.target.value })}
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none resize-none"
                      placeholder={f.label}
                    />
                  ) : f.image ? (
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        value={newItem[f.key] || ""}
                        onChange={(e) => setNewItem({ ...newItem, [f.key]: e.target.value })}
                        className="flex-1 rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:outline-none"
                        placeholder="Image URL or upload"
                      />
                      <ImageUploader label="Upload" onUpload={(url) => setNewItem({ ...newItem, [f.key]: url })} />
                    </div>
                  ) : (
                    <input
                      value={newItem[f.key] || ""}
                      onChange={(e) => setNewItem({ ...newItem, [f.key]: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none"
                      placeholder={f.label}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={addItem} className="btn-luxe text-xs">Add Item</button>
              <button onClick={() => setShowAdd(false)} className="btn-ghost-luxe text-xs">Cancel</button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Items list */}
      <div className="mt-6 space-y-3">
        {items.map((item, idx) => (
          <div key={item.id} className="card-luxe p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Show image if exists */}
                {item.image && (
                  <img src={item.image} alt="" className="mb-2 h-16 w-24 rounded-lg object-cover photo-cinematic" />
                )}
                {/* Inline editable fields */}
                <div className="grid gap-2 sm:grid-cols-2">
                  {fields.map((f) => (
                    <EditableField
                      key={f.key}
                      label={f.label}
                      value={String(item[f.key] || "")}
                      onSave={(v) => updateField(item.id, f.key, v)}
                    />
                  ))}
                </div>
                {/* Image upload for image fields */}
                {fields.some(f => f.image) && (
                  <div className="mt-2">
                    <ImageUploader label="Change Image" onUpload={(url) => updateField(item.id, "image", url)} />
                  </div>
                )}
              </div>
              <button
                onClick={() => deleteItem(item.id)}
                className="rounded-full bg-red-500/10 px-2 py-1 text-[10px] font-semibold text-red-300 hover:bg-red-500/20"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="py-8 text-center text-sm text-ivory/50">No {title.toLowerCase()} yet. Click "Add" to create one.</p>
        )}
      </div>
    </div>
  );
}

/* ============ BLOG CMS (with multi-paragraph content editor) ============ */
function BlogCMS() {
  const [items, setItems] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newPost, setNewPost] = useState({
    slug: "",
    title: "",
    excerpt: "",
    category: "Guide",
    readTime: "5 min",
    date: new Date().toISOString().slice(0, 10),
    image: "",
    content: "",
  });

  const load = () => {
    invalidateCMSCache();
    fetch(`/api/cms?type=blogPosts`, { cache: "no-store" })
      .then(r => r.json())
      .then(j => setItems(j.data || []));
  };
  useEffect(() => { load(); }, []);

  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

  const addPost = async () => {
    if (!newPost.title || !newPost.slug) {
      toast.error("Title and slug are required");
      return;
    }
    const paragraphs = newPost.content
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    await fetch("/api/cms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "blogPosts",
        data: {
          slug: slugify(newPost.slug),
          title: newPost.title,
          excerpt: newPost.excerpt,
          category: newPost.category,
          readTime: newPost.readTime,
          date: newPost.date,
          image: newPost.image,
          content: JSON.stringify(paragraphs),
          published: true,
        },
      }),
    });
    toast.success("Blog post added");
    setShowAdd(false);
    setNewPost({
      slug: "", title: "", excerpt: "", category: "Guide",
      readTime: "5 min", date: new Date().toISOString().slice(0, 10),
      image: "", content: "",
    });
    load();
  };

  const deletePost = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    await fetch(`/api/cms?type=blogPosts&id=${id}`, { method: "DELETE" });
    toast.success("Deleted");
    load();
  };

  const updateField = async (id: string, field: string, value: any) => {
    let v: any = value;
    if (field === "content") {
      const paragraphs = value.split(/\n\n+/).map((p: string) => p.trim()).filter(Boolean);
      v = JSON.stringify(paragraphs);
    }
    await fetch("/api/cms", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "blogPosts", id, data: { [field]: v } }),
    });
    toast.success(`${field} updated`);
    load();
  };

  const contentToText = (c: string): string => {
    if (!c) return "";
    try {
      const parsed = JSON.parse(c);
      if (Array.isArray(parsed)) return parsed.join("\n\n");
      return String(c);
    } catch {
      return String(c);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-ivory">Blog Posts</h2>
          <p className="mt-1 text-sm text-ivory/60">
            Add articles · separate paragraphs with a blank line. Changes go live instantly.
          </p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-luxe text-xs">
          <Plus className="h-4 w-4" /> New Post
        </button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 overflow-hidden">
          <div className="card-luxe p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Title</label>
                <input
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value, slug: slugify(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none"
                  placeholder="Complete Guide to Guruvayur Darshan Timings"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Slug</label>
                <input
                  value={newPost.slug}
                  onChange={(e) => setNewPost({ ...newPost, slug: slugify(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none font-mono"
                  placeholder="complete-guide-darshan-timings"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Category</label>
                <input
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none"
                  placeholder="Guide / Festival / Travel Tips"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Read Time</label>
                <input
                  value={newPost.readTime}
                  onChange={(e) => setNewPost({ ...newPost, readTime: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none"
                  placeholder="5 min"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Date</label>
                <input
                  type="date"
                  value={newPost.date}
                  onChange={(e) => setNewPost({ ...newPost, date: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Image URL</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    value={newPost.image}
                    onChange={(e) => setNewPost({ ...newPost, image: e.target.value })}
                    className="flex-1 rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:outline-none"
                    placeholder="https://..."
                  />
                  <ImageUploader label="Upload" onUpload={(url) => setNewPost({ ...newPost, image: url })} />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Excerpt (1–2 sentences shown in card)</label>
                <textarea
                  value={newPost.excerpt}
                  onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none resize-none"
                  placeholder="Short summary that appears on the blog card..."
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">
                  Article Body · separate paragraphs with a blank line
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={8}
                  className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none font-mono"
                  placeholder={"First paragraph...\n\nSecond paragraph...\n\nThird paragraph..."}
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={addPost} className="btn-luxe text-xs">Publish Post</button>
              <button onClick={() => setShowAdd(false)} className="btn-ghost-luxe text-xs">Cancel</button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="mt-6 space-y-3">
        {items.map((post) => (
          <div key={post.id} className="card-luxe p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {post.image && (
                  <img src={post.image} alt="" className="mb-2 h-16 w-24 rounded-lg object-cover photo-cinematic" />
                )}
                <p className="font-mono text-[10px] text-ivory/40">/{post.slug}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <EditableField label="Title" value={post.title} onSave={(v) => updateField(post.id, "title", v)} />
                  <EditableField label="Category" value={post.category} onSave={(v) => updateField(post.id, "category", v)} />
                  <EditableField label="Date" value={post.date} onSave={(v) => updateField(post.id, "date", v)} />
                  <EditableField label="Read Time" value={post.readTime} onSave={(v) => updateField(post.id, "readTime", v)} />
                  <div className="sm:col-span-2">
                    <EditableField label="Excerpt" value={post.excerpt} onSave={(v) => updateField(post.id, "excerpt", v)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] uppercase tracking-wider text-ivory/50">
                      Article Body · separate paragraphs with a blank line
                    </label>
                    <textarea
                      defaultValue={contentToText(post.content)}
                      onBlur={(e) => updateField(post.id, "content", e.target.value)}
                      rows={6}
                      className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none font-mono"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <ImageUploader label="Change Image" onUpload={(url) => updateField(post.id, "image", url)} />
                </div>
              </div>
              <button
                onClick={() => deletePost(post.id)}
                className="rounded-full bg-red-500/10 px-2 py-1 text-[10px] font-semibold text-red-300 hover:bg-red-500/20"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="py-8 text-center text-sm text-ivory/50">
            No blog posts yet. Click "New Post" to create one — your existing posts will fall back to hardcoded samples.
          </p>
        )}
      </div>
    </div>
  );
}

/* ============ SEO PAGES CMS (edit festival/hotel/darshan guides) ============ */
function SEOPagesCMS() {
  const [selectedSlug, setSelectedSlug] = useState(SEO_PAGES[0].slug);
  const [contentMap, setContentMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<any>(null);

  const load = async () => {
    invalidateCMSCache();
    const r = await fetch("/api/content", { cache: "no-store" });
    const j = await r.json();
    setContentMap(j.map || {});
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    const configPage = getSEOPage(selectedSlug);
    if (!configPage) return;
    const cmsRaw = contentMap[`seo.${selectedSlug}`];
    if (cmsRaw) {
      try {
        const parsed = JSON.parse(cmsRaw);
        setDraft({
          ...configPage,
          ...parsed,
          _introText: Array.isArray(parsed.intro) ? parsed.intro.join("\n\n") : (configPage.intro || []).join("\n\n"),
          _sections: (parsed.sections || configPage.sections || []).map((s: any) => ({
            heading: s.heading || "",
            _bodyText: Array.isArray(s.body) ? s.body.join("\n\n") : "",
          })),
          _faqs: parsed.faqs || configPage.faqs || [],
        });
      } catch {
        setDraft(toDraft(configPage));
      }
    } else {
      setDraft(toDraft(configPage));
    }
  }, [selectedSlug, contentMap]);

  if (loading || !draft) {
    return <div className="py-12 text-center text-ivory/50">Loading…</div>;
  }

  const save = async () => {
    setSaving(true);
    const data = {
      title: draft.title,
      metaDescription: draft.metaDescription,
      eyebrow: draft.eyebrow,
      ctaHeadline: draft.ctaHeadline,
      heroImage: draft.heroImage,
      intro: (draft._introText || "").split(/\n\n+/).map((p: string) => p.trim()).filter(Boolean),
      sections: (draft._sections || []).map((s: any) => ({
        heading: s.heading,
        body: (s._bodyText || "").split(/\n\n+/).map((p: string) => p.trim()).filter(Boolean),
      })),
      faqs: draft._faqs || [],
    };
    await fetch("/api/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        updates: [{ key: `seo.${selectedSlug}`, value: JSON.stringify(data) }],
      }),
    });
    toast.success("SEO page saved — live on website now");
    setSaving(false);
    load();
  };

  const updateField = (field: string, value: any) => setDraft({ ...draft, [field]: value });
  const updateSection = (idx: number, field: string, value: string) => {
    const sections = [...draft._sections];
    sections[idx] = { ...sections[idx], [field]: value };
    setDraft({ ...draft, _sections: sections });
  };
  const addSection = () => setDraft({ ...draft, _sections: [...draft._sections, { heading: "", _bodyText: "" }] });
  const removeSection = (idx: number) => setDraft({ ...draft, _sections: draft._sections.filter((_: any, i: number) => i !== idx) });
  const updateFAQ = (idx: number, field: string, value: string) => {
    const faqs = [...draft._faqs];
    faqs[idx] = { ...faqs[idx], [field]: value };
    setDraft({ ...draft, _faqs: faqs });
  };
  const addFAQ = () => setDraft({ ...draft, _faqs: [...draft._faqs, { q: "", a: "" }] });
  const removeFAQ = (idx: number) => setDraft({ ...draft, _faqs: draft._faqs.filter((_: any, i: number) => i !== idx) });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-ivory">SEO Pages Editor</h2>
          <p className="mt-1 text-sm text-ivory/60">Edit festival guides, hotel-near pages, and darshan timing guides. Changes go live instantly.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            className="rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none"
          >
            {SEO_PAGES.map((p) => (
              <option key={p.slug} value={p.slug}>{p.navLabel} ({p.category})</option>
            ))}
          </select>
          <button onClick={save} disabled={saving} className="btn-luxe text-xs whitespace-nowrap">
            {saving ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving…</> : <><Save className="h-3.5 w-3.5" /> Save Page</>}
          </button>
        </div>
      </div>

      {draft.heroImage && (
        <div className="mt-4 overflow-hidden rounded-xl border border-champagne/10">
          <img src={draft.heroImage} alt="" className="h-32 w-full object-cover photo-cinematic" />
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-[10px] uppercase tracking-wider text-ivory/50">Page Title (H1 + SEO title tag)</label>
          <input value={draft.title || ""} onChange={(e) => updateField("title", e.target.value)} className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-[10px] uppercase tracking-wider text-ivory/50">Meta Description ({(draft.metaDescription || "").length} chars — ideal: 120-160)</label>
          <textarea value={draft.metaDescription || ""} onChange={(e) => updateField("metaDescription", e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none resize-none" />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-ivory/50">Eyebrow (small label above title)</label>
          <input value={draft.eyebrow || ""} onChange={(e) => updateField("eyebrow", e.target.value)} className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-ivory/50">CTA Headline (booking button text)</label>
          <input value={draft.ctaHeadline || ""} onChange={(e) => updateField("ctaHeadline", e.target.value)} className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-[10px] uppercase tracking-wider text-ivory/50">Hero Image URL</label>
          <div className="mt-1 flex items-center gap-2">
            <input value={draft.heroImage || ""} onChange={(e) => updateField("heroImage", e.target.value)} className="flex-1 rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:outline-none" placeholder="https://..." />
            <ImageUploader label="Upload" onUpload={(url) => updateField("heroImage", url)} />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label className="text-[10px] uppercase tracking-wider text-ivory/50">Introduction (3 paragraphs — separate with a blank line)</label>
        <textarea
          value={draft._introText || ""}
          onChange={(e) => updateField("_introText", e.target.value)}
          rows={10}
          className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none"
          placeholder={"First paragraph...\n\nSecond paragraph...\n\nThird paragraph..."}
        />
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <label className="text-[10px] uppercase tracking-wider text-ivory/50">Content Sections ({draft._sections.length})</label>
          <button onClick={addSection} className="rounded-full border border-champagne/20 px-3 py-1 text-[10px] font-semibold text-champagne hover:bg-champagne/10">
            <Plus className="h-3 w-3 inline" /> Add Section
          </button>
        </div>
        <div className="mt-2 space-y-3">
          {draft._sections.map((sec: any, i: number) => (
            <div key={i} className="card-luxe p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold text-champagne/60">Section {i + 1}</span>
                <button onClick={() => removeSection(i)} className="rounded-full bg-red-500/10 px-2 py-1 text-[10px] font-semibold text-red-300 hover:bg-red-500/20">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <input
                value={sec.heading || ""}
                onChange={(e) => updateSection(i, "heading", e.target.value)}
                className="mt-2 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none"
                placeholder="Section heading..."
              />
              <textarea
                value={sec._bodyText || ""}
                onChange={(e) => updateSection(i, "_bodyText", e.target.value)}
                rows={5}
                className="mt-2 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none"
                placeholder={"Paragraph 1...\n\nParagraph 2..."}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <label className="text-[10px] uppercase tracking-wider text-ivory/50">FAQs ({draft._faqs.length}) — also used for Google rich results</label>
          <button onClick={addFAQ} className="rounded-full border border-champagne/20 px-3 py-1 text-[10px] font-semibold text-champagne hover:bg-champagne/10">
            <Plus className="h-3 w-3 inline" /> Add FAQ
          </button>
        </div>
        <div className="mt-2 space-y-3">
          {draft._faqs.map((faq: any, i: number) => (
            <div key={i} className="card-luxe p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold text-champagne/60">FAQ {i + 1}</span>
                <button onClick={() => removeFAQ(i)} className="rounded-full bg-red-500/10 px-2 py-1 text-[10px] font-semibold text-red-300 hover:bg-red-500/20">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <input
                value={faq.q || ""}
                onChange={(e) => updateFAQ(i, "q", e.target.value)}
                className="mt-2 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none"
                placeholder="Question..."
              />
              <textarea
                value={faq.a || ""}
                onChange={(e) => updateFAQ(i, "a", e.target.value)}
                rows={3}
                className="mt-2 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none"
                placeholder="Answer..."
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={save} disabled={saving} className="btn-luxe text-sm">
          {saving ? <><RefreshCw className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save Page</>}
        </button>
      </div>
    </div>
  );
}

function toDraft(page: any) {
  return {
    ...page,
    _introText: (page.intro || []).join("\n\n"),
    _sections: (page.sections || []).map((s: any) => ({
      heading: s.heading,
      _bodyText: (s.body || []).join("\n\n"),
    })),
    _faqs: page.faqs || [],
  };
}

/* ============ PRICING RULES CMS (dynamic pricing editor) ============ */
function PricingRulesCMS() {
  const [rules, setRules] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newRule, setNewRule] = useState({
    name: "",
    type: "WEEKEND",
    multiplier: 1.3,
    startDate: "",
    endDate: "",
    dayOfWeek: "5,6",
    roomType: "",
    active: true,
    priority: 0,
  });

  const load = () => {
    invalidateCMSCache();
    fetch("/api/pricing-rules", { cache: "no-store" })
      .then(r => r.json())
      .then(j => setRules(j.rules || []));
  };
  useEffect(() => { load(); }, []);

  const addRule = async () => {
    if (!newRule.name) { toast.error("Name required"); return; }
    await fetch("/api/pricing-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRule),
    });
    toast.success("Pricing rule added");
    setShowAdd(false);
    setNewRule({ name: "", type: "WEEKEND", multiplier: 1.3, startDate: "", endDate: "", dayOfWeek: "5,6", roomType: "", active: true, priority: 0 });
    load();
  };

  const deleteRule = async (id: string) => {
    if (!confirm("Delete this pricing rule?")) return;
    await fetch(`/api/pricing-rules?id=${id}`, { method: "DELETE" });
    toast.success("Rule deleted");
    load();
  };

  const updateField = async (id: string, field: string, value: any) => {
    await fetch("/api/pricing-rules", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, data: { [field]: value } }),
    });
    toast.success(`${field} updated`);
    load();
  };

  const ruleTypes = ["WEEKEND", "FESTIVAL", "LAST_MINUTE", "EARLY_BIRD", "SEASONAL"];
  const roomTypes = ["", "AC", "Non-AC", "Family", "Deluxe"];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-ivory">Dynamic Pricing Rules</h2>
          <p className="mt-1 text-sm text-ivory/60">Control surge pricing, discounts, and seasonal rates. Rules auto-apply to all bookings.</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-luxe text-xs">
          <Plus className="h-4 w-4" /> Add Rule
        </button>
      </div>

      {/* Add rule form */}
      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 overflow-hidden">
          <div className="card-luxe p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Rule Name</label>
                <input value={newRule.name} onChange={e => setNewRule({ ...newRule, name: e.target.value })} className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" placeholder="Weekend Surge" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Type</label>
                <select value={newRule.type} onChange={e => setNewRule({ ...newRule, type: e.target.value })} className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:outline-none">
                  {ruleTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Multiplier (1.3 = 30% surge, 0.8 = 20% off)</label>
                <input type="number" step="0.1" value={newRule.multiplier} onChange={e => setNewRule({ ...newRule, multiplier: parseFloat(e.target.value) })} className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" placeholder="1.3" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Priority (higher = applied first)</label>
                <input type="number" value={newRule.priority} onChange={e => setNewRule({ ...newRule, priority: parseInt(e.target.value) })} className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" placeholder="0" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Start Date (optional)</label>
                <input type="date" value={newRule.startDate} onChange={e => setNewRule({ ...newRule, startDate: e.target.value })} className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">End Date (optional)</label>
                <input type="date" value={newRule.endDate} onChange={e => setNewRule({ ...newRule, endDate: e.target.value })} className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Days of Week (comma-separated: 0=Sun, 5=Fri, 6=Sat)</label>
                <input value={newRule.dayOfWeek} onChange={e => setNewRule({ ...newRule, dayOfWeek: e.target.value })} className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" placeholder="5,6" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Room Type (blank = all rooms)</label>
                <select value={newRule.roomType} onChange={e => setNewRule({ ...newRule, roomType: e.target.value })} className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:outline-none">
                  {roomTypes.map(t => <option key={t} value={t}>{t || "All Rooms"}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={addRule} className="btn-luxe text-xs">Create Rule</button>
              <button onClick={() => setShowAdd(false)} className="btn-ghost-luxe text-xs">Cancel</button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Rules list */}
      <div className="mt-6 space-y-3">
        {rules.map((rule) => (
          <div key={rule.id} className="card-luxe p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-serif text-lg text-ivory">{rule.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${rule.active ? "bg-green-500/15 text-green-300" : "bg-ivory/10 text-ivory/40"}`}>
                    {rule.active ? "Active" : "Inactive"}
                  </span>
                  <span className="rounded-full bg-champagne/10 px-2 py-0.5 text-[10px] font-bold text-champagne">{rule.type}</span>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-ivory/50">Multiplier</label>
                    <input type="number" step="0.1" defaultValue={rule.multiplier} onBlur={e => updateField(rule.id, "multiplier", e.target.value)} className="mt-0.5 w-full rounded-lg border border-champagne/15 bg-ink px-2 py-1 text-sm text-ivory focus:border-champagne/40 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-ivory/50">Days (0-6)</label>
                    <input defaultValue={rule.dayOfWeek || ""} onBlur={e => updateField(rule.id, "dayOfWeek", e.target.value)} className="mt-0.5 w-full rounded-lg border border-champagne/15 bg-ink px-2 py-1 text-sm text-ivory focus:border-champagne/40 focus:outline-none" placeholder="All" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-ivory/50">Room Type</label>
                    <input defaultValue={rule.roomType || ""} onBlur={e => updateField(rule.id, "roomType", e.target.value)} className="mt-0.5 w-full rounded-lg border border-champagne/15 bg-ink px-2 py-1 text-sm text-ivory focus:border-champagne/40 focus:outline-none" placeholder="All" />
                  </div>
                </div>
                {(rule.startDate || rule.endDate) && (
                  <p className="mt-2 text-xs text-ivory/40">
                    {rule.startDate ? `From: ${new Date(rule.startDate).toLocaleDateString("en-IN")}` : ""} {rule.endDate ? `To: ${new Date(rule.endDate).toLocaleDateString("en-IN")}` : ""}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <button onClick={() => updateField(rule.id, "active", !rule.active)} className={`rounded-full px-3 py-1 text-[10px] font-semibold ${rule.active ? "bg-green-500/15 text-green-300" : "bg-ivory/10 text-ivory/50"}`}>
                  {rule.active ? "Active" : "Inactive"}
                </button>
                <button onClick={() => deleteRule(rule.id)} className="rounded-full bg-red-500/10 px-2 py-1 text-[10px] font-semibold text-red-300 hover:bg-red-500/20">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {rules.length === 0 && (
          <p className="py-8 text-center text-sm text-ivory/50">No pricing rules yet. Click "Add Rule" to create surge pricing, discounts, or seasonal rates.</p>
        )}
      </div>
    </div>
  );
}
