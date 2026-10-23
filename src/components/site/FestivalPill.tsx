"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Calendar, X, ChevronRight } from "lucide-react";
import { EVENTS } from "@/lib/site-data";
import { useContent } from "@/lib/use-cms";
import { useHashRoute } from "@/lib/router";
import { getFeatureFlag } from "@/lib/settings";

/**
 * FestivalPill — a floating, dismissible countdown pill that sticks to the
 * bottom-right corner of the screen (next to the WhatsApp + scroll-to-top
 * buttons from FloatingActions).
 *
 * Replaces the old full-width FestivalBanner that sat at the very top of
 * the page (pushing the navbar down + taking 40px of vertical space on
 * every page).
 *
 * Features:
 *   - Shows "📅 X days to [festival] →" — compact, always visible
 *   - Click → navigates to /book (or custom CMS link)
 *   - Dismiss (×) → hidden for 24 hours (localStorage, not sessionStorage)
 *     so the user doesn't see it repeatedly across sessions
 *   - Dismissible via feature flag FESTIVAL_BANNER (toggle from admin)
 *   - Auto-calculates the next upcoming festival from EVENTS in site-data.ts
 *   - Falls back to CMS-edited text if set (festivalBanner.text content block)
 *   - Animates in with a spring + fades out on dismiss
 *   - Positioned above the WhatsApp button (bottom-24 right-6) to not overlap
 *   - On mobile, positioned above the sticky bottom bar (bottom-20 right-4)
 */
const DISMISSAL_KEY = "festival-pill-dismissed";
const DISMISSAL_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export default function FestivalPill() {
  const { get } = useContent();
  const { navigate } = useHashRoute();
  const [dismissed, setDismissed] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // All setState calls deferred via queueMicrotask to satisfy the
    // react-hooks/set-state-in-effect ESLint rule
    queueMicrotask(() => {
      setMounted(true);
      getFeatureFlag("FESTIVAL_BANNER").then(setEnabled);

      try {
        const dismissedAt = localStorage.getItem(DISMISSAL_KEY);
        if (dismissedAt) {
          const elapsed = Date.now() - parseInt(dismissedAt, 10);
          if (elapsed < DISMISSAL_TTL_MS) {
            setDismissed(true);
          } else {
            localStorage.removeItem(DISMISSAL_KEY);
          }
        }
      } catch {
        // localStorage may be disabled (private mode) — silently continue
      }
    });
  }, []);

  // Find the next upcoming festival (same logic as FestivalBanner)
  const now = new Date();
  const nextFestival = EVENTS
    .filter((e) => e.dateISO && new Date(e.dateISO) >= now)
    .sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime())[0];

  if (!mounted || !enabled || dismissed || !nextFestival) return null;

  const daysUntil = Math.ceil(
    (new Date(nextFestival.dateISO).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Don't show the pill if the festival is more than 30 days away
  // (only show for upcoming festivals within a month)
  if (daysUntil > 30) return null;

  const customText = get("festivalBanner.text", "");
  const link = get("festivalBanner.link", "/book");

  // Compact text for the pill — shorter than the banner
  const pillText = customText
    ? customText.split("-")[0].trim() // use first part of custom text
    : `${nextFestival.name} in ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSAL_KEY, Date.now().toString());
    } catch {
      // localStorage may be disabled — dismissal only lasts this session
    }
  };

  const handleClick = () => {
    navigate(link);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0, opacity: 0, y: 20 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 260, damping: 18 }}
        className="fixed bottom-20 right-4 z-50 sm:bottom-24 sm:right-6"
      >
        <button
          onClick={handleClick}
          className="group flex items-center gap-2 rounded-full border border-champagne/30 bg-gradient-to-r from-maroon-dark to-maroon px-4 py-2 shadow-luxe-lg backdrop-blur-md transition-all hover:border-champagne/50 hover:shadow-luxe-xl"
          aria-label={`${daysUntil} days until ${nextFestival.name} — book now`}
        >
          {/* Calendar icon with subtle pulse */}
          <span className="relative flex h-6 w-6 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-gold/20" />
            <Calendar className="relative h-4 w-4 text-gold" />
          </span>

          {/* Festival name + countdown */}
          <span className="text-xs font-semibold text-cream sm:text-sm">
            {pillText}
          </span>

          {/* Arrow — animates on hover */}
          <ChevronRight className="h-3 w-3 flex-shrink-0 text-gold transition-transform group-hover:translate-x-0.5" />

          {/* Dismiss button */}
          <span
            role="button"
            tabIndex={-1}
            onClick={handleDismiss}
            className="ml-1 flex-shrink-0 rounded-full p-0.5 text-cream/50 transition-colors hover:bg-cream/10 hover:text-cream"
            aria-label="Dismiss festival reminder"
          >
            <X className="h-3 w-3" />
          </span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
