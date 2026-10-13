"use client";

import { useEffect, useState } from "react";
import { BedDouble, RefreshCw, Save, IndianRupee, Users, Check, X } from "lucide-react";
import { useHashRoute } from "@/lib/router";
import { fetchRooms, updateRoom } from "@/lib/api-client";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText } from "@/components/site/visuals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ROOM_TYPES = ["AC", "Deluxe", "Suite", "Family"];

export default function AdminRooms() {
  const { navigate } = useHashRoute();
  const [rooms, setRooms] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const r = await fetchRooms();
    setRooms(r);
    const d: Record<string, any> = {};
    for (const room of r) {
      d[room.id] = {
        name: room.name,
        type: room.type,
        price: room.price,
        originalPrice: room.originalPrice || "",
        totalUnits: room.totalUnits,
        capacity: room.capacity,
        size: room.size,
        bedType: room.bedType,
        badge: room.badge || "",
        shortDesc: room.shortDesc,
        description: room.description,
        image: room.image,
      };
    }
    setDrafts(d);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    fetchRooms().then((r) => {
      if (!active) return;
      setRooms(r);
      const d: Record<string, any> = {};
      for (const room of r) {
        d[room.id] = {
          name: room.name,
          type: room.type,
          price: room.price,
          originalPrice: room.originalPrice || "",
          totalUnits: room.totalUnits,
          capacity: room.capacity,
          size: room.size,
          bedType: room.bedType,
          badge: room.badge || "",
          shortDesc: room.shortDesc,
          description: room.description,
          image: room.image,
        };
      }
      setDrafts(d);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const isDirty = (id: string) => {
    const room = rooms.find((r) => r.id === id);
    const d = drafts[id];
    if (!room || !d) return false;
    return (
      d.name !== room.name ||
      d.type !== room.type ||
      String(d.price) !== String(room.price) ||
      String(d.totalUnits) !== String(room.totalUnits) ||
      String(d.capacity) !== String(room.capacity) ||
      d.size !== room.size ||
      d.bedType !== room.bedType ||
      d.badge !== (room.badge || "") ||
      d.shortDesc !== room.shortDesc ||
      d.description !== room.description ||
      d.image !== room.image ||
      (d.originalPrice || "") !== (room.originalPrice ? String(room.originalPrice) : "")
    );
  };

  const save = async (id: string) => {
    const d = drafts[id];
    if (!d) return;
    const data: any = {
      name: d.name,
      type: d.type,
      price: parseInt(d.price) || 0,
      totalUnits: parseInt(d.totalUnits) || 1,
      capacity: parseInt(d.capacity) || 1,
      size: d.size,
      bedType: d.bedType,
      badge: d.badge || null,
      shortDesc: d.shortDesc,
      description: d.description,
      image: d.image,
    };
    if (d.originalPrice) data.originalPrice = parseInt(d.originalPrice);
    try {
      await updateRoom(id, data);
      toast.success("Room updated. Changes are live on the website.");
      await load();
    } catch (e) {
      toast.error("Failed to update room");
    }
  };

  const updateDraft = (id: string, field: string, value: string) => {
    setDrafts(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow="Admin"
        icon={BedDouble}
        title={<>Manage <GoldFoilText>Rooms</GoldFoilText></>}
        subtitle="Edit room names, prices, descriptions, capacity, bed type, images, and inventory. Changes go live instantly."
        crumbs={[{ label: "Home", route: "/" }, { label: "Admin", route: "/admin" }, { label: "Rooms" }]}
      />

      <section className="bg-ink py-12">
        <div className="container-x">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-ivory/60">{rooms.length} rooms · click any room to expand and edit all fields</p>
            <button onClick={load} className="grid h-10 w-10 place-items-center rounded-full border border-champagne/20 text-champagne hover:bg-champagne/10">
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </button>
          </div>

          <div className="space-y-3">
            {rooms.map((room) => {
              const d = drafts[room.id] || {};
              const dirty = isDirty(room.id);
              const isExpanded = expandedRoom === room.id;

              return (
                <div key={room.id} className="card-luxe overflow-hidden">
                  {/* Collapsed view — always visible */}
                  <div
                    className="grid gap-4 p-4 sm:grid-cols-[120px_1fr_auto] cursor-pointer"
                    onClick={() => setExpandedRoom(isExpanded ? null : room.id)}
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                      <img src={room.image} alt={room.name} className="h-full w-full object-cover photo-cinematic" />
                      <span className="absolute left-1.5 top-1.5 rounded-full border border-champagne/30 bg-ink/70 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-champagne backdrop-blur-md">
                        {room.type}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex flex-col justify-center gap-1">
                      <div className="flex items-center gap-2">
                        <p className="font-serif text-base text-ivory">{room.name}</p>
                        {dirty && (
                          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-amber-300">
                            UNSAVED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ivory/50">{room.shortDesc}</p>
                      <div className="flex flex-wrap gap-3 text-[11px] text-ivory/40">
                        <span className="inline-flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" /> ₹{room.price}/night
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3 w-3" /> {room.capacity} guests
                        </span>
                        <span>{room.size}</span>
                        <span>{room.bedType}</span>
                        <span>{room.totalUnits} units</span>
                      </div>
                    </div>

                    {/* Expand/collapse arrow */}
                    <div className="flex items-center justify-center">
                      <button
                        className="grid h-8 w-8 place-items-center rounded-full border border-champagne/20 text-champagne hover:bg-champagne/10"
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? <X className="h-4 w-4" /> : <BedDouble className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded view — edit all fields */}
                  {isExpanded && (
                    <div className="border-t border-champagne/10 p-5">
                      {/* Image */}
                      <div className="mb-4 grid gap-4 sm:grid-cols-[160px_1fr]">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                          <img src={d.image || room.image} alt={d.name || room.name} className="h-full w-full object-cover photo-cinematic" />
                          <span className="absolute left-2 top-2 rounded-full border border-champagne/30 bg-ink/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-champagne backdrop-blur-md">
                        {d.type || room.type}
                      </span>
                        </div>
                        <div className="space-y-3">
                          {/* Room Name */}
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase tracking-wider text-ivory/50">Room Name</Label>
                            <Input value={d.name || ""} onChange={(e) => updateDraft(room.id, "name", e.target.value)} />
                          </div>

                          {/* Type + Badge */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase tracking-wider text-ivory/50">Room Type</Label>
                              <select
                                value={d.type || ""}
                                onChange={(e) => updateDraft(room.id, "type", e.target.value)}
                                className="w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none"
                              >
                                {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase tracking-wider text-ivory/50">Badge (e.g. "Best for Groups")</Label>
                              <Input value={d.badge || ""} onChange={(e) => updateDraft(room.id, "badge", e.target.value)} placeholder="Best for Groups" />
                            </div>
                          </div>

                          {/* Image URL */}
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase tracking-wider text-ivory/50">Main Image URL</Label>
                            <Input value={d.image || ""} onChange={(e) => updateDraft(room.id, "image", e.target.value)} placeholder="/rooms/deluxe-room-main.jpg" />
                          </div>
                        </div>
                      </div>

                      {/* Price row */}
                      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wider text-ivory/50">Price (₹/night)</Label>
                          <Input type="number" value={d.price || 0} onChange={(e) => updateDraft(room.id, "price", e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wider text-ivory/50">Original Price (strikethrough)</Label>
                          <Input type="number" value={d.originalPrice || ""} onChange={(e) => updateDraft(room.id, "originalPrice", e.target.value)} placeholder="-" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wider text-ivory/50">Total Units (inventory)</Label>
                          <Input type="number" value={d.totalUnits || 1} onChange={(e) => updateDraft(room.id, "totalUnits", e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wider text-ivory/50">Capacity (max guests)</Label>
                          <Input type="number" value={d.capacity || 1} onChange={(e) => updateDraft(room.id, "capacity", e.target.value)} />
                        </div>
                      </div>

                      {/* Specs row */}
                      <div className="mb-4 grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wider text-ivory/50">Size</Label>
                          <Input value={d.size || ""} onChange={(e) => updateDraft(room.id, "size", e.target.value)} placeholder="240 sq.ft" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wider text-ivory/50">Bed Type</Label>
                          <Input value={d.bedType || ""} onChange={(e) => updateDraft(room.id, "bedType", e.target.value)} placeholder="King-Size Bed" />
                        </div>
                      </div>

                      {/* Short Description */}
                      <div className="mb-4 space-y-1">
                        <Label className="text-[10px] uppercase tracking-wider text-ivory/50">Short Description (shown on room cards)</Label>
                        <Input value={d.shortDesc || ""} onChange={(e) => updateDraft(room.id, "shortDesc", e.target.value)} placeholder="King bed + lounge sofa · 2 guests · 240 sq.ft · AC" />
                      </div>

                      {/* Full Description */}
                      <div className="mb-4 space-y-1">
                        <Label className="text-[10px] uppercase tracking-wider text-ivory/50">Full Description (shown on room detail page)</Label>
                        <Textarea
                          value={d.description || ""}
                          onChange={(e) => updateDraft(room.id, "description", e.target.value)}
                          rows={4}
                          placeholder="Detailed room description..."
                        />
                      </div>

                      {/* Stats footer */}
                      <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-ivory/50">
                        <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {room.capacity} guests</span>
                        <span className="inline-flex items-center gap-1"><IndianRupee className="h-3 w-3" /> {room.rates?.length || 0} rate plans</span>
                        <span className="inline-flex items-center gap-1"><Check className="h-3 w-3 text-green-400" /> {room.active ? "Active" : "Inactive"}</span>
                      </div>

                      {/* Save button */}
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => save(room.id)}
                          disabled={!dirty}
                          className="btn-luxe disabled:opacity-40"
                        >
                          <Save className="h-3.5 w-3.5" /> {dirty ? "Save Changes" : "No Changes"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {rooms.length === 0 && (
              <div className="card-luxe p-12 text-center text-ivory/50">{loading ? "Loading…" : "No rooms found."}</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
