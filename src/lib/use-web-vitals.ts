"use client";

import { useEffect } from "react";

/**
 * useWebVitals · tracks Core Web Vitals and reports to /api/metrics
 *
 * Tracks:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - TTFB (Time to First Byte)
 * - FCP (First Contentful Paint)
 *
 * Uses the Web Vitals API (built into modern browsers).
 * Reports once per page load.
 */
export function useWebVitals() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Only track in production or if explicitly enabled
    const shouldTrack = process.env.NODE_ENV === "production" || true; // always track for demo

    if (!shouldTrack) return;

    const reportMetric = (metric: { name: string; value: number }) => {
      const page = window.location.hash.replace("#", "/") || "/";
      const data: any = { page };

      switch (metric.name) {
        case "LCP":
          data.lcp = Math.round(metric.value);
          break;
        case "FID":
          data.fid = Math.round(metric.value);
          break;
        case "CLS":
          data.cls = Math.round(metric.value * 1000) / 1000;
          break;
        case "TTFB":
          data.ttfb = Math.round(metric.value);
          break;
        case "FCP":
          data.fcp = Math.round(metric.value);
          break;
        default:
          return;
      }

      // Add connection info if available
      const conn = (navigator as any).connection;
      if (conn) data.connection = conn.effectiveType;

      // Fire and forget
      fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).catch(() => {});
    };

    // ===== TTFB (Time to First Byte) =====
    if (performance.timing) {
      const ttfb = performance.timing.responseStart - performance.timing.navigationStart;
      if (ttfb > 0) {
        reportMetric({ name: "TTFB", value: ttfb });
      }
    }

    // ===== FCP (First Contentful Paint) =====
    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          reportMetric({ name: "FCP", value: entry.startTime });
        }
      }
    });
    try { fcpObserver.observe({ type: "paint", buffered: true }); } catch {}

    // ===== LCP (Largest Contentful Paint) =====
    let lastLCP = 0;
    const lcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        lastLCP = entry.startTime;
      }
    });
    try { lcpObserver.observe({ type: "largest-contentful-paint", buffered: true }); } catch {}

    // Report LCP when page is fully loaded
    window.addEventListener("load", () => {
      setTimeout(() => {
        if (lastLCP > 0) reportMetric({ name: "LCP", value: lastLCP });
      }, 1000);
    });

    // ===== FID (First Input Delay) =====
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceEventTiming[]) {
        const fid = entry.processingStart - entry.startTime;
        reportMetric({ name: "FID", value: fid });
      }
    });
    try { fidObserver.observe({ type: "first-input", buffered: true }); } catch {}

    // ===== CLS (Cumulative Layout Shift) =====
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
    });
    try { clsObserver.observe({ type: "layout-shift", buffered: true }); } catch {}

    // Report CLS on page hide
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden" && clsValue > 0) {
        reportMetric({ name: "CLS", value: clsValue });
      }
    });

    return () => {
      try { fcpObserver.disconnect(); } catch {}
      try { lcpObserver.disconnect(); } catch {}
      try { fidObserver.disconnect(); } catch {}
      try { clsObserver.disconnect(); } catch {}
    };
  }, []);
}
