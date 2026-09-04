"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Clock, Gift, ChevronRight, Sparkles, Flame } from "lucide-react";
import { POOJAS, formatINR, waLink } from "@/lib/site-data";

export default function PoojaSection() {
  return (
    <section
      id="pooja"
      className="relative scroll-mt-20 overflow-hidden bg-gradient-to-b from-background to-muted/40 py-20 lg:py-28"
    >
      {/* Decorative om symbol */}
      <div className="pointer-events-none absolute -right-20 top-20 select-none font-serif text-[20rem] leading-none text-saffron/5">
        ॐ
      </div>

      <div className="container-x relative">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="section-eyebrow">
            <Sparkles className="h-3.5 w-3.5" /> Pooja &amp; Offerings
          </span>
          <h2 className="section-title mt-4">
            Guruvayur Pooja Booking —{" "}
            <span className="text-gradient-saffron">Palpayasam, Thulabharam &amp; More</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Book any temple pooja through Guruvayur Dham at the{" "}
            <strong className="text-foreground">official temple rate</strong> · zero
            commission, zero waiting in queue. Our team coordinates with the temple
            tantri on your behalf and ensures prasadam reaches your room.
          </p>
        </div>

        {/* Intro info bar */}
        <div className="mx-auto mt-10 grid max-w-3xl gap-3 rounded-2xl border border-gold/30 bg-gold/5 p-5 sm:grid-cols-3">
          {[
            { icon: Flame, label: "Zero Commission", value: "Temple rates only" },
            { icon: Clock, label: "Booking Window", value: "Same-day to 3 weeks" },
            { icon: Gift, label: "Prasadam", value: "Delivered to room" },
          ].map((x, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
                <x.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{x.label}</p>
                <p className="text-sm font-semibold text-foreground">{x.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Cards grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {POOJAS.map((pooja, i) => {
            const waMsg = `Namaskaram! I'd like to book the "${pooja.name}" pooja (${formatINR(
              pooja.price
            )}) at Guruvayur Temple through Guruvayur Dham. Please share next available date.`;
            return (
              <motion.article
                key={pooja.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                whileHover={{ y: -6 }}
                className="card-warm group flex flex-col overflow-hidden hover:shadow-warm-lg"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={pooja.image}
                    alt={`${pooja.name} pooja offering at Guruvayur Temple`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-maroon-dark/70 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-maroon backdrop-blur-sm">
                    <Clock className="h-3 w-3" /> {pooja.duration}
                  </span>
                  <span className="absolute bottom-3 right-3 rounded-full bg-saffron px-3 py-1 text-xs font-bold text-white shadow-warm">
                    {formatINR(pooja.price)}
                  </span>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-serif text-xl text-foreground">{pooja.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {pooja.description}
                  </p>

                  <div className="mt-4 space-y-2 rounded-xl bg-muted/50 p-3 text-xs">
                    <p className="flex items-start gap-2">
                      <Gift className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-saffron-dark" />
                      <span className="text-foreground/80">
                        <strong>Prasadam:</strong> {pooja.prasadam}
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gold" />
                      <span className="text-foreground/80">
                        <strong>Significance:</strong> {pooja.significance}
                      </span>
                    </p>
                  </div>

                  <a
                    href={waLink(waMsg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-saffron px-5 py-2.5 text-sm font-semibold text-white shadow-warm transition-all hover:bg-saffron-dark active:scale-[0.98]"
                  >
                    Book This Pooja
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Bottom note */}
        <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-muted-foreground">
          * All pooja bookings are subject to temple availability and confirmation by
          the Guruvayur Devaswom Board. Guruvayur Dham facilitates the booking only —
          no markup is added to the official temple rate.
        </p>
      </div>
    </section>
  );
}
