"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Maximize2, X, ZoomIn, ZoomOut, MessageCircle, Camera, Expand,
} from "lucide-react";
import { useHashRoute } from "@/lib/router";
import { cn } from "@/lib/utils";

/* ───────────────────────────────────────────────────────────────────────
 *  VirtualRoomTour — 360°-style room photo viewer.
 * ───────────────────────────────────────────────────────────────────────
 *
 *  No external library. Pan with mouse drag, zoom with scroll wheel or
 *  +/- buttons. Thumbnail strip at the bottom switches between gallery
 *  images. Room name + description overlay shown on top.
 *
 *  Uses the existing room gallery photos (already editable via CMS —
 *  the room.gallery field). Add to any room detail page.
 */

interface VirtualRoomTourProps {
  roomName: string;
  roomDescription: string;
  gallery: string[]; // list of image URLs (room.gallery)
  roomSlug?: string;
  /** Optional badge text shown top-left (e.g. "Best Value"). */
  badge?: string;
}

export default function VirtualRoomTour({
  roomName, roomDescription, gallery, roomSlug, badge,
}: VirtualRoomTourProps) {
  const { navigate } = useHashRoute();
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [fullscreen, setFullscreen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Reset zoom + pan when image changes. Wrapped in queueMicrotask so
  // the React Compiler (react-hooks/set-state-in-effect rule) doesn't
  // complain about synchronous setState cascading renders.
  useEffect(() => {
    queueMicrotask(() => {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    });
  }, [activeIdx]);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    (e.currentTarget as HTMLElement).style.cursor = "grabbing";
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({ x: dragStart.current.panX + dx, y: dragStart.current.panY + dy });
  };
  const onMouseUp = (e: React.MouseEvent) => {
    isDragging.current = false;
    (e.currentTarget as HTMLElement).style.cursor = "grab";
  };
  const onWheel = useCallback((e: WheelEvent) => {
    // Only intercept wheel when inside the viewer (so the page can still scroll)
    if (!containerRef.current?.contains(e.target as Node)) return;
    e.preventDefault();
    setZoom(z => {
      const next = z - (e.deltaY > 0 ? 0.1 : -0.1);
      return Math.max(1, Math.min(3, Math.round(next * 10) / 10));
    });
  }, []);

  // Attach wheel listener with passive:false so preventDefault works
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  // Keyboard: ESC closes fullscreen, +/- zoom, arrows switch images
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
      if (e.key === "ArrowRight") setActiveIdx(i => (i + 1) % Math.max(gallery.length, 1));
      if (e.key === "ArrowLeft") setActiveIdx(i => (i - 1 + gallery.length) % Math.max(gallery.length, 1));
      if (e.key === "+" || e.key === "=") setZoom(z => Math.min(3, Math.round((z + 0.1) * 10) / 10));
      if (e.key === "-") setZoom(z => Math.max(1, Math.round((z - 0.1) * 10) / 10));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen, gallery.length]);

  if (!gallery || gallery.length === 0) return null;

  const currentImg = gallery[activeIdx];

  return (
    <>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-champagne/15 bg-ink-card",
          fullscreen && "fixed inset-0 z-[100] rounded-none border-0",
        )}
        style={fullscreen ? { minHeight: "100vh" } : { minHeight: "420px" }}
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {/* The image, transformed with translate + scale */}
        <div
          className="absolute inset-0 grid place-items-center"
          style={{ cursor: "grab" }}
        >
          <motion.img
            key={activeIdx}
            src={currentImg}
            alt={`${roomName} · 360° view ${activeIdx + 1}`}
            className="max-h-full max-w-full object-contain select-none"
            draggable={false}
            animate={{
              scale: zoom,
              x: pan.x,
              y: pan.y,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
            initial={{ opacity: 0 }}
            exit={{ opacity: 0 }}
          />
        </div>

        {/* Top overlay: room name + description */}
        <AnimatePresence>
          {showOverlay && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-ink/90 via-ink/50 to-transparent p-4 sm:p-6"
            >
              <div className="flex items-start gap-2">
                {badge && (
                  <span className="rounded-full border border-champagne/30 bg-ink/70 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-champagne backdrop-blur-md">
                    {badge}
                  </span>
                )}
                <span className="rounded-full border border-champagne/25 bg-ink/70 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-champagne backdrop-blur-md">
                  360° Virtual Tour
                </span>
              </div>
              <h3 className="mt-2 font-serif text-2xl text-ivory">{roomName}</h3>
              <p className="mt-1 max-w-2xl text-xs text-ivory/70 sm:text-sm">{roomDescription}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top-right controls */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-end gap-1.5 p-4 sm:p-6">
          <div className="pointer-events-auto flex gap-1.5">
            <button
              onClick={() => setZoom(z => Math.max(1, Math.round((z - 0.2) * 10) / 10))}
              aria-label="Zoom out"
              className="grid h-9 w-9 place-items-center rounded-full border border-champagne/20 bg-ink/70 text-champagne backdrop-blur-md hover:bg-champagne/10"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoom(z => Math.min(3, Math.round((z + 0.2) * 10) / 10))}
              aria-label="Zoom in"
              className="grid h-9 w-9 place-items-center rounded-full border border-champagne/20 bg-ink/70 text-champagne backdrop-blur-md hover:bg-champagne/10"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowOverlay(s => !s)}
              aria-label="Toggle info"
              className="grid h-9 w-9 place-items-center rounded-full border border-champagne/20 bg-ink/70 text-champagne backdrop-blur-md hover:bg-champagne/10"
            >
              <Camera className="h-4 w-4" />
            </button>
            <button
              onClick={() => setFullscreen(f => !f)}
              aria-label="Fullscreen"
              className="grid h-9 w-9 place-items-center rounded-full border border-champagne/20 bg-ink/70 text-champagne backdrop-blur-md hover:bg-champagne/10"
            >
              {fullscreen ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Zoom indicator (bottom-left) */}
        <div className="pointer-events-none absolute bottom-20 left-4 sm:bottom-24">
          <span className="rounded-full border border-champagne/15 bg-ink/70 px-2.5 py-0.5 text-[10px] font-semibold text-ivory/70 backdrop-blur-md">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* "Book this room" floating CTA (bottom-right) */}
        <div className="absolute bottom-20 right-4 sm:bottom-24">
          <button
            onClick={() => navigate("/book")}
            className="inline-flex items-center gap-1.5 rounded-full border border-champagne/30 bg-champagne/15 px-4 py-2 text-xs font-semibold text-champagne backdrop-blur-md transition-colors hover:bg-champagne/25"
          >
            <MessageCircle className="h-3.5 w-3.5" /> Book this room
          </button>
        </div>

        {/* Thumbnail strip at the bottom */}
        {gallery.length > 1 && (
          <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-gradient-to-t from-ink/90 to-transparent p-3">
            {gallery.map((g, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={cn(
                  "relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:h-14 sm:w-20",
                  i === activeIdx
                    ? "border-champagne opacity-100"
                    : "border-transparent opacity-50 hover:opacity-90"
                )}
                aria-label={`View photo ${i + 1}`}
              >
                <img
                  src={g}
                  alt={`${roomName} thumbnail ${i + 1}`}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Helper text */}
      <p className="mt-2 flex items-center gap-1.5 text-center text-[10px] text-ivory/40">
        <Expand className="h-3 w-3" />
        Drag to pan · Scroll to zoom · Click thumbnails to switch · Click fullscreen icon for immersive view.
      </p>
    </>
  );
}
