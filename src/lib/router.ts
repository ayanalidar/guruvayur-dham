"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * Lightweight History-API router.
 *
 * URL format: /rooms, /rooms/deluxe-ac-room, /blog/my-post
 *
 * Why History API instead of hash routing:
 *   - Clean URLs (no /#/ prefix) — better SEO, shareable on WhatsApp, etc.
 *   - Works with Vercel's catch-all rewrite (see vercel.json)
 *   - Browser back/forward works natively via popstate
 *
 * Migration note (2026-09-22):
 *   Previously this hook used hash routing (/#/path). On hard-load of any URL
 *   the server returns the SPA shell (vercel.json rewrite), and this hook
 *   reads window.location.pathname to know which page to render.
 *   Legacy /#/path links from Google's index will be auto-redirected on mount
 *   (see the redirect-from-hash logic below).
 */
export function useHashRoute(): {
  path: string;
  navigate: (to: string) => void;
} {
  const [path, setPath] = useState<string>("/");

  useEffect(() => {
    // One-time migration: if the URL has a hash like #/rooms, redirect to /rooms
    // so users with old Google-indexed links land on the clean URL.
    if (window.location.hash && /^#\//.test(window.location.hash)) {
      const clean = window.location.hash.replace(/^#/, "");
      window.history.replaceState(null, "", clean);
      // Don't scroll — we're just fixing the URL.
    }

    const read = () => {
      setPath(window.location.pathname || "/");
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);

  const navigate = useCallback((to: string) => {
    const clean = to.startsWith("/") ? to : `/${to}`;
    if (window.location.pathname === clean) {
      // same route · just scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.history.pushState(null, "", clean);
    setPath(clean);
    // scroll to top immediately on navigation
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    // Notify any popstate listeners (in case of same-component re-renders)
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);

  return { path, navigate };
}

/**
 * Link component helper: returns the href for a route (no longer needs # prefix).
 * @example hrefFor("/rooms") → "/rooms"
 */
export function hrefFor(route: string): string {
  const clean = route.startsWith("/") ? route : `/${route}`;
  return clean;
}

/**
 * Match helper: returns true if `path` starts with `prefix`.
 */
export function isRouteActive(path: string, prefix: string): boolean {
  const p = prefix === "/" ? "/" : prefix.replace(/\/$/, "");
  if (p === "/") return path === "/" || path === "";
  return path === p || path.startsWith(p + "/");
}
