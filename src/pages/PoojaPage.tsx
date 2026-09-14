"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Gift, ChevronRight, Sparkles, Flame, MessageCircle } from "lucide-react";
import { POOJAS, formatINR, waLink } from "@/lib/site-data";
import { useContent, useCMSList, type Pooja } from "@/lib/use-cms";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText, TiltCard, MagneticButton, MandalaDivider, OmWatermark, SectionHeader } from "@/components/site/visuals";

export default function PoojaPage() {
  const { get } = useContent();
  const cmsPoojas = useCMSList<Pooja>("poojas", []);
  const poojas = cmsPoojas.length > 0 ? cmsPoojas : POOJAS;

  const eyebrow = get("pooja.eyebrow", "Pooja & Offerings");
  const title = get("pooja.title", "Guruvayur Pooja Booking · Palpayasam, Thulabharam & More");
  const subtitle = get("pooja.subtitle", "Book any temple pooja through Guruvayur Dham at the official temple rate · zero commission, zero waiting in queue. Our team coordinates with the temple tantri on your behalf and ensures prasadam reaches your room.");

  // Split title for gold foil highlight
  const titleParts = title.split("·");
  const titlePre = titleParts.length > 1 ? titleParts[0] + "· " : title;
  const titleHighlight = titleParts.length > 1 ? titleParts.slice(1).join("·").trim() : "";

  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow={eyebrow}
        icon={Flame}
        title={<>{titlePre}{titleHighlight && <GoldFoilText>{titleHighlight}</GoldFoilText>}</>}
        subtitle={subtitle}
        crumbs={[{ label: "Home", route: "/" }, { label: "Pooja" }]}
      />

      {/* Info bar */}
      <section className="bg-ink py-10">
        <div className="container-x">
          <div className="mx-auto grid max-w-4xl gap-3 rounded-2xl border border-champagne/15 bg-ink-card p-6 sm:grid-cols-3">
            {[
              { icon: Flame, label: "Zero Commission", value: "Temple rates only" },
              { icon: Clock, label: "Booking Window", value: "Same-day to 3 weeks" },
              { icon: Gift, label: "Prasadam", value: "Delivered to room" },
            ].map((x, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl border border-champagne/20 bg-gradient-to-br from-champagne/15 to-transparent text-champagne">
                  <x.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-ivory/50">{x.label}</p>
                  <p className="text-sm font-semibold text-ivory">{x.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="relative overflow-hidden bg-ink py-16 lg:py-20">
        <OmWatermark className="right-[-6rem] top-20" size="20rem" />
        <div className="container-x relative">
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {poojas.map((pooja, i) => {
              const waMsg = `Namaskaram! I'd like to book the "${pooja.name}" pooja (${formatINR(pooja.price)}) at Guruvayur Temple through Guruvayur Dham. Please share next available date.`;
              return (
                <TiltCard key={pooja.id} maxTilt={5} className="h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                    className="card-luxe group flex h-full flex-col overflow-hidden"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={pooja.image}
                        alt={`${pooja.name} pooja offering at Guruvayur Temple`}
                        className="h-full w-full object-cover photo-cinematic transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-champagne/25 bg-ink/70 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-champagne backdrop-blur-md">
                        <Clock className="h-3 w-3" /> {pooja.duration}
                      </span>
                      <span className="absolute bottom-3 right-3 rounded-full border border-champagne/30 bg-ink/70 px-3 py-1 text-xs font-bold text-gold-foil backdrop-blur-md">
                        {formatINR(pooja.price)}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-serif text-xl text-ivory">{pooja.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ivory/60 line-clamp-3">{pooja.description}</p>

                      <div className="mt-4 space-y-2 rounded-xl border border-champagne/10 bg-ink/50 p-3 text-xs">
                        <p className="flex items-start gap-2">
                          <Gift className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-champagne" />
                          <span className="text-ivory/70"><strong className="text-ivory">Prasadam:</strong> {pooja.prasadam}</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gold" />
                          <span className="text-ivory/70"><strong className="text-ivory">Significance:</strong> {pooja.significance}</span>
                        </p>
                      </div>

                      <a
                        href={waLink(waMsg)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-luxe mt-5 w-full"
                      >
                        Book This Pooja <ChevronRight className="h-4 w-4" />
                      </a>
                    </div>
                  </motion.div>
                </TiltCard>
              );
            })}
          </div>

          <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-ivory/50">
            * All pooja bookings are subject to temple availability and confirmation by the Guruvayur Devaswom Board. Guruvayur Dham facilitates the booking only · no markup is added to the official temple rate.
          </p>
        </div>
      </section>

      <MandalaDivider />

      {/* Help CTA */}
      <section className="bg-ink pb-20">
        <div className="container-x">
          <div className="rounded-3xl border border-champagne/15 bg-ink-card p-8 text-center sm:p-12">
            <SectionHeader
              eyebrow="Custom Pooja Packages"
              title={<>Need a <GoldFoilText>Combined Package?</GoldFoilText></>}
              subtitle="Travelling with family? We curate combined pooja packages (Palpayasam + Archana + Pushpanjali, etc.) at bundled rates. Message us your requirements."
            />
            <div className="mt-6 flex justify-center">
              <MagneticButton href={waLink("Namaskaram! I'd like to know about combined pooja packages at Guruvayur Dham.")}>
                <MessageCircle className="h-4 w-4" /> Curate My Package
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
