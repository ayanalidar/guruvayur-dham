"use client";

import { motion } from "framer-motion";
import { CalendarDays, MapPin, ChevronRight, MessageCircle, CalendarClock } from "lucide-react";
import { EVENTS, waLink } from "@/lib/site-data";
import { useContent, useCMSList, mapEvent, type EventItem } from "@/lib/use-cms";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText, TiltCard, MagneticButton, MandalaDivider, OmWatermark, SectionHeader } from "@/components/site/visuals";

export default function EventsPage() {
  const { get } = useContent();
  const cmsEvents = useCMSList<EventItem>("events", []);
  const events = cmsEvents.length > 0 ? cmsEvents.map(mapEvent) : EVENTS;

  const eyebrow = get("events.eyebrow", "Festivals & Events");
  const title = get("events.title", "Plan Your Visit Around Sacred Festivals");
  const subtitle = get(
    "events.subtitle",
    "Guruvayur's festivals are spiritual experiences of a lifetime. Here are the major events for 2025-2026 · book rooms 60+ days in advance for festival dates."
  );

  // Split title for gradient on second half
  const titleParts = title.split(" ");
  const titleHighlight = titleParts.length > 3 ? titleParts.slice(-2).join(" ") : "";
  const titlePre = titleHighlight ? titleParts.slice(0, -2).join(" ").trim() : title;

  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow={eyebrow}
        icon={CalendarDays}
        title={<>{titlePre} {titleHighlight && <GoldFoilText>{titleHighlight}</GoldFoilText>}</>}
        subtitle={subtitle}
        crumbs={[{ label: "Home", route: "/" }, { label: "Events" }]}
      />

      <section className="relative overflow-hidden bg-ink py-16 lg:py-20">
        <OmWatermark className="left-[-6rem] top-32" size="20rem" />
        <div className="container-x relative">
          <div className="grid gap-7 lg:grid-cols-2">
            {events.map((ev, i) => {
              const waMsg = `Namaskaram! I'd like to book a room at Guruvayur Dham for ${ev.name} (${ev.date}). Please share availability and rates.`;
              return (
                <TiltCard key={ev.name + i} maxTilt={4} className="h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: (i % 2) * 0.1 }}
                    className="card-luxe group flex h-full flex-col overflow-hidden sm:flex-row"
                  >
                    <div className="relative aspect-[16/10] flex-shrink-0 overflow-hidden sm:w-2/5 sm:aspect-auto">
                      <img
                        src={ev.image}
                        alt={`${ev.name} festival at Guruvayur Temple`}
                        className="h-full w-full object-cover photo-cinematic transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent sm:bg-gradient-to-r" />
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-champagne/30 bg-ink/70 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-champagne backdrop-blur-md">
                        <CalendarClock className="h-3 w-3" /> {ev.date}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-serif text-2xl text-ivory">{ev.name}</h3>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-champagne">
                        <span className="h-1.5 w-1.5 rounded-full bg-saffron animate-diya" />
                        {ev.highlight}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-ivory/60 line-clamp-5">{ev.description}</p>
                      <a
                        href={waLink(waMsg)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 self-start rounded-full border border-champagne/25 px-4 py-2 text-xs font-semibold text-champagne transition-colors hover:bg-champagne/10"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> Book for this festival
                        <ChevronRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </motion.div>
                </TiltCard>
              );
            })}
          </div>

          <MandalaDivider />

          {/* Bottom CTA */}
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-champagne/15 bg-ink-card p-6 text-center sm:flex-row sm:text-left">
            <div className="flex items-center gap-4">
              <MapPin className="h-10 w-10 flex-shrink-0 text-champagne" />
              <div>
                <p className="font-serif text-lg text-ivory">Need a custom festival itinerary?</p>
                <p className="text-sm text-ivory/60">Our team can coordinate darshan slots, pooja bookings, and accommodation for your entire group during peak festival season.</p>
              </div>
            </div>
            <MagneticButton href={waLink("Namaskaram! I'd like to plan a festival-season visit to Guruvayur with a group. Please help me coordinate.")}>
              <MessageCircle className="h-4 w-4" /> Plan My Trip
            </MagneticButton>
          </div>
        </div>
      </section>
    </div>
  );
}
