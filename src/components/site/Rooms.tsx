"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Star, Users, Maximize, Bed, MessageCircle, Eye, Check, X } from "lucide-react";
import {
  ROOMS,
  formatINR,
  waLink,
  type Room,
  type RoomType,
} from "@/lib/site-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getIcon } from "./icon-map";

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

export default function Rooms() {
  const [typeF, setTypeF] = useState<RoomType | "All">("All");
  const [budgetF, setBudgetF] = useState(0);
  const [occF, setOccF] = useState(0);
  const [selected, setSelected] = useState<Room | null>(null);

  const filtered = useMemo(() => {
    return ROOMS.filter((r) => {
      if (typeF !== "All" && r.type !== typeF) return false;
      const b = BUDGET_FILTERS[budgetF];
      if (r.price < b.min || r.price > b.max) return false;
      if (r.capacity < OCCUPANCY_FILTERS[occF].min) return false;
      return true;
    });
  }, [typeF, budgetF, occF]);

  return (
    <section id="rooms" className="relative scroll-mt-20 bg-background py-20 lg:py-28">
      <div className="container-x">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="section-eyebrow">Rooms &amp; Suites</span>
          <h2 className="section-title mt-4">
            Clean Rooms in Guruvayur —{" "}
            <span className="text-gradient-saffron">Walkable to Temple</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            From ₹700/night budget rooms to ₹3,500 family suites · every option is
            sanitised daily, comes with 24×7 hot water and free WiFi, and is a 2-minute
            walk from East Nada. Filter to find your perfect match.
          </p>
        </div>

        {/* Filter bar (sticky) */}
        <div className="sticky top-16 z-30 -mx-4 mt-10 mb-8 border-y border-border bg-card/95 px-4 py-3 backdrop-blur-md lg:top-20">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
              onChange={(v) =>
                setBudgetF(BUDGET_FILTERS.findIndex((b) => b.label === v))
              }
            />
            <FilterGroup
              label="Guests"
              options={OCCUPANCY_FILTERS.map((o) => o.label)}
              value={OCCUPANCY_FILTERS[occF].label}
              onChange={(v) =>
                setOccF(OCCUPANCY_FILTERS.findIndex((o) => o.label === v))
              }
            />
          </div>
        </div>

        {/* Results count */}
        <p className="mb-6 text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
          of {ROOMS.length} rooms
        </p>

        {/* Cards grid */}
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((room) => (
              <RoomCard
                key={room.slug}
                room={room}
                onView={() => setSelected(room)}
              />
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <p className="font-serif text-xl text-foreground">No rooms match your filters</p>
            <button
              onClick={() => {
                setTypeF("All");
                setBudgetF(0);
                setOccF(0);
              }}
              className="mt-3 text-sm font-semibold text-saffron-dark hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Detail dialog */}
      <RoomDetailDialog room={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}:
      </span>
      <div className="flex gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              value === opt
                ? "bg-saffron text-white shadow-warm"
                : "bg-muted text-foreground/70 hover:bg-saffron/10 hover:text-saffron-dark"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function RoomCard({ room, onView }: { room: Room; onView: () => void }) {
  const waMsg = `Namaskaram! I'd like to enquire about the "${room.name}" at Guruvayur Dham (₹${room.price}/night). Please share availability.`;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -6 }}
      className="card-warm group flex flex-col overflow-hidden hover:shadow-warm-lg"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={room.image}
          alt={`${room.name} at Guruvayur Dham · ${room.shortDesc}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {room.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-saffron px-3 py-1 text-xs font-bold text-white shadow-warm">
            {room.badge}
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-maroon shadow-warm backdrop-blur-sm">
          {room.type}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-xl text-foreground">{room.name}</h3>
          <div className="flex flex-shrink-0 items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-gold text-gold" />
            <span className="font-bold text-foreground">{room.rating}</span>
            <span className="text-muted-foreground">({room.reviews})</span>
          </div>
        </div>

        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {room.shortDesc}
        </p>

        {/* Spec row */}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {room.capacity} guests
          </span>
          <span className="inline-flex items-center gap-1">
            <Maximize className="h-3.5 w-3.5" /> {room.size}
          </span>
          <span className="inline-flex items-center gap-1">
            <Bed className="h-3.5 w-3.5" /> {room.bedType}
          </span>
        </div>

        {/* Amenities icons */}
        <div className="mt-4 flex flex-wrap gap-2">
          {room.amenities.slice(0, 6).map((a) => {
            const Icon = getIcon(a);
            return (
              <span
                key={a}
                title={a}
                className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-maroon"
              >
                <Icon className="h-4 w-4" />
              </span>
            );
          })}
          {room.amenities.length > 6 && (
            <span className="grid h-8 place-items-center rounded-lg bg-muted px-2 text-xs font-semibold text-maroon">
              +{room.amenities.length - 6}
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            {room.originalPrice && (
              <p className="text-xs text-muted-foreground line-through">
                {formatINR(room.originalPrice)}
              </p>
            )}
            <p className="font-serif text-2xl text-maroon">
              {formatINR(room.price)}
              <span className="text-xs font-sans font-normal text-muted-foreground">
                {" "}
                / night
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={onView}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-saffron bg-card px-4 py-2 text-xs font-semibold text-saffron-dark transition-colors hover:bg-saffron/10"
            >
              <Eye className="h-3.5 w-3.5" /> View
            </button>
            <a
              href={waLink(waMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-saffron px-4 py-2 text-xs font-semibold text-white shadow-warm transition-colors hover:bg-saffron-dark"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Book
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function RoomDetailDialog({ room, onClose }: { room: Room | null; onClose: () => void }) {
  return (
    <Dialog open={!!room} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl overflow-y-auto p-0 sm:max-w-4xl">
        {room && <RoomDetailContent key={room.slug} room={room} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function RoomDetailContent({ room, onClose }: { room: Room; onClose: () => void }) {
  const [activeImg, setActiveImg] = useState(0);

  const waMsg = `Namaskaram! I'd like to book the "${room.name}" at Guruvayur Dham (₹${room.price}/night). Please share availability.`;

  return (
    <>
      <DialogHeader className="sr-only">
        <DialogTitle>{room.name}</DialogTitle>
        <DialogDescription>{room.shortDesc}</DialogDescription>
      </DialogHeader>

        {/* Image gallery */}
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <Image
            src={room.gallery[activeImg]}
            alt={`${room.name} · photo ${activeImg + 1} at Guruvayur Dham`}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
            priority
          />
          <div className="absolute left-4 top-4 flex gap-2">
            {room.badge && (
              <span className="rounded-full bg-saffron px-3 py-1 text-xs font-bold text-white shadow-warm">
                {room.badge}
              </span>
            )}
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-maroon backdrop-blur-sm">
              {room.type}
            </span>
          </div>
        </div>

        {/* Thumbnails */}
        <div className="flex gap-2 overflow-x-auto border-b border-border px-4 py-3 no-scrollbar">
          {room.gallery.map((g, i) => (
            <button
              key={i}
              onClick={() => setActiveImg(i)}
              className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                activeImg === i ? "border-saffron" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={g}
                alt={`${room.name} thumbnail ${i + 1}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>

        {/* Body content */}
        <div className="space-y-6 p-5 pt-4 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl text-foreground">{room.name}</h2>
              <div className="mt-2 flex items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  <span className="font-bold">{room.rating}</span>
                  <span className="text-muted-foreground">({room.reviews} reviews)</span>
                </span>
              </div>
            </div>
            <div className="text-right">
              {room.originalPrice && (
                <p className="text-xs text-muted-foreground line-through">
                  {formatINR(room.originalPrice)}
                </p>
              )}
              <p className="font-serif text-3xl text-maroon">
                {formatINR(room.price)}
                <span className="text-sm font-sans font-normal text-muted-foreground">
                  {" "}
                  / night
                </span>
              </p>
            </div>
          </div>

          {/* Quick specs */}
          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-muted/50 p-4 sm:grid-cols-4">
            <Spec icon={Users} label="Guests" value={`${room.capacity}`} />
            <Spec icon={Maximize} label="Size" value={room.size} />
            <Spec icon={Bed} label="Bed" value={room.bedType} />
            <Spec icon={Star} label="Rating" value={`${room.rating} ★`} />
          </div>

          {/* Description */}
          <div>
            <h3 className="font-serif text-xl text-foreground">About this room</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {room.description}
            </p>
          </div>

          {/* Amenities full list */}
          <div>
            <h3 className="font-serif text-xl text-foreground">Amenities</h3>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {room.amenities.map((a) => {
                const Icon = getIcon(a);
                return (
                  <div
                    key={a}
                    className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm"
                  >
                    <Icon className="h-4 w-4 flex-shrink-0 text-saffron-dark" />
                    <span className="text-foreground/80">{a.replace(/([A-Z])/g, " $1").trim()}</span>
                    <Check className="ml-auto h-4 w-4 text-green-600" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Availability calendar (static placeholder) */}
          <div>
            <h3 className="font-serif text-xl text-foreground">Availability (next 7 days)</h3>
            <div className="mt-3 grid grid-cols-7 gap-1.5">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => {
                const available = i !== 4 && i !== 5; // simulate Fri/Sat full
                return (
                  <div
                    key={d}
                    className={`rounded-xl border p-2 text-center text-xs ${
                      available
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    <p className="font-bold">{d}</p>
                    <p className="mt-0.5">{available ? "Avail" : "Full"}</p>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              * Live availability confirmed on WhatsApp. Weekend rates may apply.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row">
            <a
              href={waLink(waMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-brand flex-1"
            >
              <MessageCircle className="h-5 w-5" /> Check Availability on WhatsApp
            </a>
            <button onClick={onClose} className="btn-outline-brand text-maroon border-maroon/30 hover:bg-muted">
              <X className="h-5 w-5" /> Close
            </button>
          </div>
        </div>
    </>
  );
}

function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="text-center">
      <Icon className="mx-auto h-5 w-5 text-saffron-dark" />
      <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
