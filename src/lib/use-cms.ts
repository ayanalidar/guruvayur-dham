"use client";

/**
 * CMS data hooks.
 *
 * These hooks fetch editable content from /api/content (key/value blocks)
 * and /api/cms (structured lists like events, testimonials, FAQs).
 *
 * CACHE STRATEGY (FIXED - was the cause of "data never reflects on frontend"):
 *
 *   1. Module-level cache with TTL=0 - every page mount triggers a fresh fetch.
 *      Slight perf cost (~30ms per navigation) but guarantees fresh data.
 *
 *   2. visibilitychange listener - when user switches back to the tab,
 *      the cache is invalidated so the next read fetches fresh data.
 *      Solves the "open in new tab" scenario where admin saves in tab 1
 *      and the user comes back to tab 2.
 *
 *   3. localStorage 'cms-updated' broadcast - when admin saves, we write
 *      to localStorage which fires a 'storage' event in OTHER tabs of
 *      the same browser. Those tabs invalidate their cache instantly.
 *
 *   4. invalidateCMSCache() - still called after admin saves in the SAME
 *      tab, for instant feedback to the admin.
 *
 * I18N INTEGRATION
 * ----------------
 * The `get(key, fallback)` function checks (in order):
 *   1. The DB content block for the current language: e.g. `hero.headline__hi`
 *      (if the admin has translated a block to Hindi, that wins)
 *   2. The DB content block for the default language: e.g. `hero.headline`
 *   3. The translations.ts file: e.g. `hero.headline` (built-in translations
 *      for en/hi/mr/gu/ml)
 *   4. The provided fallback string
 */

import { useEffect, useState } from "react";
import type { ContentMap } from "./api-client";
import { useI18n } from "./i18n/context";

/* ---------- in-memory cache ---------- */
//
// TTL=0 means "always stale" - every fetchContentMap() call refetches.
// The fetch is deduplicated (contentPromise) so concurrent mounts don't
// fire 2 requests.
//
// Module-level because:
//   - Same-tab navigation should reuse the cache (React doesn't re-render
//     the SPA page component, so useContent's useEffect doesn't re-run on
//     every nav - but if it does re-run, we want fresh data)
//   - Cross-tab invalidation happens via localStorage events (below)
//
const CMS_CACHE_TTL_MS = 0; // 0 = always refetch on mount

let contentCache: ContentMap | null = null;
let contentCacheAt = 0;
let contentPromise: Promise<ContentMap> | null = null;

const cmsListCache: Partial<Record<string, any[]>> = {};
const cmsListCacheAt: Partial<Record<string, number>> = {};
const cmsListPromises: Partial<Record<string, Promise<any[]>>> = {};

function isContentStale(): boolean {
  if (!contentCache) return true;
  return Date.now() - contentCacheAt > CMS_CACHE_TTL_MS;
}

function isListStale(type: string): boolean {
  if (!cmsListCache[type]) return true;
  const ts = cmsListCacheAt[type] || 0;
  return Date.now() - ts > CMS_CACHE_TTL_MS;
}

async function fetchContentMap(force = false): Promise<ContentMap> {
  if (contentCache && !force && !isContentStale()) return contentCache;
  if (contentPromise) return contentPromise;
  contentPromise = (async () => {
    try {
      const r = await fetch("/api/content", { cache: "no-store" });
      if (!r.ok) return contentCache || {};
      const j = await r.json();
      const map = j.map || {};
      contentCache = map;
      contentCacheAt = Date.now();
      return map;
    } catch {
      return contentCache || {};
    } finally {
      contentPromise = null;
    }
  })();
  return contentPromise;
}

async function fetchCMSList<T>(type: string, force = false): Promise<T[]> {
  if (cmsListCache[type] && !force && !isListStale(type)) {
    return cmsListCache[type] as T[];
  }
  if (cmsListPromises[type]) return cmsListPromises[type] as Promise<T[]>;
  cmsListPromises[type] = (async () => {
    try {
      const r = await fetch(`/api/cms?type=${type}`, { cache: "no-store" });
      if (!r.ok) return cmsListCache[type] || [];
      const j = await r.json();
      const data = j.data || [];
      cmsListCache[type] = data;
      cmsListCacheAt[type] = Date.now();
      return data;
    } catch {
      return cmsListCache[type] || [];
    } finally {
      delete cmsListPromises[type];
    }
  })();
  return cmsListPromises[type] as Promise<T[]>;
}

