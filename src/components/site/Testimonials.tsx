"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { TESTIMONIALS, SITE } from "@/lib/site-data";
import { useContent, useCMSList, mapTestimonial, type TestimonialItem } from "@/lib/use-cms";

export default function Testimonials() {
  const { get } = useContent();
  // Testimonials: prefer CMS, fall back to hardcoded TESTIMONIALS
  const cmsTestimonials = useCMSList<TestimonialItem>("testimonials", []);
  const testimonials = cmsTestimonials.length > 0 ? cmsTestimonials.map(mapTestimonial) : TESTIMONIALS;

  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);

  // Reset index if it goes out of bounds when testimonials list changes
  useEffect(() => {
    if (idx >= testimonials.length) setIdx(0);
  }, [testimonials.length, idx]);

  const next = useCallback(() => {
    setDir(1);
    setIdx((i) => (i + 1) % Math.max(1, testimonials.length));
  }, [testimonials.length]);

  const prev = () => {
    setDir(-1);
    setIdx((i) => (i - 1 + testimonials.length) % Math.max(1, testimonials.length));
  };

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next, testimonials.length]);

  const eyebrow = get("testimonials.eyebrow", "Guest Stories");
  const title = get("testimonials.title", "Loved by 50,000+ Pilgrims");
  const subtitle = get(
    "testimonials.subtitle",
    `${SITE.rating} ★ average rating across Google, Booking.com & MakeMyTrip from ${SITE.reviewCount}+ verified reviews.`
  );

  if (testimonials.length === 0) return null;
  const t = testimonials[idx];

  return (
    <section className="relative overflow-hidden bg-gradient-maroon py-20 text-cream lg:py-28">
      {/* Decorative pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute left-1/4 top-10 h-40 w-40 rounded-full bg-saffron/40 blur-3xl" />
        <div className="absolute right-1/4 bottom-10 h-40 w-40 rounded-full bg-gold/30 blur-3xl" />
      </div>

      <div className="container-x relative">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gold-light">
            <Star className="h-3.5 w-3.5 fill-gold-light" /> {eyebrow}
          </span>
          <h2 className="mt-4 font-serif text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          <p className="mt-3 text-cream/80">
            {subtitle}
          </p>
        </div>

        {/* Carousel */}
        <div className="relative mx-auto mt-12 max-w-3xl">
          <div className="relative min-h-[280px] sm:min-h-[260px]">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={idx}
                custom={dir}
                initial={{ opacity: 0, x: dir * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -60 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-md sm:p-10"
              >
                <Quote className="h-10 w-10 text-gold/60" fill="currentColor" />
                <p className="mt-4 text-base leading-relaxed text-cream sm:text-lg">
                  {t.text}
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-saffron font-serif text-lg text-white">
                      {t.name.charAt(0)}
                    </span>
                    <div>
                      <p className="font-semibold text-white">{t.name}</p>
                      <p className="text-xs text-cream/70">
                        {t.city}
                        {t.room && <span> · {t.room}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < t.rating
                            ? "fill-gold text-gold"
                            : "fill-white/10 text-white/10"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/5 text-cream transition-colors hover:bg-white/15"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDir(i > idx ? 1 : -1);
                    setIdx(i);
                  }}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === idx ? "w-8 bg-gold" : "w-2 bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              aria-label="Next testimonial"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/5 text-cream transition-colors hover:bg-white/15"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
