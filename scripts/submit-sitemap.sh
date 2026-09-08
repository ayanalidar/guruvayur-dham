#!/usr/bin/env bash
# ============================================================================
# Submit sitemap to Google + Bing
# Usage: ./scripts/submit-sitemap.sh https://yourdomain.com
# ============================================================================

SITE_URL="${1:-https://www.guruvayurdham.com}"
SITEMAP_URL="${SITE_URL}/sitemap.xml"

echo "📢 Submitting sitemap to search engines..."
echo "   Sitemap URL: $SITEMAP_URL"
echo ""

# Submit to Google
echo "1. Google Search Console..."
GOOGLE_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null "https://www.google.com/ping?sitemap=${SITEMAP_URL}")
if [ "$GOOGLE_RESPONSE" = "200" ]; then
  echo "   ✅ Google accepted sitemap ping (HTTP 200)"
else
  echo "   ⚠️  Google returned HTTP $GOOGLE_RESPONSE (may still be processing)"
fi

# Submit to Bing
echo "2. Bing Webmaster Tools..."
BING_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null "https://www.bing.com/ping?sitemap=${SITEMAP_URL}")
if [ "$BING_RESPONSE" = "200" ]; then
  echo "   ✅ Bing accepted sitemap ping (HTTP 200)"
else
  echo "   ⚠️  Bing returned HTTP $BING_RESPONSE (may still be processing)"
fi

echo ""
echo "📋 Next steps for full SEO indexing:"
echo "   1. Add your site to Google Search Console:"
echo "      https://search.google.com/search-console/add-resource"
echo "   2. Verify ownership (DNS TXT record or HTML file)"
echo "   3. Submit sitemap manually in Search Console"
echo "   4. Add to Bing Webmaster Tools:"
echo "      https://www.bing.com/webmasters/addsite"
echo "   5. Request indexing for key pages:"
echo "      - $SITE_URL/#/janmashtami"
echo "      - $SITE_URL/#/hotels-near-banke-bihari-vrindavan"
echo "      - $SITE_URL/#/krishna-janmabhoomi-darshan-timings"
echo ""
echo "✅ Done! Sitemap submitted to Google + Bing."
