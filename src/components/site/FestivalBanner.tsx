"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Calendar, X, ChevronRight } from "lucide-react";
import { EVENTS } from "@/lib/site-data";
import { useContent } from "@/lib/use-cms";
import { useHashRoute } from "@/lib/router";
import { getFeatureFlag } from "@/lib/settings";

/**
 * Festival Countdown Banner
 * Shows "X days until [festival]" at the top of the page.
 * 
 * CMS-editable:
 * - festivalBanner.enabled (feature flag, toggle from admin)
 * - festivalBanner.text (custom text, defaults to auto-calculated)
 * - festivalBanner.link (link URL, defaults to /#/events)
 */
export default function FestivalBanner() {
  const { get } = useContent();
  const { navigate } = useHashRoute();
  const [dismissed, setDismissed] = useState(false);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    // Check if the festival banner feature flag is enabled
    getFeatureFlag("FESTIVAL_BANNER").then(setEnabled);
    // Check if user dismissed it this session — deferred to avoid setState-in-effect
    queueMicrotask(() => {
      if (sessionStorage.getItem("festival-banner-dismissed")) setDismissed(false);
    });
  }, []);

  // Find the next upcoming festival
  const now = new Date();
  const nextFestival = EVENTS
    .filter(e => new Date(e.dateISO) >= now)
    .sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime())[0];

  if (!enabled || dismissed || !nextFestival) return null;

  const daysUntil = Math.ceil((new Date(nextFestival.dateISO).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const customText = get("festivalBanner.text", "");
  const link = get("festivalBanner.link", "/events");
  const text = customText || `Janmashtami is in ${daysUntil} days`;

  // Use the actual festival name if auto-calculating
  const displayText = customText || `${nextFestival.name} in ${daysUntil} day${daysUntil !== 1 ? 's' : ''} — book now to secure your room`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative z-50 overflow-hidden bg-gradient-to-r from-maroon-dark via-maroon to-maroon-dark"
      >
        <div className="container-x flex items-center justify-between gap-3 py-2">
          <button
            onClick={() => navigate(link)}
            className="flex items-center gap-2 text-sm text-cream hover:text-ivory transition-colors"
          >
            <Calendar className="h-4 w-4 flex-shrink-0 text-gold" />
            <span className="font-medium">{displayText}</span>
            <ChevronRight className="h-3 w-3 flex-shrink-0" />
          </button>
          <button
            onClick={() => {
              setDismissed(true);
              queueMicrotask(() => sessionStorage.setItem("festival-banner-dismissed", "true"));
            }}
            className="flex-shrink-0 text-cream/60 hover:text-cream"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
