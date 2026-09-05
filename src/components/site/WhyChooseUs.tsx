"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { WHY_CHOOSE_US } from "@/lib/site-data";
import { useContent, useCMSList, mapFeature, type Feature } from "@/lib/use-cms";
import { getIcon } from "./icon-map";

export default function WhyChooseUs() {
  const { get } = useContent();
  // Feature cards: prefer CMS, fall back to hardcoded
  const cmsFeatures = useCMSList<Feature>("features", []);
  const features = cmsFeatures.length > 0 ? cmsFeatures.map(mapFeature) : WHY_CHOOSE_US;

  const eyebrow = get("whyChooseUs.eyebrow", "Why Pilgrims Choose Us");
  const title = get("whyChooseUs.title", "More Than a Stay · A Pilgrim Companion");
  const subtitle = get(
    "whyChooseUs.subtitle",
    "We've hosted over 50,000 devotees since 1998. Every detail · from 24×7 hot water to free temple darshan guidance · is designed around what a pilgrim actually needs."
  );

  // Split title so the second half gets the gradient style (preserve original visual)
  const titleParts = title.split("·");
  const titlePre = titleParts.length > 1 ? titleParts[0].trim() : title;
  const titleHighlight = titleParts.length > 1 ? "· " + titleParts.slice(1).join("·").trim() : "";

  return (
    <section id="why-us" className="relative overflow-hidden bg-background py-20 lg:py-28">
      {/* decorative pattern */}
      <div className="pointer-events-none absolute inset-0 pattern-om" />

      <div className="container-x relative">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">{eyebrow}</span>
          <h2 className="section-title mt-4">
            {titlePre}{" "}
            {titleHighlight && <span className="text-gradient-saffron">{titleHighlight}</span>}
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            {subtitle}
          </p>
        </div>

        {/* Cards grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item, i) => {
            const Icon = getIcon(item.icon);
            return (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                whileHover={{ y: -6 }}
                className="card-warm group relative overflow-hidden p-6 hover:shadow-warm-lg"
              >
                {/* Decorative corner accent */}
                <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-gradient-saffron opacity-0 transition-opacity duration-300 group-hover:opacity-10" />

                <div className="relative">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-saffron text-white shadow-warm transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-serif text-xl text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.text}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 grid grid-cols-2 gap-4 rounded-3xl bg-gradient-maroon p-8 text-cream sm:grid-cols-4 lg:p-10"
        >
          {[
            { value: "200 m", label: "to East Nada gate" },
            { value: "52", label: "AC & non-AC rooms" },
            { value: "50,000+", label: "happy pilgrims" },
            { value: "4.9 ★", label: "Google rating" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="font-serif text-3xl text-gold-light sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.15em] text-cream/80">
                {s.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
