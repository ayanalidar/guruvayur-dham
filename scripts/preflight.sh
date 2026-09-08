#!/usr/bin/env bash
# ============================================================================
# Guruvayur Dham — Pre-Flight Checklist
# ============================================================================
# Run this BEFORE every git push to catch issues early.
# Usage: ./scripts/preflight.sh
# 
# Exit codes:
#   0 = all checks passed
#   1 = one or more checks failed (do NOT push)
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

check() {
  echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"
}

pass() { echo -e "  ${GREEN}✅ PASS${NC} $1"; PASS=$((PASS+1)); }
fail() { echo -e "  ${RED}❌ FAIL${NC} $1"; FAIL=$((FAIL+1)); }
warn() { echo -e "  ${YELLOW}⚠️  WARN${NC} $1"; WARN=$((WARN+1)); }

echo ""
echo "🚀 Guruvayur Dham — Pre-Flight Checklist"
echo "========================================"
echo ""

# ─── 1. Critical Files Exist ──────────────────────────────────────────────
check "1. Critical files exist"

CRITICAL_FILES=(
  "src/app/api/upload/route.ts"
  "src/app/api/health/route.ts"
  "src/app/api/health-monitor/route.ts"
  "src/app/sitemap.xml/route.ts"
  "src/app/robots.txt/route.ts"
  "src/app/api/content/route.ts"
  "src/app/api/cms/route.ts"
  "src/app/api/rooms/route.ts"
  "src/app/api/pricing-rules/route.ts"
  "src/app/api/seo-audit/route.ts"
  "src/app/api/reviews/checkout-funnel/route.ts"
  "src/app/api/whatsapp-bot/route.ts"
  "src/app/api/whatsapp/webhook/route.ts"
  "src/app/api/channel-webhook/[code]/route.ts"
  "src/app/error.tsx"
  "src/app/global-error.tsx"
  "src/app/layout.tsx"
  "src/app/page.tsx"
  "src/components/site/ErrorBoundary.tsx"
  "src/components/site/WhatsAppChat.tsx"
  "src/components/site/Navbar.tsx"
  "src/components/site/Footer.tsx"
  "src/pages/SEOPage.tsx"
  "src/pages/CMSPage.tsx"
  "src/pages/LoginPage.tsx"
  "src/pages/RoomsPage.tsx"
  "src/pages/admin/AdminContent.tsx"
  "src/lib/use-cms.ts"
  "src/lib/seo-pages.ts"
  "src/lib/seo-pages-phase2.ts"
  "src/lib/site-data.ts"
  "src/lib/db.ts"
  "prisma/schema.prisma"
  "Dockerfile"
  "docker-compose.yml"
  "Caddyfile"
  "deploy.sh"
  "vercel.json"
  "public/sw.js"
  "public/manifest.json"
)

for f in "${CRITICAL_FILES[@]}"; do
  if [ -f "$f" ]; then
    pass "$f"
  else
    fail "$f MISSING — will cause runtime errors"
  fi
done

echo ""

# ─── 2. TypeScript Check ──────────────────────────────────────────────────
check "2. TypeScript typecheck"
if npx tsc --noEmit 2>&1 | grep -q "error TS"; then
  ERROR_COUNT=$(npx tsc --noEmit 2>&1 | grep -c "error TS")
  fail "TypeScript has $ERROR_COUNT errors — fix before pushing"
  npx tsc --noEmit 2>&1 | grep "error TS" | head -5
else
  pass "Zero TypeScript errors"
fi

echo ""

# ─── 3. .gitignore Not Blocking Critical Routes ──────────────────────────
check "3. .gitignore not blocking critical routes"

GITIGNORE_CHECKS=(
  "src/app/api/upload/route.ts"
  "src/app/api/health/route.ts"
  "src/app/sitemap.xml/route.ts"
  "src/app/robots.txt/route.ts"
)

for f in "${GITIGNORE_CHECKS[@]}"; do
  if git check-ignore "$f" > /dev/null 2>&1; then
    fail "$f is gitignored — will not be pushed to GitHub"
  else
    pass "$f not gitignored"
  fi
done

echo ""

# ─── 4. Git: No Accidentally Deleted Files ────────────────────────────────
check "4. No accidentally deleted files in working tree"

DELETED=$(git status --short | grep "^ D" | head -5)
if [ -z "$DELETED" ]; then
  pass "No deleted files in working tree"
else
  fail "Deleted files detected — check if intentional:"
  echo "$DELETED"
fi

echo ""

# ─── 5. Upload Route Has Blob Support ─────────────────────────────────────
check "5. Upload route has Vercel Blob + filesystem fallback"

if grep -q "BLOB_READ_WRITE_TOKEN" src/app/api/upload/route.ts && \
   grep -q "writeFile" src/app/api/upload/route.ts; then
  pass "Upload route has Blob + filesystem + base64 fallback"
else
  warn "Upload route may be missing fallback strategies"
fi

echo ""

# ─── 6. Cache Invalidation After CMS Save ────────────────────────────────
check "6. CMS cache invalidation wired"

if grep -q "invalidateCMSCache" src/pages/admin/AdminContent.tsx && \
   grep -q "invalidateCMSCache" src/pages/CMSPage.tsx; then
  pass "invalidateCMSCache() called in AdminContent + CMSPage"
