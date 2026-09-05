"use client";

import { useEffect } from "react";

/**
 * Injects a JSON-LD `<script type="application/ld+json">` tag into <head>.
 *
 * Use this on pages that need page-specific structured data:
 *   - FAQ pages → FAQPage schema
 *   - Event pages → Event schema (one per event)
 *   - Blog post pages → Article schema
 *
 * The script tag is automatically cleaned up when the component unmounts,
 * so navigating between pages doesn't leave stale schemas in <head>.
 *
 * Pass any valid schema.org object.
 */
export function JsonLd({ data, id }: { data: object; id: string }) {
  useEffect(() => {
    const scriptId = `jsonld-${id}`;
    // Remove any existing tag with the same id (for hot-reloads / route changes)
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = scriptId;
    script.text = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [data, id]);

  return null;
}
