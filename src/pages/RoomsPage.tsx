"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Users, Maximize, Bed, MessageCircle, Eye, Check, Radio } from "lucide-react";
import {
  ROOMS,
  formatINR,
  waLink,
  type Room,
  type RoomType,
} from "@/lib/site-data";
import { useHashRoute } from "@/lib/router";
import { useContent } from "@/lib/use-cms";
import { fetchRooms } from "@/lib/api-client";
import { getIcon } from "@/components/site/icon-map";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText, TiltCard, MagneticButton, SectionHeader, MandalaDivider } from "@/components/site/visuals";
import { BedDouble } from "lucide-react";

const TYPE_FILTERS: (RoomType | "All")[] = ["All", "AC", "Non-AC", "Family", "Deluxe"];
const BUDGET_FILTERS = [
  { label: "Any", min: 0, max: Infinity },
  { label: "₹500-1500", min: 500, max: 1500 },
  { label: "₹1500-3000", min: 1500, max: 3000 },
  { label: "₹3000+", min: 3000, max: Infinity },
];
const OCCUPANCY_FILTERS = [
  { label: "Any", min: 0 },
  { label: "2+", min: 2 },
  { label: "3+", min: 3 },
  { label: "4+", min: 4 },
];

export default function RoomsPage() {
  const { navigate } = useHashRoute();
  const { get } = useContent();
  const [typeF, setTypeF] = useState<RoomType | "All">("All");
  const [budgetF, setBudgetF] = useState(0);
  const [occF, setOccF] = useState(0);
  const [liveAvail, setLiveAvail] = useState<Record<string, number>>({});
  const [cmsRooms, setCmsRooms] = useState<Room[] | null>(null);

  // Fetch rooms from CMS (Prisma)
  useEffect(() => {
    let active = true;
    fetchRooms().then((data) => {
      if (!active) return;
      if (Array.isArray(data) && data.length > 0) {
        // Convert CMS room format to the Room type site-data exports
        const mapped: Room[] = data.map((r: any) => ({
          slug: r.slug,
          name: r.name,
          type: r.type as RoomType,
          price: r.price,
          originalPrice: r.originalPrice ?? undefined,
          rating: r.rating,
          reviews: r.reviews,
          capacity: r.capacity,
          size: r.size,
          bedType: r.bedType,
          image: r.image,
          gallery: Array.isArray(r.gallery) ? r.gallery : (() => { try { return JSON.parse(r.gallery || "[]"); } catch { return []; } })(),
          badge: r.badge ?? undefined,
          description: r.description,
          shortDesc: r.shortDesc,
          amenities: Array.isArray(r.amenities) ? r.amenities : (() => { try { return JSON.parse(r.amenities || "[]"); } catch { return []; } })(),
        }));
        setCmsRooms(mapped);
      } else {
        setCmsRooms(null);
      }
    }).catch(() => active && setCmsRooms(null));
    return () => { active = false; };
  }, []);

  // Fetch live availability for all rooms (today)
  useEffect(() => {
    let active = true;
    fetch("/api/availability?days=1", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (!active || !j.availability) return;
        const map: Record<string, number> = {};
        for (const a of j.availability) {
          map[a.roomSlug] = a.days?.[0]?.available ?? 0;
        }
        setLiveAvail(map);
      });
    return () => { active = false; };
  }, []);

  // Use CMS rooms if available, fall back to hardcoded ROOMS
  const allRooms = cmsRooms || ROOMS;

  const filtered = useMemo(() => {
    return allRooms.filter((r) => {
      if (typeF !== "All" && r.type !== typeF) return false;
      const b = BUDGET_FILTERS[budgetF];
      if (r.price < b.min || r.price > b.max) return false;
      if (r.capacity < OCCUPANCY_FILTERS[occF].min) return false;
      return true;
    });
  }, [allRooms, typeF, budgetF, occF]);

  const eyebrow = get("rooms.eyebrow", "Rooms & Suites");
  const title = get("rooms.title", "Cinematic Dark-Luxe Rooms in Guruvayur");
  const subtitle = get("rooms.subtitle", "From ₹700/night budget rooms to ₹3,500 family suites · every option is sanitised daily, comes with 24×7 hot water and free WiFi, and is a 2-minute walk from East Nada.");

  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow={eyebrow}
        icon={BedDouble}
        title={<>Cinematic Dark-Luxe <GoldFoilText>Rooms</GoldFoilText></>}
        subtitle={subtitle}
        crumbs={[{ label: "Home", route: "/" }, { label: "Rooms" }]}
      />

      {/* Sticky filter bar */}
      <div className="sticky top-16 z-30 border-y border-champagne/10 bg-ink-soft/90 backdrop-blur-md lg:top-20">
        <div className="container-x flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
          <FilterGroup
            label="Type"
            options={TYPE_FILTERS}
            value={typeF}
            onChange={(v) => setTypeF(v as RoomType | "All")}
          />
          <FilterGroup
            label="Budget"
            options={BUDGET_FILTERS.map((b) => b.label)}
            value={BUDGET_FILTERS[budgetF].label}
            onChange={(v) => setBudgetF(BUDGET_FILTERS.findIndex((b) => b.label === v))}
          />
          <FilterGroup
            label="Guests"
            options={OCCUPANCY_FILTERS.map((o) => o.label)}
            value={OCCUPANCY_FILTERS[occF].label}
            onChange={(v) => setOccF(OCCUPANCY_FILTERS.findIndex((o) => o.label === v))}
          />
        </div>
      </div>

      <section className="bg-ink py-16 lg:py-20">
        <div className="container-x">
          <p className="mb-6 text-sm text-ivory/50">
            Showing <span className="font-semibold text-ivory">{filtered.length}</span> of {allRooms.length} rooms
          </p>

          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((room) => (
                <RoomCard
                  key={room.slug}
                  room={room}
                  liveAvailable={liveAvail[room.slug]}
                  onView={() => navigate(`/rooms/${room.slug}`)}
                />
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-champagne/20 bg-ink-card p-12 text-center">
              <p className="font-serif text-xl text-ivory">No rooms match your filters</p>
              <button
                onClick={() => { setTypeF("All"); setBudgetF(0); setOccF(0); }}
                className="mt-3 text-sm font-semibold text-champagne hover:text-champagne-bright"
              >
                Reset all filters
              </button>
            </div>
          )}

          <MandalaDivider />

          {/* Help block */}
          <div className="rounded-3xl border border-champagne/15 bg-ink-card p-8 text-center sm:p-10">
            <SectionHeader
              eyebrow="Need Help Choosing?"
              title={<>Not Sure Which Room <GoldFoilText>Suits You?</GoldFoilText></>}
              subtitle="Message us on WhatsApp with your group size, dates, and budget · we'll recommend the perfect room and share live availability."
            />
            <div className="mt-6 flex justify-center">
              <MagneticButton
                href={waLink("Namaskaram! I need help choosing a room at Guruvayur Dham. Group size, dates, and budget will follow.")}
              >
                <MessageCircle className="h-4 w-4" /> Get Personalised Recommendation
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FilterGroup({
  label, options, value, onChange,
}: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ivory/50">{label}:</span>
      <div className="flex gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              value === opt
                ? "border border-champagne/30 bg-champagne/15 text-champagne"
                : "border border-champagne/10 text-ivory/60 hover:border-champagne/25 hover:text-ivory"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function RoomCard({ room, liveAvailable, onView }: { room: Room; liveAvailable?: number; onView: () => void }) {
  const { navigate } = useHashRoute();
  const waMsg = `Namaskaram! I'd like to enquire about the "${room.name}" at Guruvayur Dham (${formatINR(room.price)}/night). Please share availability.`;
  const available = liveAvailable !== undefined && liveAvailable > 0;
  const soldOut = liveAvailable === 0;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
    >
      <TiltCard maxTilt={5} className="h-full">
        <div className="card-luxe group relative flex h-full flex-col overflow-hidden">
          {/* Live availability badge */}
          {liveAvailable !== undefined && (
            <div className={`absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
              available
                ? "border-green-500/40 bg-green-500/15 text-green-300"
                : "border-red-500/40 bg-red-500/15 text-red-300"
            }`}>
              <Radio className="h-2.5 w-2.5 animate-pulse" />
              {available ? `${liveAvailable} left` : "Sold out"}
            </div>
          )}
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={room.image}
              alt={`${room.name} at Guruvayur Dham · ${room.shortDesc}`}
              className="h-full w-full object-cover photo-cinematic transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
            {room.badge && (
              <span className="absolute left-3 top-3 rounded-full border border-champagne/30 bg-ink/70 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-champagne backdrop-blur-md">
                {room.badge}
              </span>
            )}
            <span className="absolute bottom-3 left-3 rounded-full border border-champagne/25 bg-ink/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-champagne backdrop-blur-md">
              {room.type}
            </span>
          </div>

          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-serif text-xl text-ivory">{room.name}</h3>
              <div className="flex flex-shrink-0 items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-gold text-gold" />
                <span className="font-bold text-ivory">{room.rating}</span>
                <span className="text-ivory/50">({room.reviews})</span>
              </div>
            </div>

            <p className="mt-2 text-sm text-ivory/60 line-clamp-2">{room.shortDesc}</p>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-ivory/50">
              <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {room.capacity} guests</span>
              <span className="inline-flex items-center gap-1"><Maximize className="h-3.5 w-3.5" /> {room.size}</span>
              <span className="inline-flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {room.bedType}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {room.amenities.slice(0, 6).map((a) => {
                const Icon = getIcon(a);
                return (
                  <span key={a} title={a} className="grid h-8 w-8 place-items-center rounded-lg border border-champagne/10 bg-ink/50 text-champagne">
                    <Icon className="h-4 w-4" />
                  </span>
                );
              })}
              {room.amenities.length > 6 && (
                <span className="grid h-8 place-items-center rounded-lg border border-champagne/10 bg-ink/50 px-2 text-xs font-semibold text-champagne">
                  +{room.amenities.length - 6}
                </span>
              )}
            </div>

            <div className="mt-auto flex items-end justify-between gap-3 pt-5">
              <div>
                {room.originalPrice && (
                  <p className="text-xs text-ivory/40 line-through">{formatINR(room.originalPrice)}</p>
                )}
                <p className="font-serif text-2xl text-gold-foil">
                  {formatINR(room.price)}
                  <span className="text-xs font-sans font-normal text-ivory/50"> / night</span>
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={onView}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-champagne/25 px-4 py-2 text-xs font-semibold text-champagne transition-colors hover:bg-champagne/10"
                >
                  <Eye className="h-3.5 w-3.5" /> View
                </button>
                <button
                  onClick={() => navigate(`/rooms/${room.slug}`)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-champagne to-gold-deep px-4 py-2 text-xs font-semibold text-ink transition-transform hover:scale-105"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Book
                </button>
              </div>
            </div>
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
}
