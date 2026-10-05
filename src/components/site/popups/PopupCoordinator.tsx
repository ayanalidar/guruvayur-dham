"use client";

import { useEffect, useState } from "react";
import { useHashRoute } from "@/lib/router";
import FestivalCountdownPopup from "./FestivalCountdownPopup";
import FirstVisitWelcomePopup from "./FirstVisitWelcomePopup";

/**
 * PopupCoordinator
 *
 * Decides WHICH popup to show on a given page, if any. Wraps the two
 * individual popup components so they don't all fire at once.
 *
 * PRIORITY (highest first):
 *   1. Festival Countdown Popup — drives urgency + booking, only fires
 *      within 60 days of a major festival + only once per festival.
 *   2. First-Visit Welcome Popup — only fires on first-ever browser visit.
 *
 * SUPPRESSED ROUTES (no popup shown on these):
 *   - /admin/*  — staff working
 *   - /login    — mid-auth
 *   - /book     — mid-booking (interrupts conversion)
 *   - /reset-password — sensitive flow
 *
 * SUPPRESSED SESSIONS (no popup shown to these users):
 *   - Logged-in users with a `bookingRef` cookie — they already booked,
 *     don't need welcome offer
 *
 * Each popup manages its own "have I shown?" state via localStorage, so
 * the Coordinator's job is just to render all of them — they each decide
 * internally whether to display.
 *
 * The reason we render both (vs picking one in the Coordinator) is:
 * - localStorage flags differ per popup type (festival popup is per-festival,
 *   welcome popup is per-browser-ever)
 * - feature flags can be toggled independently from /admin/system
 * - analytics events are tracked per-popup, so even if multiple popups
 *   fire on the same page (rare), each gets its own POPUP_SHOWN event
 *   for accurate conversion-rate measurement.
 */
export default function PopupCoordinator() {
  const { path } = useHashRoute();
  // Mounted flag - prevents SSR/CSR hydration mismatch (popups only
  // ever render on the client, after we know the route). The setState
  // in useEffect is intentional here — it's the standard Next.js
  // pattern for "client-only" rendering.
  /* eslint-disable react-hooks/set-state-in-effect */
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!mounted) return null;

  // Hard suppress on sensitive routes (extra safety net — each popup
  // also checks its own route internally, but this guarantees no popup
  // fires during admin/login/book flows even if a popup's internal logic
  // has a bug)
  if (
    path.startsWith("/admin") ||
    path === "/login" ||
    path === "/book" ||
    path === "/reset-password" ||
    path.startsWith("/reset-password")
  ) {
    return null;
  }

  return (
    <>
      <FestivalCountdownPopup />
      <FirstVisitWelcomePopup />
    </>
  );
}
