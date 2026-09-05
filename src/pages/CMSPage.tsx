"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Image as ImageIcon, Upload, Plus, Trash2, Save, X, RefreshCw,
  Flame, BedDouble, GalleryHorizontal, Loader2, Check, ArrowUp, ArrowDown,
  CalendarDays, Star, HelpCircle, ShieldCheck, BookOpen,
} from "lucide-react";
import { useHashRoute } from "@/lib/router";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText } from "@/components/site/visuals";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tab = "rooms" | "poojas" | "gallery" | "carousel" | "features" | "events" | "testimonials" | "faqs" | "trustBadges" | "blogPosts";

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

  const load = () => {
    fetch("/api/rooms", { cache: "no-store" }).then(r => r.json()).then(j => setRooms(j.rooms || []));
  };
  useEffect(() => { load(); }, []);

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

  return (
    <div>
      <h2 className="font-serif text-2xl text-ivory">Room Images & Details</h2>
      <p className="mt-1 text-sm text-ivory/60">Upload real room photos. Changes appear on the website instantly.</p>

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
                    <button onClick={() => { setEditing(room.id); setEditImage(room.image); }} className="rounded-full border border-champagne/20 px-3 py-1.5 text-xs font-semibold text-champagne hover:bg-champagne/10">
                      <Upload className="h-3.5 w-3.5 mr-1 inline" /> Change Image
                    </button>
                  )}
                </div>

                {/* Image URL display */}
                <div className="mt-2">
                  <p className="text-[10px] text-ivory/40 break-all">{editing === room.id ? editImage : room.image}</p>
                </div>

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
