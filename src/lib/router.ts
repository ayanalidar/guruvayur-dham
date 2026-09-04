"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * Lightweight hash-based router.
 * URL format: /#/rooms, /#/rooms/deluxe-ac-room, /#/blog/my-post
 * Returns the path without the leading hash, e.g. "/rooms", "/rooms/deluxe-ac-room".
 */
export function useHashRoute(): {
  path: string;
  navigate: (to: string) => void;
} {
  const [path, setPath] = useState<string>("/");

  useEffect(() => {
    const read = () => {
      const h = window.location.hash.replace(/^#/, "");
      setPath(h || "/");
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  const navigate = useCallback((to: string) => {
    const clean = to.startsWith("/") ? to : `/${to}`;
    if (window.location.hash.replace(/^#/, "") === clean) {
      // same route — just scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.location.hash = clean;
    // scroll to top immediately on navigation
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  return { path, navigate };
}

/** Link component that uses hash navigation. */
export function hrefFor(route: string): string {
  const clean = route.startsWith("/") ? route : `/${route}`;
  return `#${clean}`;
}

/** Match helper: returns true if `path` starts with `prefix`. */
export function isRouteActive(path: string, prefix: string): boolean {
  const p = prefix === "/" ? "/" : prefix.replace(/\/$/, "");
  if (p === "/") return path === "/" || path === "";
  return path === p || path.startsWith(p + "/");
}
