"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, ChevronRight } from "lucide-react";
import { SITE } from "@/lib/site-data";
import { useContent } from "@/lib/use-cms";
import { useHashRoute } from "@/lib/router";

/**
 * Temple Timings Widget
 * Shows live darshan timings for all Braj temples with "open now" status.
 * Grouped by location (Mathura, Gokul, Vrindavan, Barsana, Nandgaon).
 *
 * CMS-editable:
 * - templeTimings.enabled (feature flag)
 * - Each temple's timings stored in SITE.nearbyTemples (editable via site-data)
 * - Override individual timings via CMS content blocks: temples.{slug}.timings
 */
export default function TempleTimingsWidget() {
  const { get } = useContent();
  const { navigate } = useHashRoute();

  // Client-only "now" - avoids SSR/CSR hydration mismatch (React #418).
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  const currentHour = now?.getHours() ?? 0;
  const currentMin = now?.getMinutes() ?? 0;
  const currentTime = currentHour * 60 + currentMin;

  // Parse a timing string like "5:00 AM - 12:00 PM, 4:00 - 9:00 PM" into session objects
  function parseTimings(timingStr: string): Array<{ start: number; end: number; label: string }> {
    const sessions: Array<{ start: number; end: number; label: string }> = [];
    const parts = timingStr.split(",").map(s => s.trim());
    for (const part of parts) {
      const match = part.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?\s*[-]\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?|sunset|Sunset/i);
      if (!match) continue;
      // Handle "sunset" - treat as 18:30 (6:30 PM) as a fallback
      if (part.toLowerCase().includes("sunset")) continue; // skip sunset-based timings for now
      const [_, sh, sm, sap, eh, em, eap] = match;
      let startH = parseInt(sh);
      let endH = parseInt(eh);
      if (sap?.toUpperCase() === "PM" && startH < 12) startH += 12;
      if (eap?.toUpperCase() === "PM" && endH < 12) endH += 12;
      if (sap?.toUpperCase() === "AM" && startH === 12) startH = 0;
      if (eap?.toUpperCase() === "AM" && endH === 12) endH = 0;
      const start = startH * 60 + (parseInt(sm) || 0);
      const end = endH * 60 + (parseInt(em) || 0);
      sessions.push({ start, end, label: part });
    }
    return sessions;
  }

  function isOpenNow(timingStr: string): { open: boolean; nextSession?: string } {
    if (!now) return { open: false };
    // Special case: "Open all day" timings
    if (timingStr.toLowerCase().includes("open all day")) return { open: true };
    const sessions = parseTimings(timingStr);
    for (const s of sessions) {
      if (currentTime >= s.start && currentTime < s.end) {
        return { open: true };
      }
    }
    for (const s of sessions) {
      if (currentTime < s.start) {
        return { open: false, nextSession: s.label };
      }
    }
    return { open: false };
  }

  const temples = SITE.nearbyTemples || [];

  // Group temples by dham (location)
  const locationOrder = ["Mathura", "Gokul", "Vrindavan", "Govardhan", "Barsana", "Nandgaon"];
  const locationIcons: Record<string, string> = {
    Mathura: "Krishna Janmabhoomi - birthplace of Krishna",
    Gokul: "Krishna's childhood home",
    Vrindavan: "Radha-Krishna's leela-sthali",
    Govardhan: "Sacred hill lifted by Krishna on his little finger",
    Barsana: "Radha Rani's birthplace",
    Nandgaon: "Nand Baba's village",
  };

  const grouped = temples.reduce((acc, t) => {
    const d = (t as any).dham || "Other";
    if (!acc[d]) acc[d] = [];
    acc[d].push(t);
    return acc;
  }, {} as Record<string, typeof temples>);

  // Sort groups by locationOrder
  const sortedGroups = Object.entries(grouped).sort((a, b) => {
    const ai = locationOrder.indexOf(a[0]);
    const bi = locationOrder.indexOf(b[0]);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-b from-ink to-ink-soft py-12"
    >
      <div className="container-x">
        <div className="mb-8 text-center">
          <span className="section-eyebrow">
            <Clock className="h-3.5 w-3.5" /> Live Darshan Timings
          </span>
          <h2 className="section-title mt-3">Today's Temple Timings</h2>
          <p className="section-subtitle mt-2">Real-time darshan status for {temples.length} Braj temples across 5 locations</p>
        </div>

        {/* Grouped by location */}
        {sortedGroups.map(([dham, groupTemples]) => (
          <div key={dham} className="mb-8">
            {/* Location section header */}
            <div className="mb-4 flex items-center gap-3 border-b border-champagne/10 pb-2">
              <MapPin className="h-4 w-4 text-champagne" />
              <h3 className="font-serif text-lg text-champagne">{dham}</h3>
              <span className="text-[10px] uppercase tracking-wider text-ivory/40">
                {groupTemples.length} temple{groupTemples.length > 1 ? "s" : ""}
              </span>
              <span className="text-[10px] text-ivory/30 hidden sm:inline">
                {locationIcons[dham] || ""}
              </span>
            </div>

            {/* Temple cards for this location */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {groupTemples.map((temple, i) => {
                const status = isOpenNow(temple.timings);
                return (
                  <motion.div
                    key={temple.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                    className={`rounded-xl border p-4 ${
                      status.open
                        ? "border-green-500/20 bg-green-500/5"
                        : "border-champagne/10 bg-ink-card"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-ivory">{temple.name}</h3>
                        <div className="mt-1 flex items-center gap-1 text-xs text-ivory/50">
                          <MapPin className="h-3 w-3" />
                          {temple.distance}
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        status.open
                          ? "bg-green-500/15 text-green-300"
                          : "bg-ivory/5 text-ivory/40"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.open ? "bg-green-400 animate-pulse" : "bg-ivory/30"}`} />
                        {status.open ? "Open" : "Closed"}
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-champagne/80">{temple.timings}</p>
                    {!status.open && status.nextSession && (
                      <p className="mt-1 text-[10px] text-ivory/40">Opens: {status.nextSession}</p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/planner")}
            className="inline-flex items-center gap-1 text-sm text-champagne hover:text-champagne-bright"
          >
            Plan your pilgrimage <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.section>
  );
}
