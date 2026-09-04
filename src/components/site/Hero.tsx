"use client";

import { motion } from "framer-motion";
import { ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import { TRUST_BADGES, SITE, waLink } from "@/lib/site-data";
import { getIcon } from "./icon-map";

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top, behavior: "smooth" });
  }
};

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      {/* Background image with Ken Burns effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 animate-kenburns">
          <Image
            src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=1920&h=1280&fit=crop"
            alt="Guruvayur Temple gopuram at golden hour"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        {/* Maroon gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-maroon-dark/90 via-maroon/70 to-maroon-dark/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-maroon-dark/80 via-transparent to-maroon-dark/30" />
      </div>

      {/* Floating decorative diya */}
      <div className="pointer-events-none absolute right-8 top-32 hidden animate-float lg:block">
        <div className="relative grid h-20 w-20 place-items-center rounded-full bg-gradient-gold shadow-gold animate-diya">
          <span className="font-serif text-3xl text-maroon-dark">🪔</span>
        </div>
      </div>

      <div className="container-x relative z-10 py-24">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-light backdrop-blur-sm"
          >
            <span className="h-2 w-2 rounded-full bg-saffron animate-diya" />
            Nritya · Pooja · Stay · Since 1998
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 font-serif text-4xl leading-[1.1] text-white sm:text-5xl lg:text-6xl"
          >
            Stay 2 Minutes from{" "}
            <span className="text-gradient-gold">Guruvayur Temple</span>.
            Feel the Divine Comfort.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-5 max-w-2xl text-lg leading-relaxed text-cream/90 sm:text-xl"
          >
            Clean AC &amp; non-AC rooms, 24×7 hot water, family-friendly. Walk to East
            Nada for Nirmalya Darshan. Book in 30 seconds · no booking fee, instant
            WhatsApp confirmation.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <a
              href={waLink(
                "Namaskaram! I'd like to book a room at Guruvayur Dham. Please share availability and rates."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-brand group"
            >
              Book Now
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <button onClick={() => scrollTo("rooms")} className="btn-outline-brand group">
              View Rooms
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
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
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm font-medium text-cream/95"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 backdrop-blur-sm">
                    <Icon className="h-4 w-4 text-gold-light" />
                  </span>
                  {b.text}
                </div>
              );
            })}
          </motion.div>

          {/* Google rating chip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md"
          >
            <div className="flex">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-4 w-4 fill-gold text-gold" />
              ))}
            </div>
            <div className="text-sm text-cream">
              <span className="font-bold text-white">{SITE.rating}</span>
              <span className="mx-1 text-cream/70">·</span>
              <span>{SITE.reviewCount}+ Google reviews</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={() => scrollTo("why-us")}
        aria-label="Scroll down"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-24 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-cream/70 lg:flex"
      >
        <span className="text-xs uppercase tracking-[0.2em]">Scroll</span>
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-cream/40 p-1.5">
          <motion.span
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="h-2 w-1 rounded-full bg-cream"
          />
        </div>
      </motion.button>
    </section>
  );
}