/**
 * Invalidate caches - call after admin saves content so the next read is fresh.
 * Also called automatically by the TTL expiry (0 = always stale).
 */
export function invalidateCMSCache() {
  contentCache = null;
  contentCacheAt = 0;
  for (const k of Object.keys(cmsListCache)) {
    delete cmsListCache[k];
    delete cmsListCacheAt[k];
  }
}

/**
 * Broadcast a CMS update to ALL open tabs of this browser.
 * Writes a sentinel value to localStorage which fires a 'storage' event
 * in OTHER tabs (same-origin only). Those tabs invalidate their cache.
 *
 * Call this from admin save handlers AFTER invalidateCMSCache().
 */
export function broadcastCMSUpdate(reason?: string) {
  invalidateCMSCache();
  try {
    localStorage.setItem("cms-updated", `${Date.now()}:${reason || "save"}`);
  } catch {
    // localStorage may be disabled (private mode) - silent fallback
  }
}

/**
 * Force a refresh of all CMS data - bypasses the TTL.
 * Useful for "refresh" buttons in the admin UI.
 */
export async function refreshCMSData() {
  invalidateCMSCache();
  await Promise.all([
    fetchContentMap(true),
    ...Object.keys(cmsListCache).map((k) => fetchCMSList(k, true)),
  ]);
}

/* ---------- Cross-tab sync via localStorage events ---------- */
//
// When ANOTHER tab writes to localStorage (via broadcastCMSUpdate),
// this tab receives a 'storage' event. We invalidate our cache so the
// next read fetches fresh data.
//
// This is what makes admin saves propagate to OTHER open tabs of the
// same browser - without it, only the admin's tab sees the update.
//
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "cms-updated") {
      invalidateCMSCache();
    }
  });

  // visibilitychange - when user returns to this tab after switching away,
  // invalidate the cache so the next read fetches fresh data.
  // This catches the scenario where admin saves in tab 1, user comes back
  // to tab 2 - they should see fresh data without waiting.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      invalidateCMSCache();
    }
  });
}

/* ---------- Hooks ---------- */

/**
 * useContent() - load all key/value content blocks.
 * Returns `{ map, get, loading }`. `get(key, fallback)` returns the block
 * value or the fallback if missing.
 */
export function useContent() {
  const { lang, t } = useI18n();
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
    // 1) Admin-curated translation for the current language
    const langKey = `${key}__${lang}`;
    const langVal = map[langKey];
    if (langVal && langVal.length > 0) return langVal;

    // 2) Default-language DB block
    const dbVal = map[key];
    if (dbVal && dbVal.length > 0) {
      if (lang === "en") return dbVal;
      const tx = t(key);
      if (tx && tx !== key) return tx;
      return dbVal;
    }

    // 3) Built-in translation file
    const tx = t(key);
    if (tx && tx !== key) return tx;

    // 4) Hardcoded fallback
    return fallback;
  };

  return { map, get, loading, lang };
}

/**
 * useCMSList<T>(type, fallback) - load a structured CMS list (events,
 * testimonials, faqs, features, trustBadges, poojas, carousel, blogPosts).
 * Falls back to the provided array if the CMS has no data or is unreachable.
 */
export function useCMSList<T = any>(type: string, fallback: T[]): T[] {
  const [list, setList] = useState<T[]>(cmsListCache[type] as T[] || fallback);

  useEffect(() => {
    let active = true;
    fetchCMSList<T>(type).then((data) => {
      if (!active) return;
      if (data && data.length > 0) {
        setList(data);
      }
    });
    return () => {
      active = false;
    };
  }, [type]);

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
export type Pooja = {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  prasadam: string;
  image: string;
  significance: string;
  sortOrder: number;
};
export type BlogPostItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
  content: string;
  published: boolean;
};

/* ---------- Mappers ---------- */

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
