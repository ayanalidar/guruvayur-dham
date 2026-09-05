import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/seo-audit — Returns recent SEO audit results
 */
export async function GET(req: NextRequest) {
  const audits = await db.seoAudit.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const avgScore = audits.length > 0
    ? Math.round(audits.reduce((s, a) => s + a.score, 0) / audits.length)
    : 0;
  return NextResponse.json({ audits, avgScore, total: audits.length });
}

type AuditResult = {
  page: string;
  name: string;
  score: number;
  issues: string[];
  titleLen: number;
  descLen: number;
  hasH1: boolean;
  hasSchema: boolean;
  hasCanonical: boolean;
  hasOg: boolean;
  imageCount: number;
  imagesNoAlt: number;
  wordCount: number;
};

/**
 * Run real HTML-based SEO checks on a fetched URL.
 * Returns null if the URL couldn't be fetched.
 */
async function auditHtml(url: string): Promise<AuditResult | null> {
  let score = 0;
  const issues: string[] = [];
  let titleLen = 0;
  let descLen = 0;
  let hasH1 = false;
  let hasSchema = false;
  let hasCanonical = false;
  let hasOg = false;
  let imageCount = 0;
  let imagesNoAlt = 0;
  let wordCount = 0;

  const res = await fetch(url, {
    headers: { "User-Agent": "SEO-Audit-Bot/1.0" },
    signal: AbortSignal.timeout(10000),
    cache: "no-store",
  }).catch(() => null);

  if (!res || !res.ok) return null;

  const html = await res.text();

  // Title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";
  titleLen = title.length;
  if (titleLen >= 30 && titleLen <= 60) score += 15;
  else if (titleLen > 0) {
    score += 8;
    issues.push(`Title length ${titleLen} — ideal: 30–60 chars`);
  } else {
    issues.push("Missing <title> tag");
  }

  // Meta description
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  const desc = descMatch ? descMatch[1] : "";
  descLen = desc.length;
  if (descLen >= 120 && descLen <= 160) score += 15;
  else if (descLen > 0) {
    score += 8;
    issues.push(`Description length ${descLen} — ideal: 120–160 chars`);
  } else {
    issues.push("Missing meta description");
  }

  // H1
  hasH1 = /<h1/i.test(html);
  if (hasH1) score += 15;
  else issues.push("Missing <h1> tag");

  // JSON-LD structured data
  hasSchema = /application\/ld\+json/i.test(html);
  if (hasSchema) score += 15;
  else issues.push("No JSON-LD structured data found");

  // Canonical
  hasCanonical = /rel=["']canonical["']/i.test(html);
  if (hasCanonical) score += 10;
  else issues.push("Missing canonical URL");

  // Open Graph
  hasOg = /property=["']og:/i.test(html);
  if (hasOg) score += 10;
  else issues.push("Missing Open Graph tags (og:title, og:description, og:image)");

  // Images + alt text
  const imgMatches = html.match(/<img\s[^>]*>/gi) || [];
  imageCount = imgMatches.length;
  imagesNoAlt = imgMatches.filter(
    (img) => !/alt\s*=/i.test(img) || /alt\s*=\s*["']\s*["']/i.test(img)
  ).length;
  if (imageCount > 0 && imagesNoAlt === 0) score += 10;
  else if (imagesNoAlt > 0) {
    issues.push(`${imagesNoAlt} of ${imageCount} images missing alt text`);
    score += 5;
  } else if (imageCount === 0) {
    issues.push("No images found in initial HTML (may be lazy-loaded client-side)");
  }

  // Word count (rough)
  const textContent = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  wordCount = textContent.split(" ").filter(Boolean).length;
  if (wordCount >= 300) score += 10;
  else if (wordCount > 0) {
    issues.push(`Low word count (${wordCount}) — aim for 300+ for SEO`);
    score += 5;
  }

  return {
    page: url,
    name: url,
    score,
    issues,
    titleLen,
    descLen,
    hasH1,
    hasSchema,
    hasCanonical,
    hasOg,
    imageCount,
    imagesNoAlt,
    wordCount,
  };
}

/**
 * Quick existence check for sitemap.xml / robots.txt / manifest.json.
 * Returns { ok, size, note }.
 */
async function checkAsset(baseUrl: string, path: string): Promise<{ ok: boolean; size: number; note: string }> {
  const res = await fetch(`${baseUrl}${path}`, {
    signal: AbortSignal.timeout(5000),
    cache: "no-store",
  }).catch(() => null);
  if (!res || !res.ok) {
    return { ok: false, size: 0, note: `${path} not found or unreachable` };
  }
  const text = await res.text();
  return { ok: true, size: text.length, note: `${path} OK (${text.length} bytes)` };
}

/**
 * POST /api/seo-audit — Run a REAL SEO audit
 *
 * This is a hash-routed SPA, so every route shares the same server-rendered HTML
 * at `/`. We do a real audit of:
 *   1. The base URL `/` (full HTML checks: title, meta, H1, schema, canonical, OG, images, words)
 *   2. /sitemap.xml, /robots.txt, /manifest.json existence + size
 *
 * Each SPA hash route gets its own audit row with the base HTML score plus a
 * section-specific recommendation (so the admin sees actionable next steps
 * for each section, not a fake 100/100).
 */
export async function POST(req: NextRequest) {
  const baseUrl = req.nextUrl.origin;

  // 1) Real audit of base HTML — this is what search engines actually see
  const baseAudit = await auditHtml(`${baseUrl}/`);

  // 2) Asset existence checks
  const [sitemap, robots, manifest] = await Promise.all([
    checkAsset(baseUrl, "/sitemap.xml"),
    checkAsset(baseUrl, "/robots.txt"),
    checkAsset(baseUrl, "/manifest.json"),
  ]);

  // 3) Section-specific recommendations for each SPA route
  //    (each gets the base HTML score since they share the same HTML,
  //    plus an actionable recommendation to improve that section's SEO)
  const spaRoutes: Array<{ path: string; name: string; recommendation: string }> = [
    { path: "/", name: "Home", recommendation: "Ensure hero text + JSON-LD LodgingBusiness schema are present" },
    { path: "/#/rooms", name: "Rooms", recommendation: "Add JSON-LD ItemList schema for rooms; ensure each room has a descriptive <h2>" },
    { path: "/#/pooja", name: "Pooja", recommendation: "Add JSON-LD Service schema for each pooja offering" },
    { path: "/#/about", name: "About", recommendation: "Add founder bio + Organization schema; aim for 500+ words" },
    { path: "/#/gallery", name: "Gallery", recommendation: "Ensure every image has descriptive alt text (e.g. 'Deluxe AC Room at Guruvayur Dham')" },
    { path: "/#/events", name: "Events", recommendation: "Add JSON-LD Event schema for each upcoming event with startDate/endDate" },
    { path: "/#/blog", name: "Blog", recommendation: "Add JSON-LD Blog / Article schema; ensure each post has its own meta description" },
    { path: "/#/faq", name: "FAQ", recommendation: "Add JSON-LD FAQPage schema with each Q&A as a mainEntity" },
    { path: "/#/contact", name: "Contact", recommendation: "Add JSON-LD LocalBusiness with geo coordinates + openingHours" },
    { path: "/#/book", name: "Booking", recommendation: "Add noindex meta tag (booking pages shouldn't be indexed)" },
  ];

  const results: AuditResult[] = [];

  // Push the base HTML audit (named "Base HTML / Shared Metadata")
  if (baseAudit) {
    results.push({
      ...baseAudit,
      page: "/",
      name: "Base HTML / Shared Metadata",
    });
  } else {
    results.push({
      page: "/",
      name: "Base HTML / Shared Metadata",
      score: 0,
      issues: ["Could not fetch base URL — server may be down or blocking the audit bot"],
      titleLen: 0, descLen: 0, hasH1: false, hasSchema: false, hasCanonical: false,
      hasOg: false, imageCount: 0, imagesNoAlt: 0, wordCount: 0,
    });
  }

  // Push one row per SPA route, carrying base score + section recommendation
  for (const route of spaRoutes) {
    const baseScore = baseAudit?.score ?? 0;
    const baseIssues = baseAudit?.issues ?? ["Base HTML could not be fetched"];
    // Section-specific: dock 5 points if recommendation not yet implemented
    // (we can't easily detect schema implementation without parsing the rendered DOM,
    //  so we surface the recommendation as an "issue" the admin can act on)
    const issues = [...baseIssues, `Recommendation: ${route.recommendation}`];
    results.push({
      page: route.path,
      name: route.name,
      score: baseScore,
      issues,
      titleLen: baseAudit?.titleLen ?? 0,
      descLen: baseAudit?.descLen ?? 0,
      hasH1: baseAudit?.hasH1 ?? false,
      hasSchema: baseAudit?.hasSchema ?? false,
      hasCanonical: baseAudit?.hasCanonical ?? false,
      hasOg: baseAudit?.hasOg ?? false,
      imageCount: baseAudit?.imageCount ?? 0,
      imagesNoAlt: baseAudit?.imagesNoAlt ?? 0,
      wordCount: baseAudit?.wordCount ?? 0,
    });
  }

  // Push asset checks (each gets its own row with its own score)
  const assetRows: Array<{ path: string; name: string; result: { ok: boolean; size: number; note: string }; weight: number }> = [
    { path: "/sitemap.xml", name: "Sitemap", result: sitemap, weight: 100 },
    { path: "/robots.txt", name: "Robots.txt", result: robots, weight: 100 },
    { path: "/manifest.json", name: "PWA Manifest", result: manifest, weight: 100 },
  ];

  for (const asset of assetRows) {
    const issues: string[] = [];
    if (!asset.result.ok) {
      issues.push(`Missing ${asset.path} — search engines can't discover all pages`);
    } else if (asset.result.size < 100) {
      issues.push(`${asset.path} exists but is suspiciously small (${asset.result.size} bytes)`);
    }
    results.push({
      page: asset.path,
      name: asset.name,
      score: asset.result.ok && asset.result.size >= 100 ? 100 : asset.result.ok ? 70 : 0,
      issues,
      titleLen: 0, descLen: 0, hasH1: false, hasSchema: false, hasCanonical: false,
      hasOg: false, imageCount: 0, imagesNoAlt: 0, wordCount: asset.result.size,
    });
  }

  // Persist every row to the database
  for (const r of results) {
    await db.seoAudit.create({
      data: {
        page: r.page,
        titleLength: r.titleLen,
        descriptionLength: r.descLen,
        hasH1: r.hasH1,
        hasSchema: r.hasSchema,
        hasCanonical: r.hasCanonical,
        hasOgTags: r.hasOg,
        imageCount: r.imageCount,
        imagesWithoutAlt: r.imagesNoAlt,
        wordCount: r.wordCount,
        score: r.score,
        issues: r.issues.length > 0 ? JSON.stringify(r.issues) : null,
      },
    });
  }

  // Ping search engines with the sitemap (best-effort)
  const sitemapUrl = `${baseUrl}/sitemap.xml`;
  await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`).catch(() => {});
  await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`).catch(() => {});

  const avgScore = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
  const totalIssues = results.reduce((s, r) => s + r.issues.length, 0);

  return NextResponse.json({
    audited: results.length,
    avgScore,
    totalIssues,
    results: results.map((r) => ({ page: r.name, path: r.page, score: r.score, issues: r.issues })),
    message: `SEO audit complete. Audited ${results.length} items (base HTML + ${spaRoutes.length} SPA routes + ${assetRows.length} assets). Average score: ${avgScore}/100. Found ${totalIssues} issue${totalIssues === 1 ? "" : "s"}. Google + Bing pinged with sitemap.`,
  });
}
