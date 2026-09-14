"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, X, Images } from "lucide-react";
import { GALLERY_IMAGES, GALLERY_TABS, type GalleryTab } from "@/lib/site-data";
import { useContent } from "@/lib/use-cms";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText, MandalaDivider, SectionHeader } from "@/components/site/visuals";

type GalleryImageRow = {
  id: string; tab: string; src: string; alt: string;
  caption: string; span: string | null; sortOrder: number;
};

export default function GalleryPage() {
  const { get } = useContent();
  const [tab, setTab] = useState<GalleryTab>("Rooms");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [cmsImages, setCmsImages] = useState<GalleryImageRow[] | null>(null);

  // Fetch gallery images from CMS
  useEffect(() => {
    let active = true;
    fetch("/api/gallery", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (active && Array.isArray(j.images) && j.images.length > 0) {
          setCmsImages(j.images);
        } else if (active) {
          setCmsImages(null);
        }
      })
      .catch(() => active && setCmsImages(null));
    return () => { active = false; };
  }, []);

  // Use CMS images if available; fall back to hardcoded
  const images = cmsImages
    ? cmsImages.map((g) => ({
        tab: g.tab as GalleryTab, src: g.src, alt: g.alt,
        caption: g.caption,
        span: (g.span || undefined) as "tall" | "wide" | undefined,
      }))
    : GALLERY_IMAGES;

  // Derive tabs from actual images
  const tabs = Array.from(new Set(images.map((g) => g.tab)));
  const activeTabs = tabs.length > 0 ? tabs : GALLERY_TABS;
  const safeTab = activeTabs.includes(tab) ? tab : activeTabs[0];
  const filtered = images.filter((g) => g.tab === safeTab);

  const eyebrow = get("gallery.eyebrow", "Photo Gallery");
  const title = get("gallery.title", "Step Inside Guruvayur Dham");
  const subtitle = get("gallery.subtitle", "Browse our rooms, the temple, our facilities, and the surrounding Guruvayur town · every photo tells the story of a pilgrim's day.");

  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow={eyebrow}
        icon={Images}
        title={<>Step Inside <GoldFoilText>Guruvayur Dham</GoldFoilText></>}
        subtitle={subtitle}
        crumbs={[{ label: "Home", route: "/" }, { label: "Gallery" }]}
      />

      <section className="bg-ink py-16 lg:py-20">
        <div className="container-x">
          {/* Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {activeTabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-full px-6 py-2.5 text-sm font-semibold transition-all",
                  safeTab === t
                    ? "border border-champagne/30 bg-champagne/15 text-champagne shadow-luxe"
                    : "border border-champagne/10 text-ivory/60 hover:border-champagne/25 hover:text-ivory"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Masonry grid */}
          <div className="mt-10 columns-2 gap-4 lg:columns-3 [&>*]:mb-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((img, i) => (
                <motion.button
                  key={`${safeTab}-${i}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  onClick={() => setLightbox(i)}
                  className="group relative block w-full overflow-hidden rounded-2xl border border-champagne/12 shadow-luxe"
                >
                  <div className={cn("relative w-full", img.span === "tall" ? "aspect-[3/4]" : "aspect-[4/3]")}>
                    <img
                      src={img.src}
                      alt={img.alt}
                      loading="lazy"
                      className="h-full w-full object-cover photo-cinematic transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="text-xs font-medium text-ivory">{img.caption}</p>
                      <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full border border-champagne/30 bg-ink/70 backdrop-blur-md">
                        <ZoomIn className="h-4 w-4 text-champagne" />
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          <MandalaDivider />

          {/* CTA */}
          <div className="rounded-3xl border border-champagne/15 bg-ink-card p-8 text-center sm:p-10">
            <SectionHeader
              eyebrow="Plan Your Visit"
              title={<>See It in <GoldFoilText>Person</GoldFoilText></>}
              subtitle="Photos capture only part of the experience. Book your stay and feel the warmth, devotion, and comfort of Guruvayur Dham for yourself."
            />
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && filtered[lightbox] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[60] grid place-items-center bg-ink/95 p-4 backdrop-blur-md"
          >
            <button
              onClick={() => setLightbox(null)}
              aria-label="Close lightbox"
              className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-champagne/25 text-champagne hover:bg-champagne/10"
            >
              <X className="h-6 w-6" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-champagne/20 shadow-luxe-lg">
                <img
                  src={filtered[lightbox].src}
                  alt={filtered[lightbox].alt}
                  className="h-full w-full object-cover photo-cinematic"
                />
              </div>
              <p className="mt-3 text-center text-sm text-ivory/80">{filtered[lightbox].caption}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
