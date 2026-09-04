"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useInView } from "framer-motion";
import { ChevronRight, Star, ArrowUpRight, MapPin, Sparkles, Quote, Phone } from "lucide-react";
import {
  TRUST_BADGES,
  WHY_CHOOSE_US,
  ROOMS,
  DARSHAN_CARDS,
  POOJAS,
  TESTIMONIALS,
  SITE,
  formatINR,
  waLink,
} from "@/lib/site-data";
import { useHashRoute } from "@/lib/router";
import { getIcon } from "@/components/site/icon-map";
import {
  GoldFoilText,
  MandalaDivider,
  FloatingDiyas,
  OmWatermark,
  MagneticButton,
  CountUp,
  TiltCard,
  Marquee,
  ImageReveal,
  SectionHeader,
} from "@/components/site/visuals";
import ReviewsWidget from "@/components/site/ReviewsWidget";

export default function HomePage() {
  const { navigate } = useHashRoute();

  return (
    <div className="animate-page-reveal">
      <Hero />
      <MarqueeStrip />
      <WhyChooseUs />
      <RoomPreviews />
      <PlanDarshan />
      <PoojaPreview />
      <ReviewsWidget />
      <Testimonials />
      <AboutTeaser />
      <FinalCTA />
    </div>
  );
}

