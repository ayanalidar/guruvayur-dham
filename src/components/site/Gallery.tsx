"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ZoomIn, X } from "lucide-react";
import { GALLERY_IMAGES, GALLERY_TABS, type GalleryTab } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export default function Gallery() {
  const [tab, setTab] = useState<GalleryTab>("Rooms");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = GALLERY_IMAGES.filter((g) => g.tab === tab);

  return (
    <section
      id="gallery"
      className="relative scroll-mt-20 overflow-hidden bg-muted/30 py-20 lg:py-28"
    >
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">Photo Gallery</span>
          <h2 className="section-title mt-4">
            Step Inside <span className="text-gradient-saffron">Guruvayur Dham</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Browse our rooms, the temple, our facilities, and the surrounding
            Guruvayur town — every photo tells the story of a pilgrim's day.
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {GALLERY_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-semibold transition-all",
                tab === t
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
                key={`${tab}-${i}`}
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
