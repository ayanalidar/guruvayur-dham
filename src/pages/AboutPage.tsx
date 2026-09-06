"use client";

import { motion } from "framer-motion";
import { CheckCircle2, MapPin, Heart, Award, ChevronRight, ArrowUpRight } from "lucide-react";
import { SITE } from "@/lib/site-data";
import { useHashRoute } from "@/lib/router";
import { useContent } from "@/lib/use-cms";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText, ImageReveal, MandalaDivider, MagneticButton, CountUp, OmWatermark, SectionHeader } from "@/components/site/visuals";

const HIGHLIGHTS = [
  "Walking distance (200 m) to Guruvayur Temple East Nada gate",
  "Family-run since 1998 · three generations of warm hospitality",
  "52 rooms across AC, non-AC, family, and dormitory categories",
  "In-house pooja booking coordinator at zero commission",
  "Free covered parking for 25+ vehicles, 24×7 CCTV security",
  "Tie-ups with pure-veg Brahmin hotels for in-room meal delivery",
];

export default function AboutPage() {
  const { navigate } = useHashRoute();
  const { get } = useContent();

  const eyebrow = get("about.eyebrow", "About Guruvayur Dham");
  const title = get("about.title", "A Family-Run Pilgrim Home Since 1998");
  const story = get("about.story", "What began as a four-room lodge has, over 25 years and three generations, grown into a 52-room boutique property welcoming over 50,000 devotees from across India and the diaspora.\n\nWe are not a hotel — we are a pilgrim home. Every decision, from the 3 AM reception shift during Nirmalya darshan to the complimentary chai service before temple visits, is made with the devotee in mind.\n\nOur mission is simple: to make every pilgrim's Guruvayur visit spiritually fulfilling, physically comfortable, and logistically effortless.");
  const paragraphs = story.split(/\n\n+/).filter(Boolean);

  // Split title for gold foil
  const titleParts = title.split(/Since\s+/i);
  const titlePre = titleParts.length > 1 ? titleParts[0] + "Since " : title;
  const titleHighlight = titleParts.length > 1 ? titleParts[1] : "";

  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow={eyebrow}
        icon={Heart}
        title={<>{titlePre}{titleHighlight && <GoldFoilText>{titleHighlight}</GoldFoilText>}</>}
        subtitle={paragraphs[0] || ""}
        crumbs={[{ label: "Home", route: "/" }, { label: "About" }]}
      />

      {/* Story + Image collage */}
      <section className="bg-ink py-16 lg:py-20">
        <div className="container-x grid items-start gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <ImageReveal
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=800&fit=crop"
                alt="Guruvayur Dham reception and lobby"
                className="aspect-[3/4] rounded-2xl border border-champagne/15 shadow-luxe"
              />
              <ImageReveal
                src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=600&fit=crop"
                alt="Pure-veg restaurant partner near Guruvayur Dham"
                className="aspect-square rounded-2xl border border-champagne/15 shadow-luxe"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-6">
              <ImageReveal
                src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=600&h=600&fit=crop"
                alt="Guruvayur Temple gopuram visible from Guruvayur Dham rooftop"
                className="aspect-square rounded-2xl border border-champagne/15 shadow-luxe"
              />
              <ImageReveal
                src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&h=800&fit=crop"
                alt="Deluxe AC room interior at Guruvayur Dham"
                className="aspect-[3/4] rounded-2xl border border-champagne/15 shadow-luxe"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="font-serif text-3xl text-ivory sm:text-4xl">Our Story</h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-ivory/70">
              <p>
                Guruvayur Dham began as a small four-room lodge in 1998, when our grandfather
                Shri Krishna Warrier · himself a daily devotee at the temple · noticed that
                pilgrims arriving from distant states had nowhere clean, affordable, and
                walking-distance to stay. What started as a single rented house has, over
                25 years and three generations, grown into a 52-room property that has
                welcomed over 50,000 devotees from across India and the diaspora.
              </p>
              <p>
                We are not a hotel · we are a pilgrim home. Every decision, from the 3 AM
                reception shift during Nirmalya darshan to the complimentary chai service
                before temple visits, is made with the devotee in mind. Our pooja-booking
                coordinator works directly with the temple tantri's office to secure your
                slots, and our housekeeping team inspects every room against a 22-point
                checklist before check-in.
              </p>
              <p>
                Our mission is simple: to make every pilgrim's Guruvayur visit spiritually
                fulfilling, physically comfortable, and logistically effortless. Whether
                you're a solo traveller on a quick darshan trip or a multi-generational
                family here for a child's Choroonu ceremony, you'll find a warm welcome,
                honest pricing, and the kind of personal care that only a family-run home
                can offer.
              </p>
            </div>

            <h3 className="mt-8 font-serif text-xl text-champagne">What Sets Us Apart</h3>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {HIGHLIGHTS.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ivory/70">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-champagne" />
                  {h}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <MagneticButton onClick={() => navigate("/rooms")}>
                Explore Rooms <ArrowUpRight className="h-4 w-4" />
              </MagneticButton>
              <MagneticButton variant="ghost" onClick={() => navigate("/contact")}>
                Visit Us <ChevronRight className="h-4 w-4" />
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </section>

      <MandalaDivider />

      {/* Stats */}
      <section className="relative overflow-hidden bg-ink-soft py-20">
        <OmWatermark className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" size="22rem" />
        <div className="container-x relative">
          <SectionHeader
            eyebrow="By the Numbers"
            title={<>A Legacy of <GoldFoilText>Devotion</GoldFoilText></>}
          />
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { value: 25, suffix: "+", label: "Years of Service" },
              { value: 52, suffix: "", label: "Rooms & Suites" },
              { value: 50000, suffix: "+", label: "Pilgrims Served" },
              { value: 4.9, suffix: " ★", label: "Google Rating", decimals: 1 },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl border border-champagne/12 bg-ink-card p-6 text-center"
              >
                <p className="font-serif text-4xl text-gold-foil sm:text-5xl">
                  <CountUp to={s.value} suffix={s.suffix} decimals={s.decimals || 0} />
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.15em] text-ivory/60">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-ink py-20">
        <div className="container-x">
          <div className="mx-auto max-w-3xl text-center">
            <SectionHeader
              eyebrow="Our Mission"
              title={<>Devotion in Every <GoldFoilText>Detail</GoldFoilText></>}
            />
            <p className="mt-6 text-base leading-relaxed text-ivory/70">
              To make every pilgrim's Guruvayur visit spiritually fulfilling, physically
              comfortable, and logistically effortless. Whether you're a solo traveller on
              a quick darshan trip or a multi-generational family here for a child's Choroonu
              ceremony, you'll find a warm welcome, honest pricing, and the kind of personal
              care that only a family-run home can offer.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { icon: MapPin, label: "Location", text: "200 m from East Nada gate" },
                { icon: Heart, label: "Service", text: "Pilgrim-first, always" },
                { icon: Award, label: "Quality", text: "22-point room checklist" },
              ].map((x, i) => (
                <div key={i} className="rounded-2xl border border-champagne/12 bg-ink-card p-5">
                  <x.icon className="mx-auto h-6 w-6 text-champagne" />
                  <p className="mt-2 text-xs uppercase tracking-wider text-ivory/50">{x.label}</p>
                  <p className="mt-1 text-sm text-ivory">{x.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
