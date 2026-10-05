"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, X, ChevronRight, Sparkles } from "lucide-react";
import { EVENTS } from "@/lib/site-data";
import { useContent } from "@/lib/use-cms";
import { useHashRoute } from "@/lib/router";
import { getFeatureFlag } from "@/lib/settings";
import { useAnalytics } from "@/lib/use-analytics";

/**
 * Festival Countdown Popup
 *
 * Shows a modal popup when the user is within N days of a major Braj
 * festival (Janmashtami, Holi, Diwali, etc.). The popup drives urgency
 * by showing the actual days-until + a "Book Now" CTA.
 *
 * TRIGGERS:
 *   - Within 60 days of next EVENTS[] entry
 *   - User hasn't seen this festival's popup yet (localStorage per-festival)
 *   - Feature flag FESTIVAL_POPUP is enabled
 *
 * SUPPRESSED ON:
 *   - /admin/* (staff working, not browsing)
 *   - /login (mid-auth)
 *   - /book (mid-booking - don't interrupt)
 *
 * ANALYTICS:
 *   - POPUP_SHOWN { popupType: "festival", festival: name, daysUntil }
 *   - POPUP_DISMISSED { popupType: "festival", festival: name }
 *   - POPUP_CTA_CLICKED { popupType: "festival", festival: name, cta: "book" }
 *
 * CMS-EDITABLE (admin can override at /admin/content):
 *   - festivalPopup.headline (default: auto from festival name)
 *   - festivalPopup.body (default: auto)
 *   - festivalPopup.cta (default: "Book Your Stay")
 *   - festivalPopup.daysThreshold (default: 60 — show if within 60 days)
 */
const POPUP_TYPE = "festival";
const DEFAULT_DAYS_THRESHOLD = 60;
const STORAGE_PREFIX = "gvd_festival_popup_seen_";

export default function FestivalCountdownPopup() {
  const { get } = useContent();
  const { navigate } = useHashRoute();
  const { trackEvent } = useAnalytics();
  const { path } = useHashRoute();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [show, setShow] = useState(false);
  const [festival, setFestival] = useState<(typeof EVENTS)[number] | null>(null);
  const [daysUntil, setDaysUntil] = useState(0);

  // Check feature flag + find next festival within the threshold window.
  // setState calls inside this effect are intentional — we're syncing
  // local state with external systems (feature flag, localStorage,
  // EVENTS calendar). This is the canonical "fetch on mount" pattern.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Don't show on admin/login/book routes
    if (path.startsWith("/admin") || path === "/login" || path === "/book") return;

    getFeatureFlag("FESTIVAL_POPUP").then(setEnabled);

    const now = new Date();
    const thresholdDays = parseInt(get("festivalPopup.daysThreshold", String(DEFAULT_DAYS_THRESHOLD)));
    const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;

    // Find next festival within the threshold window
    const upcoming = EVENTS
      .filter(e => {
        const d = new Date(e.dateISO).getTime();
        return d >= now.getTime() && d - now.getTime() <= thresholdMs;
      })
      .sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime())[0];

    if (!upcoming) {
      setFestival(null);
      return;
    }

    // Check localStorage - has the user already seen this festival's popup?
    const slug = upcoming.name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const storageKey = STORAGE_PREFIX + slug;
    if (localStorage.getItem(storageKey)) {
      setFestival(null);
      return;
    }

    const days = Math.ceil((new Date(upcoming.dateISO).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    setFestival(upcoming);
    setDaysUntil(days);

    // Delay popup 4 seconds so user sees the page first (better UX,
    // avoids Google's "intrusive interstitial" penalty on mobile).
    const timer = setTimeout(() => {
      setShow(true);
      trackEvent("POPUP_SHOWN", {
        popupType: POPUP_TYPE,
        festival: upcoming.name,
        daysUntil: days,
      });
    }, 4000);

    return () => clearTimeout(timer);
  }, [path, get, trackEvent]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Wait for feature flag check to complete
  if (enabled === null) return null;
  if (!enabled || !festival || !show) return null;

  const dismiss = () => {
    setShow(false);
    // Mark this festival's popup as seen (per-festival, never re-show)
    const slug = festival.name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    localStorage.setItem(STORAGE_PREFIX + slug, new Date().toISOString());
    trackEvent("POPUP_DISMISSED", { popupType: POPUP_TYPE, festival: festival.name });
  };

  const handleCta = () => {
    trackEvent("POPUP_CTA_CLICKED", {
      popupType: POPUP_TYPE,
      festival: festival.name,
      cta: "book",
    });
    dismiss();
    navigate("/book");
  };

  // CMS-editable copy (with sensible defaults)
  const headline = get("festivalPopup.headline", `${festival.name} is in ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`);
  const body = get(
    "festivalPopup.body",
    `Braj pilgrims book 60+ days ahead for ${festival.name}. Last year we sold out 47 days before. Secure your room at Guruvayur Dham now — 15+ AC rooms, walking distance to Mata Pathwari Mandir, 3 km from Krishna Janmabhoomi.`,
  );
  const ctaLabel = get("festivalPopup.cta", "Book Your Stay");
  const festivalImage = festival.image;

  // Respect prefers-reduced-motion
  const prefersReducedMotion = typeof window !== "undefined"
    && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
          className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/80 p-4 backdrop-blur-sm sm:items-center"
          onClick={dismiss}
        >
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { y: 60, opacity: 0, scale: 0.95 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { y: 60, opacity: 0, scale: 0.95 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: "easeOut" }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-champagne/20 bg-ink-card shadow-luxe-lg"
          >
            {/* Festival hero image */}
            <div className="relative h-40 overflow-hidden">
              <img
                src={festivalImage}
                alt={festival.name}
                className="h-full w-full object-cover photo-cinematic"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-card via-ink-card/40 to-transparent" />
              {/* Close button */}
              <button
                onClick={dismiss}
                aria-label="Close popup"
                className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-champagne/20 bg-ink/80 text-ivory backdrop-blur-md transition-colors hover:bg-ink/95"
              >
                <X className="h-4 w-4" />
              </button>
              {/* Days-until badge */}
              <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-champagne/30 bg-ink/80 px-3 py-1 backdrop-blur-md">
                <Calendar className="h-3 w-3 text-champagne" />
                <span className="text-xs font-bold text-champagne">
                  {daysUntil} day{daysUntil !== 1 ? "s" : ""} away
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-champagne" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-champagne/80">
                  Festival Booking Alert
                </span>
              </div>
              <h3 className="mt-2 font-serif text-2xl text-ivory">{headline}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ivory/70">{body}</p>

              {/* CTA */}
              <button
                onClick={handleCta}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-champagne px-4 py-3 text-sm font-bold text-ink transition-colors hover:bg-champagne-bright"
              >
                {ctaLabel}
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={dismiss}
                className="mt-2 w-full text-center text-[11px] text-ivory/40 hover:text-ivory/60"
              >
                Maybe later · don't show this festival again
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
