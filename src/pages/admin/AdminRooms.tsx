"use client";

import { useEffect, useState } from "react";
import { BedDouble, RefreshCw, Save, IndianRupee, Users, Check } from "lucide-react";
import { useHashRoute } from "@/lib/router";
import { fetchRooms, updateRoom } from "@/lib/api-client";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText } from "@/components/site/visuals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AdminRooms() {
  const { navigate } = useHashRoute();
  const [rooms, setRooms] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const r = await fetchRooms();
    setRooms(r);
    const d: Record<string, any> = {};
    for (const room of r) d[room.id] = { price: room.price, originalPrice: room.originalPrice || "", totalUnits: room.totalUnits, name: room.name, shortDesc: room.shortDesc };
    setDrafts(d);
    setLoading(false);
  };
  useEffect(() => {
    let active = true;
    fetchRooms().then((r) => {
      if (!active) return;
      setRooms(r);
      const d: Record<string, any> = {};
      for (const room of r) d[room.id] = { price: room.price, originalPrice: room.originalPrice || "", totalUnits: room.totalUnits, name: room.name, shortDesc: room.shortDesc };
      setDrafts(d);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const isDirty = (id: string) => {
    const room = rooms.find((r) => r.id === id);
    const d = drafts[id];
    if (!room || !d) return false;
    return d.price !== room.price || d.totalUnits !== room.totalUnits || d.name !== room.name || d.shortDesc !== room.shortDesc || (d.originalPrice || "") !== (room.originalPrice || "");
  };

  const save = async (id: string) => {
    const d = drafts[id];
    if (!d) return;
    const data: any = { price: parseInt(d.price) || 0, totalUnits: parseInt(d.totalUnits) || 1, name: d.name, shortDesc: d.shortDesc };
    if (d.originalPrice) data.originalPrice = parseInt(d.originalPrice);
    try {
      await updateRoom(id, data);
      toast.success("Room updated. Changes are live on the website.");
      await load();
    } catch (e) {
      toast.error("Failed to update room");
    }
  };

  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow="Admin"
        icon={BedDouble}
        title={<>Manage <GoldFoilText>Rooms</GoldFoilText></>}
        subtitle="Edit room prices, names, descriptions, and inventory count. Changes go live instantly."
        crumbs={[{ label: "Home", route: "/" }, { label: "Admin", route: "/admin" }, { label: "Rooms" }]}
      />

      <section className="bg-ink py-12">
        <div className="container-x">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-ivory/60">{rooms.length} rooms · edit prices, inventory, and details</p>
            <button onClick={load} className="grid h-10 w-10 place-items-center rounded-full border border-champagne/20 text-champagne hover:bg-champagne/10">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {rooms.map((room) => {
              const d = drafts[room.id] || {};
              const dirty = isDirty(room.id);
              return (
                <div key={room.id} className="card-luxe overflow-hidden">
                  <div className="grid gap-5 p-5 sm:grid-cols-[160px_1fr]">
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                      <img src={room.image} alt={room.name} className="h-full w-full object-cover photo-cinematic" />
                      <span className="absolute left-2 top-2 rounded-full border border-champagne/30 bg-ink/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-champagne backdrop-blur-md">
                        {room.type}
                      </span>
                    </div>
                    {/* Editable fields */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-1">
                          <Label className="text-[10px] uppercase tracking-wider text-ivory/50">Room Name</Label>
                          <Input value={d.name || ""} onChange={(e) => setDrafts({ ...drafts, [room.id]: { ...d, name: e.target.value } })} />
                        </div>
                        {dirty && (
                          <button onClick={() => save(room.id)} className="btn-luxe mt-4">
                            <Save className="h-3.5 w-3.5" /> Save
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wider text-ivory/50">Price (₹/night)</Label>
                          <Input type="number" value={d.price || 0} onChange={(e) => setDrafts({ ...drafts, [room.id]: { ...d, price: e.target.value } })} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wider text-ivory/50">Original Price</Label>
                          <Input type="number" value={d.originalPrice || ""} onChange={(e) => setDrafts({ ...drafts, [room.id]: { ...d, originalPrice: e.target.value } })} placeholder="—" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wider text-ivory/50">Total Units</Label>
                          <Input type="number" value={d.totalUnits || 1} onChange={(e) => setDrafts({ ...drafts, [room.id]: { ...d, totalUnits: e.target.value } })} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase tracking-wider text-ivory/50">Short Description (shown on room cards)</Label>
                        <Input value={d.shortDesc || ""} onChange={(e) => setDrafts({ ...drafts, [room.id]: { ...d, shortDesc: e.target.value } })} />
                      </div>
                      <div className="flex flex-wrap gap-4 pt-2 text-xs text-ivory/50">
                        <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {room.capacity} guests</span>
                        <span className="inline-flex items-center gap-1"><IndianRupee className="h-3 w-3" /> {room.rates?.length || 0} rate plans</span>
                        <span className="inline-flex items-center gap-1"><Check className="h-3 w-3 text-green-400" /> {room.active ? "Active" : "Inactive"}</span>
                      </div>
                    </div>
                  </div>
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
