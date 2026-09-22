"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, ChevronRight } from "lucide-react";
import { SITE } from "@/lib/site-data";
import { useContent } from "@/lib/use-cms";
import { useHashRoute } from "@/lib/router";

/**
 * Temple Timings Widget
 * Shows live darshan timings for all 7 Mathura temples with "open now" status.
 *
 * CMS-editable:
 * - templeTimings.enabled (feature flag)
 * - Each temple's timings stored in SITE.nearbyTemples (editable via site-data)
 * - Override individual timings via CMS content blocks: temples.{slug}.timings
 */
export default function TempleTimingsWidget() {
  const { get } = useContent();
  const { navigate } = useHashRoute();

  // Client-only "now" — avoids SSR/CSR hydration mismatch (React #418).
  // Server has no concept of "current time" matching client; render closed state
  // initially, then re-render with real time after mount.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // Tick every 60 seconds so the open/closed status stays fresh.
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  const currentHour = now?.getHours() ?? 0;
  const currentMin = now?.getMinutes() ?? 0;
  const currentTime = currentHour * 60 + currentMin; // minutes since midnight

  // Parse a timing string like "5 AM - 12 PM, 4 - 9:30 PM" into session objects
  function parseTimings(timingStr: string): Array<{ start: number; end: number; label: string }> {
    const sessions: Array<{ start: number; end: number; label: string }> = [];
    const parts = timingStr.split(",").map(s => s.trim());
    for (const part of parts) {
      const match = part.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?\s*[-–]\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
      if (!match) continue;
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
    // Before client mounts (now === null), return closed state — avoids hydration mismatch.
    if (!now) return { open: false };
    const sessions = parseTimings(timingStr);
    for (const s of sessions) {
      if (currentTime >= s.start && currentTime < s.end) {
        return { open: true };
      }
    }
    // Find next session today
    for (const s of sessions) {
      if (currentTime < s.start) {
        return { open: false, nextSession: s.label };
      }
    }
    return { open: false };
  }

  const temples = SITE.nearbyTemples || [];

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
          <p className="section-subtitle mt-2">Real-time darshan status for Mathura temples</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {temples.map((temple, i) => {
            const status = isOpenNow(temple.timings);
            return (
              <motion.div
                key={temple.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
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
                {temple.description && (
                  <p className="mt-1.5 text-[11px] text-ivory/40">{temple.description}</p>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/tour")}
            className="inline-flex items-center gap-1 text-sm text-champagne hover:text-champagne-bright"
          >
            View full pilgrimage guide <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.section>
  );
}
