"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, X, ChevronLeft, ChevronRight, MapPin, Camera, Expand, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TourScene {
  id: string;
  title: string;
  panorama: string; // URL to 360° equirectangular image
  preview?: string; // fallback flat image
  hotspots?: Array<{
    pitch: number;
    yaw: number;
    type: "scene" | "info";
    targetScene?: string;
    text: string;
  }>;
}

export default function VirtualTourViewer({
  scenes,
  className = "",
}: {
  scenes: TourScene[];
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeScene, setActiveScene] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [tourLoaded, setTourLoaded] = useState(false);
  const [pannellumLoaded, setPannellumLoaded] = useState(false);

  // Load Pannellum CSS + JS dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).pannellum) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPannellumLoaded(true);
      return;
    }

    // Load CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css";
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js";
    script.async = true;
    script.onload = () => setPannellumLoaded(true);
    document.body.appendChild(script);
  }, []);

  // Initialize viewer when scene changes
  useEffect(() => {
    if (!pannellumLoaded || !containerRef.current) return;
    const pannellum = (window as any).pannellum;
    if (!pannellum) return;

    const scene = scenes[activeScene];
    if (!scene) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTourLoaded(false);

    const viewer = pannellum.viewer(containerRef.current, {
      type: "equirectangular",
      panorama: scene.panorama,
      preview: scene.preview,
      title: scene.title,
      autoLoad: true,
      showControls: true,
      showZoomCtrl: true,
      showFullscreenCtrl: false,
      showPitchCtrl: false,
      showYawCtrl: false,
      showCompass: false,
      hotSpotDebug: false,
      hfov: 100,
      minHfov: 50,
      maxHfov: 120,
      pitch: 0,
      yaw: 0,
      minPitch: -50,
      maxPitch: 50,
      hotSpots: (scene.hotspots || []).map(h => ({
        pitch: h.pitch,
        yaw: h.yaw,
        type: h.type === "scene" ? "scene" : "info",
        sceneId: h.targetScene,
        text: h.text,
        clickHandlerFunc: h.type === "scene" ? () => {
          const idx = scenes.findIndex(s => s.id === h.targetScene);
          if (idx >= 0) setActiveScene(idx);
        } : undefined,
      })),
    });

    viewer.on("load", () => setTourLoaded(true));

    return () => {
      try { viewer.destroy(); } catch {}
    };
  }, [pannellumLoaded, activeScene, scenes]);

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-champagne/15 bg-ink-card", fullscreen && "fixed inset-0 z-[100] rounded-none border-0", className)}>
      {/* Pannellum container */}
      <div
        ref={containerRef}
        className="h-full w-full"
        style={{ minHeight: fullscreen ? "100vh" : "400px" }}
      />

      {/* Loading overlay */}
      <AnimatePresence>
        {!tourLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 grid place-items-center bg-ink/80 backdrop-blur-sm"
          >
            <div className="text-center">
              <Camera className="mx-auto h-10 w-10 animate-pulse text-champagne" />
              <p className="mt-3 text-sm text-ivory/70">Loading 360° view…</p>
              <p className="mt-1 text-xs text-ivory/40">{scenes[activeScene]?.title}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4">
        <div className="pointer-events-auto rounded-full border border-champagne/20 bg-ink/70 px-3 py-1.5 backdrop-blur-md">
          <p className="text-[10px] uppercase tracking-wider text-champagne">360° Virtual Tour</p>
          <p className="font-serif text-sm text-ivory">{scenes[activeScene]?.title}</p>
        </div>
        <div className="pointer-events-auto flex gap-1.5">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="grid h-9 w-9 place-items-center rounded-full border border-champagne/20 bg-ink/70 text-champagne backdrop-blur-md hover:bg-champagne/10"
            aria-label="Info"
          >
            <Info className="h-4 w-4" />
          </button>
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="grid h-9 w-9 place-items-center rounded-full border border-champagne/20 bg-ink/70 text-champagne backdrop-blur-md hover:bg-champagne/10"
            aria-label="Fullscreen"
          >
            {fullscreen ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Scene navigation (thumbnails at bottom) */}
      {scenes.length > 1 && (
        <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 p-4">
          {scenes.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveScene(i)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-md transition-all",
                i === activeScene
                  ? "border-champagne bg-champagne/20 text-champagne"
                  : "border-champagne/15 bg-ink/70 text-ivory/60 hover:bg-champagne/10"
              )}
            >
              <MapPin className="h-3 w-3" />
              {s.title}
            </button>
          ))}
        </div>
      )}

      {/* Info panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 left-4 max-w-xs rounded-xl border border-champagne/20 bg-ink/90 p-4 backdrop-blur-md"
          >
            <p className="font-serif text-sm text-ivory">{scenes[activeScene]?.title}</p>
            <p className="mt-1 text-xs text-ivory/60">
              Drag to look around. Scroll to zoom. Click hotspots to navigate between rooms.
            </p>
            <p className="mt-2 text-[10px] text-ivory/40">
              To add your own 360° photos: upload equirectangular panoramas (2:1 aspect ratio) and update the scenes array.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prev/Next arrows */}
      {scenes.length > 1 && (
        <>
          <button
            onClick={() => setActiveScene((i) => (i - 1 + scenes.length) % scenes.length)}
            className="absolute left-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-champagne/20 bg-ink/70 text-champagne backdrop-blur-md hover:bg-champagne/10"
            aria-label="Previous scene"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveScene((i) => (i + 1) % scenes.length)}
            className="absolute right-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-champagne/20 bg-ink/70 text-champagne backdrop-blur-md hover:bg-champagne/10"
            aria-label="Next scene"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
}
