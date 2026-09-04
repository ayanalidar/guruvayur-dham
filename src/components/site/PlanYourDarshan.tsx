"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { DARSHAN_CARDS } from "@/lib/site-data";
import { getIcon } from "./icon-map";

const scrollTo = (id: string) => {
  const el = document.getElementById(id.replace("#", ""));
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top, behavior: "smooth" });
  }
};

const accentMap: Record<string, string> = {
  saffron: "from-saffron to-saffron-dark",
  maroon: "from-maroon to-maroon-dark",
  gold: "from-gold to-gold-light",
};

export default function PlanYourDarshan() {
  return (
    <section className="relative overflow-hidden bg-muted/40 py-20 lg:py-24">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">Plan Your Darshan</span>
          <h2 className="section-title mt-4">
            Everything You Need for a{" "}
            <span className="text-gradient-saffron">Blessed Visit</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            From darshan timings to festival calendars — we've put together the
            essential resources every Guruvayur pilgrim needs.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {DARSHAN_CARDS.map((card, i) => {
            const Icon = getIcon(card.icon);
            return (
              <motion.button
                key={i}
                onClick={() => scrollTo(card.href)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="card-warm group relative overflow-hidden p-7 text-left hover:shadow-warm-lg"
              >
                {/* Top gradient bar */}
                <div
                  className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${accentMap[card.accent]}`}
                />

                <div className="flex items-start justify-between">
                  <span
                    className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${accentMap[card.accent]} text-white shadow-warm transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className="h-7 w-7" />
                  </span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-saffron" />
                </div>

                <h3 className="mt-5 font-serif text-2xl text-foreground">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {card.text}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-saffron-dark">
                  {card.cta}
                  <ChevronRight className="h-4 w-4" />
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
