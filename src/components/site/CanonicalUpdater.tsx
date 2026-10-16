"use client";

import { useEffect } from "react";
import { useHashRoute } from "@/lib/router";

/**
 * CanonicalUpdater — keeps the <link rel="canonical"> tag in sync with
 * the current SPA route.
 *
 * PROBLEM:
 * The site is a single-page app — every URL (/, /rooms, /pooja, /book, etc.)
 * returns the SAME HTML from the server (the SPA shell). Previously the
 * canonical was hardcoded to "/" in layout.tsx, which told Google:
 *   "Every page on this site is a duplicate of the homepage — consolidate
 *    everything into / and don't index /rooms, /pooja, /book, etc. as
 *    separate pages."
 * That's why none of the inner pages were showing up in Google Search.
 *
 * SOLUTION:
 * 1. Removed the static `alternates: { canonical: "/" }` from layout.tsx
 *    so the initial HTML has no canonical tag (Google's default: use the
 *    page's own URL as canonical — correct behavior).
 * 2. This component runs client-side and updates the <link rel="canonical">
 *    href whenever the route changes — so when Google's JS renderer
 *    processes the page, it sees the correct self-referencing canonical:
 *      - On /      → canonical = https://www.guruvayurdham.co.in/
 *      - On /book  → canonical = https://www.guruvayurdham.co.in/book
 *      - On /rooms → canonical = https://www.guruvayurdham.co.in/rooms
 *    This reinforces to Google that each URL is its own canonical page
 *    and should be indexed independently.
 */
const SITE_URL = "https://www.guruvayurdham.co.in";

export default function CanonicalUpdater() {
  const { path } = useHashRoute();

  useEffect(() => {
    if (typeof document === "undefined") return;

    // Find existing canonical tag or create a new one
    let link = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement | null;

    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }

    // Build the canonical URL — strip trailing slash except for root
    const cleanPath = path === "/" ? "/" : path.replace(/\/$/, "");
    link.setAttribute("href", `${SITE_URL}${cleanPath}`);
  }, [path]);

  return null;
}
