"use client";

/**
 * CMS data hooks.
 *
 * These hooks fetch editable content from /api/content (key/value blocks)
 * and /api/cms (structured lists like events, testimonials, FAQs).
 *
 * Every hook accepts a hardcoded fallback (from src/lib/site-data.ts) so the
 * site still renders correctly if:
 *   - The DB is unreachable
 *   - The CMS hasn't been seeded yet
 *   - The user is viewing the static export
 *
 * Edits made in /admin/content or /admin/cms propagate to the live site
 * on the next page load (we use cache: "no-store").
 */

import { useEffect, useState } from "react";
import type { ContentMap } from "./api-client";

/* ---------- in-memory cache so multiple components share one fetch ---------- */

let contentCache: ContentMap | null = null;
let contentPromise: Promise<ContentMap> | null = null;
const cmsListCache: Partial<Record<string, any[]>> = {};
const cmsListPromises: Partial<Record<string, Promise<any[]>>> = {};

async function fetchContentMap(): Promise<ContentMap> {
  if (contentCache) return contentCache;
  if (contentPromise) return contentPromise;
  contentPromise = (async () => {
    try {
      const r = await fetch("/api/content", { cache: "no-store" });
      if (!r.ok) return {};
      const j = await r.json();
      const map = j.map || {};
      contentCache = map;
      return map;
    } catch {
      return {};
    } finally {
      contentPromise = null;
    }
  })();
  return contentPromise;
}

async function fetchCMSList<T>(type: string): Promise<T[]> {
  if (cmsListCache[type]) return cmsListCache[type] as T[];
  if (cmsListPromises[type]) return cmsListPromises[type] as Promise<T[]>;
  cmsListPromises[type] = (async () => {
    try {
      const r = await fetch(`/api/cms?type=${type}`, { cache: "no-store" });
      if (!r.ok) return [];
      const j = await r.json();
      const data = j.data || [];
      cmsListCache[type] = data;
      return data;
    } catch {
      return [];
    } finally {
      delete cmsListPromises[type];
    }
  })();
  return cmsListPromises[type] as Promise<T[]>;
}

/** Invalidate caches — call after admin saves content so the next read is fresh. */
export function invalidateCMSCache() {
  contentCache = null;
  for (const k of Object.keys(cmsListCache)) delete cmsListCache[k];
}

/* ---------- Hooks ---------- */

/**
 * useContent() — load all key/value content blocks.
 * Returns `{ map, get, loading }`. `get(key, fallback)` returns the block
 * value or the fallback if missing.
 */
export function useContent() {
  const [map, setMap] = useState<ContentMap>(contentCache || {});
  const [loading, setLoading] = useState(!contentCache);

  useEffect(() => {
    let active = true;
    fetchContentMap().then((m) => {
      if (!active) return;
      setMap(m);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const get = (key: string, fallback: string): string => {
    const v = map[key];
    return v && v.length > 0 ? v : fallback;
  };

  return { map, get, loading };
}

/**
 * useCMSList<T>(type, fallback) — load a structured CMS list (events,
 * testimonials, faqs, features, trustBadges, poojas, carousel, blogPosts).
 * Falls back to the provided array if the CMS has no data or is unreachable.
 */
export function useCMSList<T = any>(type: string, fallback: T[]): T[] {
  const [list, setList] = useState<T[]>(cmsListCache[type] as T[] || fallback);
  const [loaded, setLoaded] = useState(!!cmsListCache[type]);

  useEffect(() => {
    let active = true;
    if (loaded) return;
    fetchCMSList<T>(type).then((data) => {
      if (!active) return;
      // Only use CMS data if it's non-empty; otherwise keep fallback
      if (data && data.length > 0) {
        setList(data);
      }
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [type, loaded]);

  return list;
}

/* ---------- Convenience typed hooks for each CMS type ---------- */

export type Feature = { id: string; icon: string; title: string; text: string; sortOrder: number };
export type EventItem = {
  id: string;
  name: string;
  date: string;
  dateISO: string | null;
  description: string;
  highlight: string;
  image: string;
  sortOrder: number;
};
export type TestimonialItem = {
  id: string;
  name: string;
  city: string;
  rating: number;
  text: string;
  room: string | null;
  sortOrder: number;
};
export type FAQEntry = { id: string; question: string; answer: string; sortOrder: number };
export type TrustBadgeItem = { id: string; icon: string; text: string; sortOrder: number };
export type BlogPostItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
  content: string; // JSON array of paragraphs (stringified)
  published: boolean;
};

/* ---------- Mappers that convert CMS rows to the shape site-data.ts exports ---------- */

export function mapEvent(e: EventItem) {
  return {
    name: e.name,
    date: e.date,
    dateISO: e.dateISO ? new Date(e.dateISO).toISOString() : null,
    description: e.description,
    highlight: e.highlight,
    image: e.image,
  };
}

export function mapTestimonial(t: TestimonialItem) {
  return {
    name: t.name,
    city: t.city,
    rating: t.rating,
    text: t.text,
    room: t.room || undefined,
  };
}

export function mapFAQ(f: FAQEntry) {
  return { q: f.question, a: f.answer };
}

export function mapFeature(f: Feature) {
  return { icon: f.icon, title: f.title, text: f.text };
}

export function mapTrustBadge(t: TrustBadgeItem) {
  return { icon: t.icon, text: t.text };
}

/**
 * Blog posts come back from /api/cms as BlogPostItem (with `content` as a
 * JSON string). The frontend expects { content: string[] } (an array of
 * paragraphs). This mapper parses the JSON safely.
 */
export function mapBlogPost(p: BlogPostItem) {
  let paragraphs: string[] = [];
  try {
    if (typeof p.content === "string") {
      const parsed = JSON.parse(p.content);
      if (Array.isArray(parsed)) paragraphs = parsed.filter((x) => typeof x === "string");
    }
  } catch {
    paragraphs = [];
  }
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    readTime: p.readTime,
    date: p.date,
    image: p.image,
    content: paragraphs,
  };
}
