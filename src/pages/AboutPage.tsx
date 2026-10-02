"use client";

import { motion } from "framer-motion";
import { CheckCircle2, MapPin, Heart, Award, ChevronRight, ArrowUpRight } from "lucide-react";
import { SITE } from "@/lib/site-data";
import { useHashRoute } from "@/lib/router";
import { useContent } from "@/lib/use-cms";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText, ImageReveal, MandalaDivider, MagneticButton, CountUp, OmWatermark, SectionHeader } from "@/components/site/visuals";

const HIGHLIGHTS = [
  "Walking distance to Mata Pathwari Mandir · 3 km drive to Shri Krishna Janmabhoomi",
  "Modern pilgrim hospitality since 2020 · 10,000+ pilgrims served",
  "15+ AC rooms across Deluxe, Privilege Suite, and Family Comfort categories",
  "In-house pooja booking coordinator at zero commission (Mangala Aarti, Abhishek, Rajbhog, Sandhya Aarti)",
  "Free covered parking for 25+ vehicles, 24×7 CCTV security",
  "Tie-ups with pure-veg restaurants for in-room meal delivery",
];

export default function AboutPage() {
  const { navigate } = useHashRoute();
  const { get } = useContent();

  const eyebrow = get("about.eyebrow", "About Guruvayur Dham");
  const title = get("about.title", "A Modern Pilgrim Home Since 2020");
  const story = get("about.story", "Namaste and welcome to Mathura! I am Ram Meena, the proud owner and dedicated host of Hotel Guruvayur Dham. Born and raised with deep roots in the holy Braj region, my goal is to ensure every devotee, family, and traveler experiences warm hospitality, peace of mind, and absolute comfort during their spiritual pilgrimage.\n\nGuruvayur Dham is an inviting haven of comfort and warm hospitality located in the sacred city of Mathura. Situated in Dholi Pyau, within convenient proximity to Mathura Junction Railway Station, the hotel is an ideal destination for pilgrims, families, tourists, and business travelers. Designed with elegant wooden interiors, modern ambient lighting, and well-appointed AC rooms ranging from cozy double setups to spacious family suites, Guruvayur Dham ensures a peaceful and restful stay during your divine Braj Darshan journey.\n\nWhether you need personalized guidance for Mathura-Vrindavan-Gokul temple darshan, quick local travel tips, or simply want to ensure your family's stay is comfortable and secure, my team and I are available round-the-clock to make your trip effortless and memorable. At Hotel Guruvayur Dham, we don't just offer rooms; we welcome you as part of our extended family.\n\nDIRECT CONTACT / WHATSAPP: +91-90908 20208\nLANGUAGES SPOKEN: Hindi, English, Braj Bhasha, Bengali");
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
                src="/about/hotel-building.jpg"
                alt="Guruvayur Dham reception and lobby"
                className="aspect-[3/4] rounded-2xl border border-champagne/15 shadow-luxe"
              />
              <ImageReveal
                src="/about/ram-meena.jpg"
                alt="Ram Meena, owner and host of Guruvayur Dham Mathura"
                className="aspect-square rounded-2xl border border-champagne/15 shadow-luxe"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-6">
              <ImageReveal
                src="/about/room-suite.jpg"
                alt="Privilege Suite with seating area at Guruvayur Dham Mathura"
                className="aspect-square rounded-2xl border border-champagne/15 shadow-luxe"
              />
              <ImageReveal
                src="/about/room-king.jpg"
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
                Guruvayur Dham is an inviting haven of comfort and warm hospitality in Mathura.
                Since 2020, we've welcomed 10,000+ pilgrims with modern AC rooms, premium
                furnishings, and proximity to all major Braj temples. Owner Ram Meena and his
                team provide round-the-clock hospitality - from temple darshan guidance to
                local travel tips - making every pilgrim's Braj journey effortless and
                memorable.
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
              { value: 5, suffix: "+", label: "Years of Service" },
              { value: 15, suffix: "+", label: "AC Rooms & Suites" },
              { value: 10000, suffix: "+", label: "Pilgrims Served" },
              { value: 4.8, suffix: " ★", label: "Google Rating", decimals: 1 },
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
              To make every pilgrim's Mathura visit spiritually fulfilling, physically
              comfortable, and logistically effortless. Whether you're a solo traveller on
              a quick darshan trip or a multi-generational family here for a child's Mundan
              ceremony or Krishna Janmashtami celebration, you'll find a warm welcome,
              honest pricing, and the kind of personal care that makes every pilgrim feel at
              home.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { icon: MapPin, label: "Location", text: "2 min from Mathura Junction" },
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
