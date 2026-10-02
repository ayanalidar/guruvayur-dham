"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle2, MapPin, Heart, Award } from "lucide-react";
import { SITE } from "@/lib/site-data";
import { useContent } from "@/lib/use-cms";

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top, behavior: "smooth" });
  }
};

const HIGHLIGHTS = [
  "Walking distance to Mata Pathwari Mandir · 3 km drive to Shri Krishna Janmabhoomi",
  "Modern pilgrim hospitality since 2020 · 10,000+ pilgrims served",
  "15+ AC rooms across Deluxe, Privilege Suite, and Family Comfort categories",
  "In-house pooja booking coordinator at zero commission (Mangala Aarti, Abhishek, Rajbhog, Sandhya Aarti)",
  "Free covered parking for 25+ vehicles, 24×7 CCTV security",
  "Tie-ups with pure-veg restaurants for in-room meal delivery",
];

export default function AboutSection() {
  const { get } = useContent();

  const eyebrow = get("about.eyebrow", "About Guruvayur Dham");
  const title = get("about.title", "A Modern Pilgrim Home Since 2020");
  const story = get(
    "about.story",
    "Guruvayur Dham is an inviting haven of comfort and warm hospitality in Mathura. Since 2020, we've welcomed 10,000+ pilgrims with modern AC rooms, premium furnishings, and proximity to all major Braj temples. Owner Ram Meena and his team provide round-the-clock hospitality - from temple darshan guidance to local travel tips - making every pilgrim's Braj journey effortless and memorable."
  );

  // Split title - "Since 2020" should be the gradient-highlighted part
  const titleParts = title.split(/Since\s+/i);
  const titlePre = titleParts.length > 1 ? titleParts[0] + "Since " : title;
  const titleHighlight = titleParts.length > 1 ? titleParts[1] : "";

  // Story paragraphs (split on double-newline)
  const paragraphs = story.split(/\n\n+/).filter(Boolean);

  return (
    <section id="about" className="relative scroll-mt-20 overflow-hidden bg-background py-20 lg:py-28">
      <div className="container-x">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Image collage */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-warm">
                  <Image
                    src="/about/hotel-building.jpg"
                    alt="Guruvayur Dham reception and lobby area"
                    fill
                    sizes="(max-width: 1024px) 50vw, 300px"
                    className="object-cover"
                  />
                </div>
                <div className="relative aspect-square overflow-hidden rounded-2xl shadow-warm">
                  <Image
                    src="/about/ram-meena.jpg"
                    alt="Ram Meena, owner and host of Guruvayur Dham Mathura"
                    fill
                    sizes="(max-width: 1024px) 50vw, 300px"
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="relative aspect-square overflow-hidden rounded-2xl shadow-warm">
                  <Image
                    src="/about/room-suite.jpg"
                    alt="Privilege Suite with seating area at Guruvayur Dham Mathura"
                    fill
                    sizes="(max-width: 1024px) 50vw, 300px"
                    className="object-cover"
                  />
                </div>
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-warm">
                  <Image
                    src="/about/room-king.jpg"
                    alt="Deluxe AC room interior at Guruvayur Dham"
                    fill
                    sizes="(max-width: 1024px) 50vw, 300px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Floating stat */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-2xl bg-gradient-saffron px-6 py-4 text-center text-white shadow-warm-lg"
            >
              <p className="font-serif text-3xl">5+</p>
              <p className="text-xs uppercase tracking-wider">Years of Service</p>
            </motion.div>
          </motion.div>

          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="section-eyebrow">{eyebrow}</span>
            <h2 className="section-title mt-4">
              {titlePre}
              {titleHighlight && <span className="text-gradient-saffron">{titleHighlight}</span>}
            </h2>

            <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {paragraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Highlights */}
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {HIGHLIGHTS.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-saffron" />
                  {h}
                </li>
              ))}
            </ul>

            {/* Mini stats */}
            <div className="mt-7 grid grid-cols-3 gap-4 rounded-2xl bg-muted/50 p-5">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-saffron-dark" />
                <div>
                  <p className="font-serif text-lg text-foreground">2 min</p>
                  <p className="text-xs text-muted-foreground">to Mathura Junction</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-maroon" />
                <div>
                  <p className="font-serif text-lg text-foreground">10k+</p>
                  <p className="text-xs text-muted-foreground">guests served</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-gold" />
                <div>
                  <p className="font-serif text-lg text-foreground">4.8 ★</p>
                  <p className="text-xs text-muted-foreground">Google rating</p>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={() => scrollTo("rooms")} className="btn-brand">
                Explore Rooms
              </button>
              <button onClick={() => scrollTo("contact")} className="btn-outline-brand border-maroon/30 text-maroon hover:bg-muted">
                Visit Us
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
