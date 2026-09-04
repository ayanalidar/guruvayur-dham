"use client";

import { useEffect, useRef } from "react";
import { useHashRoute } from "@/lib/router";

/**
 * useAnalytics — tracks page views and custom events.
 * Automatically tracks page views on route change.
 * Call trackEvent() for custom events (booking started, etc.)
 */
export function useAnalytics() {
  const { path } = useHashRoute();
  const sessionId = useRef<string>("");
  const lastPath = useRef<string>("");

  // Generate or retrieve session ID
  useEffect(() => {
    const stored = sessionStorage.getItem("analytics_session_id");
    if (stored) {
      sessionId.current = stored;
    } else {
      const id = Math.random().toString(36).slice(2, 18);
      sessionStorage.setItem("analytics_session_id", id);
      sessionId.current = id;
    }
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (!path || path === lastPath.current) return;
    lastPath.current = path;

    // Fire and forget — don't block navigation
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "PAGE_VIEW",
        page: path,
        properties: { sessionId: sessionId.current },
      }),
    }).catch(() => {});
  }, [path]);

  return {
    trackEvent: (eventType: string, properties?: any) => {
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          page: lastPath.current,
          properties: { sessionId: sessionId.current, ...properties },
        }),
      }).catch(() => {});
    },
  };
}
