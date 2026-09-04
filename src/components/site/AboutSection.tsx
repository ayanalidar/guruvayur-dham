"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle2, MapPin, Heart, Award } from "lucide-react";
import { SITE } from "@/lib/site-data";

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top, behavior: "smooth" });
  }
};

const HIGHLIGHTS = [
  "Walking distance (200 m) to Guruvayur Temple East Nada gate",
  "Family-run since 1998 · three generations of warm hospitality",
  "52 rooms across AC, non-AC, family, and dormitory categories",
  "In-house pooja booking coordinator at zero commission",
  "Free covered parking for 25+ vehicles, 24×7 CCTV security",
  "Tie-ups with pure-veg Brahmin hotels for in-room meal delivery",
];

export default function AboutSection() {
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
                    src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=800&fit=crop"
                    alt="Guruvayur Dham reception and lobby area"
                    fill
                    sizes="(max-width: 1024px) 50vw, 300px"
                    className="object-cover"
                  />
                </div>
                <div className="relative aspect-square overflow-hidden rounded-2xl shadow-warm">
                  <Image
                    src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=600&fit=crop"
                    alt="Pure-veg restaurant partner near Guruvayur Dham"
                    fill
                    sizes="(max-width: 1024px) 50vw, 300px"
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="relative aspect-square overflow-hidden rounded-2xl shadow-warm">
                  <Image
                    src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=600&h=600&fit=crop"
                    alt="Guruvayur Temple gopuram visible from Guruvayur Dham rooftop"
                    fill
                    sizes="(max-width: 1024px) 50vw, 300px"
                    className="object-cover"
                  />
                </div>
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-warm">
                  <Image
                    src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&h=800&fit=crop"
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
              <p className="font-serif text-3xl">25+</p>
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
            <span className="section-eyebrow">About Guruvayur Dham</span>
            <h2 className="section-title mt-4">
              A Family-Run Pilgrim Home Since{" "}
              <span className="text-gradient-saffron">1998</span>
            </h2>

            <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>
                Guruvayur Dham began as a small four-room lodge in 1998, when our
                grandfather Shri Krishna Warrier · himself a daily devotee at the temple —
                noticed that pilgrims arriving from distant states had nowhere clean,
                affordable, and walking-distance to stay. What started as a single rented
                house has, over 25 years and three generations, grown into a 52-room
                property that has welcomed over 50,000 devotees from across India and
                the diaspora.
              </p>
              <p>
                We are not a hotel · we are a pilgrim home. Every decision, from the
                3 AM reception shift during Nirmalya darshan to the complimentary chai
                service before temple visits, is made with the devotee in mind. Our
                pooja-booking coordinator works directly with the temple tantri's office
                to secure your slots, and our housekeeping team inspects every room
                against a 22-point checklist before check-in.
              </p>
              <p>
                Our mission is simple: to make every pilgrim's Guruvayur visit
                spiritually fulfilling, physically comfortable, and logistically
                effortless. Whether you're a solo traveller on a quick darshan trip or
                a multi-generational family here for a child's Choroonu ceremony, you'll
                find a warm welcome, honest pricing, and the kind of personal care that
                only a family-run home can offer.
              </p>
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
                  <p className="font-serif text-lg text-foreground">200 m</p>
                  <p className="text-xs text-muted-foreground">to temple</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-maroon" />
                <div>
                  <p className="font-serif text-lg text-foreground">50k+</p>
                  <p className="text-xs text-muted-foreground">guests served</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-gold" />
                <div>
                  <p className="font-serif text-lg text-foreground">4.9 ★</p>
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
