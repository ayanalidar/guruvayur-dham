"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Star, Users, Maximize, Bed, MessageCircle, Check, ChevronRight, ArrowLeft, Calendar, Wifi, Snowflake, Tv, ShowerHead,
} from "lucide-react";
import { ROOMS, formatINR, waLink, type Room } from "@/lib/site-data";
import { useHashRoute } from "@/lib/router";
import { getIcon } from "@/components/site/icon-map";
import {
  GoldFoilText, TiltCard, MagneticButton, ImageReveal, MandalaDivider,
} from "@/components/site/visuals";

const amenityLabels: Record<string, string> = {
  Wifi: "Free WiFi", AC: "Air Conditioning", TV: "LED TV", Geyser: "Hot Water",
  HotWater: "24×7 Hot Water", AttachedBath: "Attached Bathroom", RoomService: "Room Service",
  Laundry: "Laundry", PowerBackup: "Power Backup", Parking: "Free Parking", Lift: "Elevator", CCTV: "CCTV Security",
};

export default function RoomDetailPage({ slug }: { slug: string }) {
  const { navigate } = useHashRoute();
  const room = ROOMS.find((r) => r.slug === slug) || ROOMS[0];
  const [activeImg, setActiveImg] = useState(0);

  const waMsg = `Namaskaram! I'd like to book the "${room.name}" at Guruvayur Dham (${formatINR(room.price)}/night). Please share availability.`;
  const related = ROOMS.filter((r) => r.slug !== room.slug).slice(0, 3);

  return (
    <div className="animate-page-reveal">
      {/* Breadcrumbs */}
      <section className="bg-ink-gradient pt-28 pb-6 lg:pt-36">
        <div className="container-x">
          <nav className="flex items-center gap-2 text-xs text-ivory/50">
            <button onClick={() => navigate("/")} className="hover:text-champagne">Home</button>
            <ChevronRight className="h-3 w-3" />
            <button onClick={() => navigate("/rooms")} className="hover:text-champagne">Rooms</button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-champagne">{room.name}</span>
          </nav>
        </div>
      </section>

      {/* Gallery + Overview */}
      <section className="bg-ink-gradient pb-12">
        <div className="container-x grid gap-8 lg:grid-cols-5">
          {/* Gallery */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[16/11] overflow-hidden rounded-2xl border border-champagne/15 shadow-luxe-lg"
            >
              <img
                src={room.gallery[activeImg]}
                alt={`${room.name} — photo ${activeImg + 1} at Guruvayur Dham`}
                className="h-full w-full object-cover photo-cinematic"
              />
              <div className="absolute left-4 top-4 flex gap-2">
                {room.badge && (
                  <span className="rounded-full border border-champagne/30 bg-ink/70 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-champagne backdrop-blur-md">
                    {room.badge}
                  </span>
                )}
                <span className="rounded-full border border-champagne/25 bg-ink/70 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-champagne backdrop-blur-md">
                  {room.type}
                </span>
              </div>
            </motion.div>

            <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
              {room.gallery.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    activeImg === i ? "border-champagne" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={g} alt={`${room.name} thumbnail ${i + 1}`} className="h-full w-full object-cover photo-cinematic" />
                </button>
              ))}
            </div>
          </div>

          {/* Overview */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="font-serif text-4xl leading-tight text-ivory sm:text-5xl" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}>
                {room.name}
              </h1>
              <div className="mt-3 flex items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  <span className="font-bold text-ivory">{room.rating}</span>
                  <span className="text-ivory/50">({room.reviews} reviews)</span>
                </span>
              </div>

              <p className="mt-5 text-base leading-relaxed text-ivory/70">{room.shortDesc}</p>

              <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-champagne/12 bg-ink-card p-5">
                <Spec icon={Users} label="Guests" value={`${room.capacity}`} />
                <Spec icon={Maximize} label="Size" value={room.size} />
                <Spec icon={Bed} label="Bed" value={room.bedType} />
                <Spec icon={Star} label="Rating" value={`${room.rating} ★`} />
              </div>

              <div className="mt-6 flex items-end justify-between rounded-2xl border border-champagne/12 bg-ink-card p-5">
                <div>
                  {room.originalPrice && (
                    <p className="text-xs text-ivory/40 line-through">{formatINR(room.originalPrice)}</p>
                  )}
                  <p className="font-serif text-4xl text-gold-foil">
                    {formatINR(room.price)}
                    <span className="text-sm font-sans font-normal text-ivory/50"> / night</span>
                  </p>
                </div>
                <span className="rounded-full border border-champagne/20 px-3 py-1 text-[10px] uppercase tracking-wider text-champagne">
                  + taxes
                </span>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <MagneticButton href={waLink(waMsg)}>
                  <MessageCircle className="h-5 w-5" /> Check Availability on WhatsApp
                </MagneticButton>
                <button
                  onClick={() => navigate("/rooms")}
                  className="btn-ghost-luxe"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to All Rooms
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="bg-ink py-16 lg:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-serif text-3xl text-ivory">About this room</h2>
            <p className="mt-4 text-base leading-relaxed text-ivory/70">{room.description}</p>

            <h3 className="mt-10 font-serif text-2xl text-ivory">Amenities</h3>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {room.amenities.map((a) => {
                const Icon = getIcon(a);
                return (
                  <div key={a} className="flex items-center gap-3 rounded-xl border border-champagne/10 bg-ink-card p-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg border border-champagne/15 bg-gradient-to-br from-champagne/15 to-transparent text-champagne">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm text-ivory/80">{amenityLabels[a] || a}</span>
                    <Check className="ml-auto h-4 w-4 text-green-400" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Availability sidebar */}
          <div>
            <div className="sticky top-24 rounded-2xl border border-champagne/15 bg-ink-card p-6">
              <h3 className="flex items-center gap-2 font-serif text-xl text-ivory">
                <Calendar className="h-5 w-5 text-champagne" /> Availability
              </h3>
              <p className="mt-2 text-xs text-ivory/50">Next 7 days</p>
              <div className="mt-4 grid grid-cols-7 gap-1.5">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => {
                  const available = i !== 4 && i !== 5;
                  return (
                    <div
                      key={d}
                      className={`rounded-lg border p-2 text-center text-[10px] ${
                        available
                          ? "border-green-500/30 bg-green-500/10 text-green-300"
                          : "border-red-500/30 bg-red-500/10 text-red-300"
                      }`}
                    >
                      <p className="font-bold">{d}</p>
                      <p className="mt-0.5">{available ? "Avail" : "Full"}</p>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-ivory/50">
                * Live availability confirmed on WhatsApp. Weekend rates may apply.
              </p>

              <div className="mt-6 border-t border-champagne/10 pt-5">
                <p className="text-sm font-semibold text-ivory">Quick Book</p>
                <p className="mt-1 text-xs text-ivory/60">
                  Skip the form — message us directly for instant confirmation.
                </p>
                <a
                  href={waLink(waMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-luxe mt-3 w-full"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MandalaDivider />

      {/* Related rooms */}
      <section className="bg-ink pb-20">
        <div className="container-x">
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-3xl text-ivory">Related Rooms</h2>
            <button
              onClick={() => navigate("/rooms")}
              className="inline-flex items-center gap-1 text-sm font-semibold text-champagne hover:text-champagne-bright"
            >
              View All <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {related.map((r) => (
              <TiltCard key={r.slug} maxTilt={5}>
                <button
                  onClick={() => { navigate(`/rooms/${r.slug}`); }}
                  className="card-luxe group block w-full overflow-hidden text-left"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={r.image}
                      alt={r.name}
                      className="h-full w-full object-cover photo-cinematic transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-champagne/80">{r.type}</p>
                      <p className="font-serif text-lg text-ivory">{r.name}</p>
                      <p className="font-serif text-base text-gold-foil">{formatINR(r.price)}</p>
                    </div>
                  </div>
                </button>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Spec({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="text-center">
      <Icon className="mx-auto h-5 w-5 text-champagne" />
      <p className="mt-1 text-[10px] uppercase tracking-wider text-ivory/50">{label}</p>
      <p className="text-sm font-semibold text-ivory">{value}</p>
    </div>
  );
}