else
  fail "invalidateCMSCache() not called — CMS edits won't reflect on frontend"
fi

echo ""

# ─── 7. No Cache-Control: no-store Missing on CMS APIs ───────────────────
check "7. CMS APIs have no-store cache headers"

CMS_APIS=(
  "src/app/api/content/route.ts"
  "src/app/api/cms/route.ts"
  "src/app/api/rooms/route.ts"
)

for f in "${CMS_APIS[@]}"; do
  if grep -q "no-store" "$f"; then
    pass "$f has Cache-Control: no-store"
  else
    fail "$f missing Cache-Control: no-store — Vercel will cache stale data"
  fi
done

echo ""

# ─── 8. Error Boundaries Present ─────────────────────────────────────────
check "8. Error handling system present"

if [ -f "src/components/site/ErrorBoundary.tsx" ] && \
   [ -f "src/app/error.tsx" ] && \
   [ -f "src/app/global-error.tsx" ]; then
  pass "ErrorBoundary + error.tsx + global-error.tsx all present"
else
  fail "Error handling files missing — app will crash on errors"
fi

echo ""

# ─── 9. SEO Pages Count ──────────────────────────────────────────────────
check "9. SEO pages count"

SEO_COUNT=$(grep -c "slug:" src/lib/seo-pages.ts 2>/dev/null || echo 0)
SEO_COUNT2=$(grep -c "slug:" src/lib/seo-pages-phase2.ts 2>/dev/null || echo 0)
TOTAL=$((SEO_COUNT + SEO_COUNT2))
if [ "$TOTAL" -ge 30 ]; then
  pass "$TOTAL SEO pages configured (Phase 1: $SEO_COUNT + Phase 2: $SEO_COUNT2)"
else
  warn "Only $TOTAL SEO pages — expected 35+"
fi

echo ""

# ─── 10. Sitemap Includes All SEO Pages ──────────────────────────────────
check "10. Sitemap imports ALL_SEO_PAGES"

if grep -q "ALL_SEO_PAGES" src/app/sitemap.xml/route.ts; then
  pass "Sitemap uses ALL_SEO_PAGES (includes Phase 1 + Phase 2)"
else
  fail "Sitemap doesn't import ALL_SEO_PAGES — SEO pages won't be in sitemap"
fi

echo ""

# ─── 11. Vercel.json Cron Exists ─────────────────────────────────────────
check "11. Vercel cron configured"

if [ -f "vercel.json" ] && grep -q "crons" vercel.json; then
  pass "vercel.json has cron configuration"
else
  warn "vercel.json missing cron — review funnel won't run automatically"
fi

echo ""

# ─── 12. Docker Files Present ────────────────────────────────────────────
check "12. VPS Docker files present"

DOCKER_FILES=("Dockerfile" "docker-compose.yml" "Caddyfile" "deploy.sh" ".env.example" "README-VPS.md" "mini-services/realtime/Dockerfile")
ALL_PRESENT=true
for f in "${DOCKER_FILES[@]}"; do
  if [ ! -f "$f" ]; then
    fail "$f missing — VPS deployment will fail"
    ALL_PRESENT=false
  fi
done
if $ALL_PRESENT; then
  pass "All 7 Docker/VPS files present"
fi

echo ""

# ─── 13. Service Worker Version ──────────────────────────────────────────
check "13. Service worker is v2+"

if grep -q "gd-v2\|gd-v3" public/sw.js; then
  pass "Service worker is v2+ (with offline fallback)"
else
  warn "Service worker may be outdated — check cache version"
fi

echo ""

# ─── 14. No Hardcoded localhost:3003 ─────────────────────────────────────
check "14. No hardcoded localhost:3003 (should use env var)"

LOCALHOST_COUNT=$(grep -r "localhost:3003" src/app/api/ --include="*.ts" | grep -v "REALTIME_URL" | grep -v "process.env" | wc -l)
if [ "$LOCALHOST_COUNT" -eq 0 ]; then
  pass "All realtime URLs use process.env.REALTIME_URL"
else
  fail "$LOCALHOST_COUNT files have hardcoded localhost:3003 — won't work on VPS"
  grep -rn "localhost:3003" src/app/api/ --include="*.ts" | grep -v "REALTIME_URL" | grep -v "process.env" | head -3
fi

echo ""

# ─── 15. Package.json Has postinstall ────────────────────────────────────
check "15. postinstall: prisma generate present"

if grep -q '"postinstall": "prisma generate"' package.json; then
  pass "postinstall runs prisma generate (needed for Vercel builds)"
else
  fail "Missing postinstall script — Vercel builds will fail (Prisma client not generated)"
fi

echo ""

# ─── SUMMARY ─────────────────────────────────────────────────────────────
echo "========================================"
echo -e "📊 SUMMARY: ${GREEN}$PASS passed${NC} · ${RED}$FAIL failed${NC} · ${YELLOW}$WARN warnings${NC}"
echo "========================================"

if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo -e "${RED}❌ DO NOT PUSH — $FAIL check(s) failed. Fix them first.${NC}"
  exit 1
else
  echo ""
  echo -e "${GREEN}✅ ALL CHECKS PASSED — safe to push!${NC}"
  exit 0
fi
