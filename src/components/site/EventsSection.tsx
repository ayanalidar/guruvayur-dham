"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CalendarDays, MapPin, ChevronRight, MessageCircle } from "lucide-react";
import { EVENTS, waLink } from "@/lib/site-data";

export default function EventsSection() {
  return (
    <section id="events" className="relative scroll-mt-20 bg-background py-20 lg:py-28">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">
            <CalendarDays className="h-3.5 w-3.5" /> Festivals &amp; Events
          </span>
          <h2 className="section-title mt-4">
            Plan Your Visit Around{" "}
            <span className="text-gradient-saffron">Sacred Festivals</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Guruvayur's festivals are spiritual experiences of a lifetime. Here are the
            major events for 2026 · book rooms 60+ days in advance for festival dates.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {EVENTS.map((ev, i) => {
            const waMsg = `Namaskaram! I'd like to book a room at Guruvayur Dham for ${ev.name} (${ev.date}). Please share availability and rates.`;
            return (
              <motion.article
                key={ev.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i % 2) * 0.1 }}
                whileHover={{ y: -4 }}
                className="card-warm group flex flex-col overflow-hidden sm:flex-row hover:shadow-warm-lg"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] flex-shrink-0 overflow-hidden sm:w-2/5 sm:aspect-auto">
                  <Image
                    src={ev.image}
                    alt={`${ev.name} festival at Guruvayur Temple`}
                    fill
                    sizes="(max-width: 640px) 100vw, 280px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-maroon-dark/60 to-transparent sm:bg-gradient-to-r" />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-saffron px-3 py-1 text-xs font-bold text-white shadow-warm">
                    <CalendarDays className="h-3 w-3" /> {ev.date}
                  </span>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-serif text-xl text-foreground">{ev.name}</h3>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-saffron-dark">
                    <span className="grid h-1.5 w-1.5 place-items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-saffron" />
                    </span>
                    {ev.highlight}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-4">
                    {ev.description}
                  </p>
                  <a
                    href={waLink(waMsg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 self-start rounded-full bg-saffron/10 px-4 py-2 text-xs font-semibold text-saffron-dark transition-colors hover:bg-saffron hover:text-white"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Book for this festival
                    <ChevronRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Bottom note */}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-2xl border border-gold/30 bg-gold/5 p-6 text-center sm:flex-row sm:text-left">
          <MapPin className="h-8 w-8 flex-shrink-0 text-gold" />
          <div>
            <p className="font-serif text-lg text-foreground">
              Need a custom festival itinerary?
            </p>
            <p className="text-sm text-muted-foreground">
              Our team can coordinate darshan slots, pooja bookings, and accommodation
              for your entire group during peak festival season.
            </p>
          </div>
          <a
            href={waLink(
              "Namaskaram! I'd like to plan a festival-season visit to Guruvayur with a group. Please help me coordinate."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-saffron px-5 py-2.5 text-sm font-semibold text-white shadow-warm transition-colors hover:bg-saffron-dark"
          >
            <MessageCircle className="h-4 w-4" /> Plan My Trip
          </a>
        </div>
      </div>
    </section>
  );
}
