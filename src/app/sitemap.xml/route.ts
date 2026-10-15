import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ALL_SEO_PAGES } from "@/lib/seo-pages";

// CRITICAL: sitemap must be dynamic — it should reflect the latest blog
// posts, rooms, and SEO landing pages on every request. Without this flag,
// Next.js 15 App Router may freeze the sitemap at build time, hiding newly
// added pages from Google for days/weeks until the next deploy.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const SITE_URL = "https://www.guruvayurdham.co.in";

type SitemapEntry = {
  path: string;
  priority: string;
  changefreq: string;
  lastmod?: string;
};

/**
 * GET /sitemap.xml
 *
 * Dynamic sitemap. Lists every indexable URL on the site:
 *   - Static SPA routes (home, rooms, pooja, about, gallery, events, blog,
 *     faq, contact, privacy, terms, tour, planner)
 *   - Room detail pages (/rooms/<slug>) — fetched from DB so newly added
 *     rooms appear automatically
 *   - SEO landing pages (festivals, hotels-near, darshan-timings, etc.)
 *   - Blog post URLs (/blog/<slug>) — fetched from DB
 *
 * Excluded (noindex intent): /book, /login, /dashboard, /cms, /settings,
 * /admin/*, /kitchen/*, /review, /influencer, /reset-password — these are
 * transactional / admin / private pages that shouldn't show up in search
 * results. (robots.txt also disallows them.)
 */
export async function GET() {
  const today = new Date().toISOString().slice(0, 10);
  const entries: SitemapEntry[] = [];

  // ── Static SPA routes ───────────────────────────────────────────────
  const staticRoutes: Array<[string, string, string]> = [
    // [path, priority, changefreq]
    ["/", "1.0", "daily"],
    ["/rooms", "0.9", "weekly"],
    ["/pooja", "0.9", "weekly"],
    ["/about", "0.7", "monthly"],
    ["/gallery", "0.6", "monthly"],
    ["/events", "0.8", "weekly"],
    ["/blog", "0.8", "daily"],
    ["/faq", "0.6", "monthly"],
    ["/contact", "0.7", "monthly"],
    ["/tour", "0.6", "monthly"],
    ["/planner", "0.7", "monthly"],
    ["/privacy", "0.3", "yearly"],
    ["/terms", "0.3", "yearly"],
    ["/policies", "0.3", "monthly"],
  ];
  for (const [path, priority, changefreq] of staticRoutes) {
    entries.push({ path, priority, changefreq, lastmod: today });
  }

  // ── Room detail pages (/rooms/<slug>) ───────────────────────────────
  // Only include active rooms. lastmod = updatedAt so Google knows when
  // the room's pricing / description / images changed.
  try {
    const rooms = await db.room.findMany({
      where: { active: true },
      orderBy: { updatedAt: "desc" },
      select: { slug: true, updatedAt: true },
    });
    for (const r of rooms) {
      entries.push({
        path: `/rooms/${r.slug}`,
        priority: "0.85",
        changefreq: "weekly",
        lastmod: r.updatedAt.toISOString().slice(0, 10),
      });
    }
  } catch {
    // DB unavailable — skip room detail URLs (sitemap still ships the
    // /rooms listing page and the other static routes)
  }

  // ── SEO landing pages ────────────────────────────────────────────────
  // 50+ pages across 6 categories (festivals, hotels-near, darshan-timings,
  // how-to-reach, pooja-guides, travel-guides).
  for (const p of ALL_SEO_PAGES) {
    entries.push({
      path: `/${p.slug}`,
      priority: p.category === "festivals" ? "0.9" : p.category === "hotels-near" ? "0.85" : "0.8",
      changefreq: p.category === "festivals" ? "monthly" : "weekly",
      lastmod: today,
    });
  }

  // ── Blog posts (/blog/<slug>) ───────────────────────────────────────
  try {
    const posts = await db.blogPost.findMany({
      where: { published: true },
      orderBy: { date: "desc" },
      select: { slug: true, updatedAt: true },
    });
    for (const p of posts) {
      entries.push({
        path: `/blog/${p.slug}`,
        priority: "0.7",
        changefreq: "monthly",
        lastmod: p.updatedAt.toISOString().slice(0, 10),
      });
    }
  } catch {
    // DB unavailable — skip blog post URLs
  }

  // ── Render XML ──────────────────────────────────────────────────────
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${SITE_URL}${e.path}</loc>
    <lastmod>${e.lastmod || today}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // Cache at the CDN for 5 minutes — short enough that newly added
      // rooms / blog posts appear in Google's next crawl, long enough to
      // absorb a traffic spike without hammering the DB.
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
