"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ZoomIn, X } from "lucide-react";
import { GALLERY_IMAGES, GALLERY_TABS, type GalleryTab } from "@/lib/site-data";
import { useContent } from "@/lib/use-cms";
import { cn } from "@/lib/utils";

// Shape returned by /api/gallery
type GalleryImageRow = {
  id: string;
  tab: string;
  src: string;
  alt: string;
  caption: string;
  span: string | null;
  sortOrder: number;
};

export default function Gallery() {
  const { get } = useContent();
  const [tab, setTab] = useState<GalleryTab>("Rooms");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [cmsImages, setCmsImages] = useState<GalleryImageRow[] | null>(null);

  // Fetch gallery images from CMS once
  useEffect(() => {
    let active = true;
    fetch("/api/gallery", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (active && Array.isArray(j.images) && j.images.length > 0) {
          setCmsImages(j.images);
        } else if (active) {
          setCmsImages(null); // fall back to hardcoded
        }
      })
      .catch(() => active && setCmsImages(null));
    return () => {
      active = false;
    };
  }, []);

  // Use CMS images if available; else fall back to hardcoded
  const images = cmsImages
    ? cmsImages.map((g) => ({
        tab: g.tab as GalleryTab,
        src: g.src,
        alt: g.alt,
        caption: g.caption,
        span: (g.span || undefined) as "tall" | "wide" | undefined,
      }))
    : GALLERY_IMAGES;

  // Derive tabs from the actual images present (so CMS-added tabs show up)
  const tabs = Array.from(new Set(images.map((g) => g.tab)));
  const activeTabs = tabs.length > 0 ? tabs : GALLERY_TABS;
  const safeTab = activeTabs.includes(tab) ? tab : activeTabs[0];
  const filtered = images.filter((g) => g.tab === safeTab);

  const eyebrow = get("gallery.eyebrow", "Photo Gallery");
  const title = get("gallery.title", "Step Inside Guruvayur Dham");
  const subtitle = get(
    "gallery.subtitle",
    "Browse our rooms, the temple, our facilities, and the surrounding Guruvayur town · every photo tells the story of a pilgrim's day."
  );

  // Split title for gradient on second half
  const titleParts = title.split(" ");
  const titleHighlight = titleParts.length > 2 ? titleParts.slice(-2).join(" ") : "";
  const titlePre = titleHighlight ? titleParts.slice(0, -2).join(" ").trim() : title;

  return (
    <section
      id="gallery"
      className="relative scroll-mt-20 overflow-hidden bg-muted/30 py-20 lg:py-28"
    >
      <div className="container-x">
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

        {/* Tabs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {activeTabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-semibold transition-all",
                safeTab === t
                  ? "bg-saffron text-white shadow-warm"
                  : "bg-card text-foreground/70 hover:bg-saffron/10 hover:text-saffron-dark"
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
                className={cn(
                  "group relative block w-full overflow-hidden rounded-2xl shadow-warm",
                  img.span === "tall" && "row-span-2",
                  img.span === "wide" && "col-span-2"
                )}
              >
                <div
                  className={cn(
                    "relative w-full",
                    img.span === "tall" ? "aspect-[3/4]" : "aspect-[4/3]"
                  )}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="text-xs font-medium text-white">{img.caption}</p>
                    <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-white/20 backdrop-blur-sm">
                      <ZoomIn className="h-4 w-4 text-white" />
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && filtered[lightbox] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[60] grid place-items-center bg-black/90 p-4 backdrop-blur-sm"
          >
            <button
              onClick={() => setLightbox(null)}
              aria-label="Close lightbox"
              className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
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
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
                <Image
                  src={filtered[lightbox].src}
                  alt={filtered[lightbox].alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-cover"
                  priority
                />
              </div>
              <p className="mt-3 text-center text-sm text-white/90">
                {filtered[lightbox].caption}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
