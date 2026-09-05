import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SEO_PAGES } from "@/lib/seo-pages";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.guruvayurdham.com";

/**
 * GET /sitemap.xml
 *
 * Dynamic sitemap. Lists:
 *   - Base SPA hash routes (home, rooms, pooja, etc.)
 *   - All SEO landing pages (festivals, hotels-near, darshan-timings)
 *   - Dynamic blog post URLs
 */
export async function GET() {
  const today = new Date().toISOString().slice(0, 10);

  // Static hash routes — every page the SPA serves
  const staticRoutes: Array<{ path: string; priority: string; changefreq: string; lastmod?: string }> = [
    { path: "/", priority: "1.0", changefreq: "daily" },
    { path: "/#/rooms", priority: "0.9", changefreq: "weekly" },
    { path: "/#/pooja", priority: "0.9", changefreq: "weekly" },
    { path: "/#/about", priority: "0.7", changefreq: "monthly" },
    { path: "/#/gallery", priority: "0.6", changefreq: "monthly" },
    { path: "/#/events", priority: "0.8", changefreq: "weekly" },
    { path: "/#/blog", priority: "0.8", changefreq: "daily" },
    { path: "/#/faq", priority: "0.6", changefreq: "monthly" },
    { path: "/#/contact", priority: "0.7", changefreq: "monthly" },
  ];

  // SEO landing pages — festivals, hotels-near, darshan-timings
  const seoRoutes: Array<{ path: string; priority: string; changefreq: string; lastmod?: string }> = SEO_PAGES.map((p) => ({
    path: `/#/${p.slug}`,
    priority: p.category === "festivals" ? "0.9" : p.category === "hotels-near" ? "0.85" : "0.8",
    changefreq: p.category === "festivals" ? "monthly" : "weekly",
  }));

  // Dynamic blog post routes
  let blogRoutes: Array<{ path: string; priority: string; changefreq: string; lastmod?: string }> = [];
  try {
    const posts = await db.blogPost.findMany({
      where: { published: true },
      orderBy: { date: "desc" },
      select: { slug: true, updatedAt: true },
    });
    blogRoutes = posts.map((p) => ({
      path: `/#/blog/${p.slug}`,
      priority: "0.7",
      changefreq: "monthly",
      lastmod: p.updatedAt.toISOString().slice(0, 10),
    }));
  } catch {
    // DB unavailable — skip blog posts
  }

  const allRoutes = [...staticRoutes, ...seoRoutes, ...blogRoutes];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (r) => `  <url>
    <loc>${SITE_URL}${r.path}</loc>
    <lastmod>${r.lastmod || today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
