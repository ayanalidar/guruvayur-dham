import { NextResponse } from "next/server";

export const dynamic = "force-static";

const SITE_URL = "https://www.guruvayurdham.com";

/**
 * GET /robots.txt
 *
 * Allows all major bots, points them to the sitemap, and disallows
 * admin/booking/kitchen routes that shouldn't be indexed.
 */
export async function GET() {
  const body = `# Guruvayur Dham robots.txt
# Allow all crawlers to access public content
User-agent: Googlebot
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /*/admin
Disallow: /book
Disallow: /kitchen
Disallow: /login
Disallow: /dashboard
Disallow: /cms
Disallow: /settings

User-agent: Bingbot
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /book
Disallow: /kitchen
Disallow: /login

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /book
Disallow: /kitchen
Disallow: /login
Disallow: /dashboard
Disallow: /cms
Disallow: /settings

# Sitemap location
Sitemap: ${SITE_URL}/sitemap.xml
`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
