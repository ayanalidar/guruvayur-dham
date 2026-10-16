import { Metadata } from "next";
import { ALL_SEO_PAGES } from "@/lib/seo-pages";
import { getSEOMetadataForSlug, SITE_URL } from "@/lib/seo-metadata";

/**
 * Catch-all route for SEO landing pages.
 *
 * These are the 50+ landing pages defined in src/lib/seo-pages.ts with
 * unique slugs like "janmashtami", "hotels-near-krishna-janmabhoomi",
 * "mathura-to-vrindavan-distance", etc.
 *
 * Each gets a unique <title> and <meta description> from the SEO_PAGES
 * config + a self-referencing canonical URL.
 *
 * Static routes (/book, /rooms, /pooja, etc.) take precedence over this
 * catch-all — Next.js checks static routes first, then falls through to
 * this dynamic route.
 *
 * Unknown slugs (not in ALL_SEO_PAGES) fall through to the SPA shell
 * (via the catch-all rewrite in next.config.ts) which renders a 404.
 */

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const seoPage = ALL_SEO_PAGES.find((p) => p.slug === slug);
  if (seoPage) {
    return getSEOMetadataForSlug(seoPage.slug, seoPage.title, seoPage.metaDescription);
  }
  // Unknown slug — return generic metadata (the SPA shell will render 404)
  return {
    title: "Page Not Found — Guruvayur Dham Mathura",
    description: "The page you're looking for doesn't exist. Browse our rooms, poojas, and pilgrim guides.",
    alternates: { canonical: `${SITE_URL}/${slug}` },
  };
}

// Re-export the SPA shell — it handles client-side routing based on
// window.location.pathname, rendering the correct page (SEOPage component
// for known slugs, NotFound for unknown slugs).
export { default } from "@/app/page";