/* ============ HERO · 3D TILT CARDS ============ */
function Hero() {
  const { navigate } = useHashRoute();
  const containerRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 200, damping: 20 });

  const onMove = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink">
      {/* Background image with Ken Burns */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 animate-kenburns">
          <img
            src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=1920&h=1280&fit=crop"
            alt="Guruvayur Temple gopuram at golden hour"
            className="h-full w-full object-cover photo-cinematic-strong"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />
      </div>

      {/* Floating diya particles */}
      <FloatingDiyas count={18} />

      {/* Decorative Om */}
      <OmWatermark className="right-[-4rem] top-1/4" size="22rem" />

      <div className="container-x relative z-10 grid items-center gap-12 py-28 lg:grid-cols-2 lg:gap-8">
        {/* Left · text content */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-champagne/25 bg-ink-soft/50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-champagne backdrop-blur-md"
          >
            <span className="h-1.5 w-1.5 animate-diya rounded-full bg-saffron" />
            Stay · Pooja · Blessing · Since 1998
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 font-serif text-[2.5rem] leading-[1.05] tracking-tight text-ivory sm:text-6xl lg:text-[4.5rem]"
            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
          >
            Stay 2 Minutes
            <br />
            from <GoldFoilText>Guruvayur Temple</GoldFoilText>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-ivory/80 sm:text-lg"
          >
            Cinematic dark-luxe rooms, 24×7 hot water, family-friendly. Walk to East Nada
            for Nirmalya Darshan. Book in 30 seconds · no booking fee, instant WhatsApp
            confirmation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <MagneticButton
              href={waLink("Namaskaram! I'd like to book a luxury room at Guruvayur Dham.")}
            >
              Book Now <ChevronRight className="h-4 w-4" />
            </MagneticButton>
            <MagneticButton variant="ghost" onClick={() => navigate("/rooms")}>
              View Rooms <ArrowUpRight className="h-4 w-4" />
            </MagneticButton>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3"
          >
            {TRUST_BADGES.map((b, i) => {
              const Icon = getIcon(b.icon);
              return (
                <div key={i} className="flex items-center gap-2 text-sm font-medium text-ivory/90">
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-champagne/20 bg-ink-soft/50 backdrop-blur-sm">
                    <Icon className="h-4 w-4 text-champagne" />
                  </span>
                  {b.text}
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Right · 3D tilt image cards */}
        <motion.div
          ref={containerRef}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative hidden h-[560px] lg:block"
          style={{ perspective: 1200 }}
        >
          <motion.div
            style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
            className="relative h-full w-full"
          >
            {/* Card 1 · main temple */}
            <div
              className="absolute right-0 top-8 h-72 w-64 overflow-hidden rounded-2xl border border-champagne/20 shadow-luxe-lg"
              style={{ transform: "translateZ(80px)" }}
            >
              <img
                src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=600&h=800&fit=crop"
                alt="Guruvayur Temple gopuram"
                className="h-full w-full object-cover photo-cinematic"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-champagne">2 min walk</p>
                <p className="font-serif text-base text-ivory">East Nada Gate</p>
              </div>
            </div>

            {/* Card 2 · room */}
            <div
              className="absolute left-0 top-32 h-64 w-56 overflow-hidden rounded-2xl border border-champagne/20 shadow-luxe-lg"
              style={{ transform: "translateZ(40px)" }}
            >
              <img
                src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500&h=700&fit=crop"
                alt="Deluxe AC Room at Guruvayur Dham"
                className="h-full w-full object-cover photo-cinematic"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-champagne">From ₹700</p>
                <p className="font-serif text-base text-ivory">52 Luxury Rooms</p>
              </div>
            </div>

            {/* Card 3 · pooja */}
            <div
              className="absolute bottom-0 right-12 h-48 w-48 overflow-hidden rounded-2xl border border-champagne/20 shadow-luxe-lg"
              style={{ transform: "translateZ(120px)" }}
            >
              <img
                src="https://images.unsplash.com/photo-1591025207163-942350e47db2?w=400&h=400&fit=crop"
                alt="Pooja offerings at Guruvayur Temple"
                className="h-full w-full object-cover photo-cinematic"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-champagne">Zero commission</p>
                <p className="font-serif text-base text-ivory">Pooja Booking</p>
              </div>
            </div>

            {/* Floating star stat */}
            <div
              className="absolute left-8 top-0 rounded-2xl border border-champagne/20 bg-ink-card/80 p-4 backdrop-blur-md shadow-luxe-lg"
              style={{ transform: "translateZ(160px)" }}
            >
              <div className="flex items-center gap-1">
                {[0,1,2,3,4].map(i => <Star key={i} className="h-3 w-3 fill-gold text-gold" />)}
              </div>
              <p className="mt-1 font-serif text-2xl text-gold-foil">4.9</p>
              <p className="text-[10px] text-ivory/60">847 reviews</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-24 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-ivory/50 lg:flex"
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <div className="flex h-9 w-5 items-start justify-center rounded-full border border-champagne/30 p-1">
          <motion.span
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="h-1.5 w-1 rounded-full bg-champagne"
          />
        </div>
      </motion.div>
    </section>
  );
}

/* ============ MARQUEE STRIP ============ */
function MarqueeStrip() {
  return (
    <Marquee
      items={[
        "Palpayasam",
        "Thulabharam",
        "Choroonu",
        "Walk to East Nada",
        "4.9 ★ Google Rating",
        "24×7 Hot Water",
        "Free Parking",
        "Pooja Booking",
        "Family Suites",
        "Since 1998",
      ]}
    />
  );
}

/* ============ WHY CHOOSE US ============ */
function WhyChooseUs() {
  const { navigate } = useHashRoute();
  return (
    <section className="relative overflow-hidden bg-ink py-24 lg:py-32">
      <OmWatermark className="left-[-6rem] top-20" size="18rem" />
      <div className="container-x relative">
        <SectionHeader
          eyebrow="Why Pilgrims Choose Us"
          title={<>More Than a Stay · A <GoldFoilText>Pilgrim Companion</GoldFoilText></>}
          subtitle="We've hosted over 50,000 devotees since 1998. Every detail · from 24×7 hot water to free temple darshan guidance · is designed around what a pilgrim actually needs."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_CHOOSE_US.map((item, i) => {
            const Icon = getIcon(item.icon);
            return (
              <TiltCard key={i} maxTilt={6} className="h-full">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                  className="card-luxe group h-full p-7"
                >
                  <span className="grid h-14 w-14 place-items-center rounded-2xl border border-champagne/20 bg-gradient-to-br from-champagne/15 to-transparent text-champagne transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-serif text-xl text-ivory">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ivory/60">{item.text}</p>
                </motion.div>
              </TiltCard>
            );
          })}
        </div>

        {/* Stats strip with count-up */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 grid grid-cols-2 gap-4 rounded-3xl border border-champagne/15 bg-ink-card p-8 sm:grid-cols-4 lg:p-10"
        >
          {[
            { value: 200, suffix: " m", label: "to East Nada gate" },
            { value: 52, suffix: "", label: "AC & non-AC rooms" },
            { value: 50000, suffix: "+", label: "happy pilgrims" },
            { value: 4.9, suffix: " ★", label: "Google rating", decimals: 1 },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="font-serif text-4xl text-gold-foil sm:text-5xl">
                <CountUp to={s.value} suffix={s.suffix} decimals={s.decimals || 0} />
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.15em] text-ivory/60">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ============ ROOM PREVIEWS ============ */
function RoomPreviews() {
  const { navigate } = useHashRoute();
  const featured = ROOMS.slice(0, 4);

  return (
    <section className="relative overflow-hidden bg-ink-soft py-24 lg:py-32">
      <div className="container-x">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeader
            align="left"
            eyebrow="Rooms & Suites"
            title={<>Cinematic Dark-Luxe <GoldFoilText>Rooms</GoldFoilText></>}
            subtitle="From ₹700/night budget rooms to ₹3,500 family suites · every option is sanitised daily and a 2-minute walk from East Nada."
            className="!mx-0"
          />
          <MagneticButton variant="ghost" onClick={() => navigate("/rooms")}>
            View All Rooms <ArrowUpRight className="h-4 w-4" />
          </MagneticButton>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((room, i) => (
            <motion.div
              key={room.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <RoomPreviewCard room={room} onClick={() => navigate(`/rooms/${room.slug}`)} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RoomPreviewCard({ room, onClick }: { room: typeof ROOMS[number]; onClick: () => void }) {
  return (
    <TiltCard maxTilt={6} className="h-full">
      <button
        onClick={onClick}
        className="card-luxe group block h-full w-full overflow-hidden text-left"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={room.image}
            alt={`${room.name} at Guruvayur Dham`}
            className="h-full w-full object-cover photo-cinematic transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
          {room.badge && (
            <span className="absolute left-3 top-3 rounded-full border border-champagne/30 bg-ink/70 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-champagne backdrop-blur-md">
              {room.badge}
            </span>
          )}
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-champagne/80">{room.type}</p>
            <p className="font-serif text-lg text-ivory">{room.name}</p>
            <div className="mt-1 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs">
                <Star className="h-3 w-3 fill-gold text-gold" />
                <span className="font-semibold text-ivory">{room.rating}</span>
                <span className="text-ivory/50">({room.reviews})</span>
              </div>
              <p className="font-serif text-base text-gold-foil">{formatINR(room.price)}</p>
            </div>
          </div>
        </div>
      </button>
    </TiltCard>
  );
}

/* ============ PLAN DARSHAN ============ */
function PlanDarshan() {
  const { navigate } = useHashRoute();
  const routes = ["/blog", "/pooja", "/events"];

  return (
    <section className="relative bg-ink py-24 lg:py-32">
      <div className="container-x">
        <SectionHeader
          eyebrow="Plan Your Darshan"
          title={<>Everything You Need for a <GoldFoilText>Blessed Visit</GoldFoilText></>}
          subtitle="From darshan timings to festival calendars · we've put together the essential resources every Guruvayur pilgrim needs."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {DARSHAN_CARDS.map((card, i) => {
            const Icon = getIcon(card.icon);
            return (
              <TiltCard key={i} maxTilt={5}>
                <motion.button
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  onClick={() => navigate(routes[i])}
                  className="card-luxe group relative h-full w-full overflow-hidden p-8 text-left"
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-champagne/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="grid h-16 w-16 place-items-center rounded-2xl border border-champagne/25 bg-gradient-to-br from-champagne/15 to-transparent text-champagne transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-5 font-serif text-2xl text-ivory">{card.title}</h3>
                  <p className="mt-2 text-sm text-ivory/60">{card.text}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-champagne">
                    {card.cta}
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </motion.button>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============ POOJA PREVIEW ============ */
function PoojaPreview() {
  const { navigate } = useHashRoute();
  const featured = POOJAS.slice(0, 3);

  return (
    <section className="relative overflow-hidden bg-ink-soft py-24 lg:py-32">
      <OmWatermark className="right-[-6rem] top-32" size="20rem" />
      <div className="container-x relative">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeader
            align="left"
            eyebrow="Pooja & Offerings"
            title={<>Book Sacred Poojas at <GoldFoilText>Temple Rates</GoldFoilText></>}
            subtitle="Zero commission, zero waiting in queue. Our team coordinates with the temple tantri on your behalf."
            className="!mx-0"
          />
          <MagneticButton variant="ghost" onClick={() => navigate("/pooja")}>
            View All Poojas <ArrowUpRight className="h-4 w-4" />
          </MagneticButton>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {featured.map((pooja, i) => (
            <motion.div
              key={pooja.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card-luxe group overflow-hidden"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={pooja.image}
                  alt={`${pooja.name} pooja at Guruvayur Temple`}
                  className="h-full w-full object-cover photo-cinematic transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                <span className="absolute bottom-3 right-3 rounded-full border border-champagne/30 bg-ink/70 px-3 py-1 text-xs font-bold text-gold-foil backdrop-blur-md">
                  {formatINR(pooja.price)}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-xl text-ivory">{pooja.name}</h3>
                <p className="mt-2 text-sm text-ivory/60 line-clamp-2">{pooja.description}</p>
                <a
                  href={waLink(`Namaskaram! I'd like to book the "${pooja.name}" pooja at Guruvayur Temple through Guruvayur Dham.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-champagne hover:text-champagne-bright"
                >
                  Book This Pooja <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ TESTIMONIALS ============ */
function Testimonials() {
  const [idx, setIdx] = useState(0);
  const t = TESTIMONIALS[idx];

  return (
    <section className="relative overflow-hidden bg-ink py-24 lg:py-32">
      <FloatingDiyas count={8} />
      <div className="container-x relative">
        <SectionHeader
          eyebrow="Guest Stories"
          title={<>Loved by <GoldFoilText>50,000+ Pilgrims</GoldFoilText></>}
          subtitle={`${SITE.rating} ★ average rating across Google, Booking.com & MakeMyTrip from ${SITE.reviewCount}+ verified reviews.`}
        />

        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mt-12 max-w-3xl"
        >
          <div className="relative rounded-3xl border border-champagne/15 bg-ink-card p-8 backdrop-blur-md sm:p-12">
            <Quote className="h-12 w-12 text-champagne/40" fill="currentColor" />
            <p className="mt-4 font-serif text-xl leading-relaxed text-ivory sm:text-2xl">
              "{t.text}"
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full border border-champagne/25 bg-gradient-to-br from-champagne/15 to-transparent font-serif text-lg text-gold-foil">
                  {t.name.charAt(0)}
                </span>
                <div>
                  <p className="font-semibold text-ivory">{t.name}</p>
                  <p className="text-xs text-ivory/50">{t.city}{t.room && ` · ${t.room}`}</p>
                </div>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < t.rating ? "fill-gold text-gold" : "fill-ivory/10 text-ivory/10"}`} />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Testimonial ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === idx ? "w-8 bg-champagne" : "w-2 bg-ivory/20 hover:bg-ivory/40"}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ============ ABOUT TEASER ============ */
function AboutTeaser() {
  const { navigate } = useHashRoute();

  return (
    <section className="relative overflow-hidden bg-ink-soft py-24 lg:py-32">
      <div className="container-x">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Image collage */}
          <div className="relative">
            <ImageReveal
              src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=1000&fit=crop"
              alt="Guruvayur Dham reception"
              className="aspect-[4/5] rounded-3xl border border-champagne/15 shadow-luxe-lg"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute -bottom-6 -right-4 rounded-2xl border border-champagne/20 bg-ink-card p-5 shadow-luxe-lg backdrop-blur-md sm:-right-6"
            >
              <p className="font-serif text-3xl text-gold-foil">25+</p>
              <p className="text-xs uppercase tracking-[0.15em] text-ivory/60">Years of Service</p>
            </motion.div>
          </div>

          {/* Text */}
          <div>
            <SectionHeader
              align="left"
              eyebrow="About Guruvayur Dham"
              title={<>A Family-Run Pilgrim Home Since <GoldFoilText>1998</GoldFoilText></>}
              className="!mx-0"
            />
            <p className="mt-5 text-base leading-relaxed text-ivory/70">
              Guruvayur Dham began as a small four-room lodge in 1998, when our grandfather
              noticed that pilgrims arriving from distant states had nowhere clean, affordable,
              and walking-distance to stay. Over 25 years and three generations, it has grown
              into a 52-room boutique property that has welcomed over 50,000 devotees.
            </p>
            <p className="mt-4 text-base leading-relaxed text-ivory/70">
              We are not a hotel · we are a pilgrim home. Every decision, from the 3 AM
              reception shift during Nirmalya darshan to the complimentary chai before temple
              visits, is made with the devotee in mind.
            </p>
            <div className="mt-7">
              <MagneticButton variant="ghost" onClick={() => navigate("/about")}>
                Read Our Story <ArrowUpRight className="h-4 w-4" />
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ FINAL CTA ============ */
function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-ink py-24 lg:py-32">
      <FloatingDiyas count={12} />
      <OmWatermark className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" size="24rem" />
      <div className="container-x relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="section-eyebrow">
            <Sparkles className="h-3.5 w-3.5" /> Begin Your Journey
          </span>
          <h2 className="section-title mt-5">
            Your <GoldFoilText>Divine Comfort</GoldFoilText> Awaits
          </h2>
          <p className="section-subtitle mt-5">
            Book your luxury pilgrim stay today. Instant WhatsApp confirmation, zero booking
            fee, and the warmest welcome in Guruvayur.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <MagneticButton
              href={waLink("Namaskaram! I'd like to book a luxury room at Guruvayur Dham.")}
            >
              Book on WhatsApp <ChevronRight className="h-4 w-4" />
            </MagneticButton>
            <MagneticButton variant="ghost" href={`tel:${SITE.phoneRaw}`}>
              <Phone className="h-4 w-4" /> Call Us
            </MagneticButton>
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-ivory/50">
            <MapPin className="h-4 w-4 text-champagne" />
            {SITE.shortAddress}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
