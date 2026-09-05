---
Task ID: 1, 2, 3
Agent: main (super-z)
Task: Audit hardcoded content, fix broken SEO audit button, wire missing pages (events, blog, testimonials, why-us, about, contact, FAQ, hero) to the CMS so admin edits propagate to the live site.

Work Log:
- Audited every page under `src/pages/` and every component under `src/components/site/`. Found that NONE of the public pages/components fetched from `/api/cms` or `/api/content` at runtime — every visible page was 100% hardcoded via `src/lib/site-data.ts`. The CMS admin UIs existed and the DB models existed, but edits made in admin never reached the live site.
- Fixed the broken SEO audit endpoint (`src/app/api/seo-audit/route.ts`): removed the fake "else awards 100/100 if page didn't load" branch that was awarding perfect scores to every hash route it couldn't fetch. Replaced with real checks: fetches `/`, runs real HTML audit (title, meta desc, H1, JSON-LD, canonical, OG, images/alt, word count); checks `/sitemap.xml`, `/robots.txt`, `/manifest.json` existence; for each SPA hash route saves a row with the base HTML score plus a section-specific recommendation.
- Updated `SettingsPage.tsx` SEO UI to render per-page expandable issue lists (was only showing score numbers before). Added total-issues summary line.
- Built new hook library `src/lib/use-cms.ts` exporting `useContent()` and `useCMSList<T>(type, fallback)` with in-memory caching and graceful fallback to `site-data.ts` constants. Includes typed mappers (`mapEvent`, `mapTestimonial`, `mapFAQ`, `mapFeature`, `mapTrustBadge`, `mapBlogPost`) and an `invalidateCMSCache()` helper.
- Wired 8 site components to CMS with fallbacks: `Hero.tsx` (trust badges + headline blocks), `WhyChooseUs.tsx` (features + section text), `EventsSection.tsx` (events list + section text), `Testimonials.tsx` (testimonials list + section text), `FAQ.tsx` (faqs list + section text), `BlogSection.tsx` (blog posts + section text), `AboutSection.tsx` (story paragraphs + section text), `Contact.tsx` (contact info blocks + section text).
- Wired 4 standalone pages: `EventsPage.tsx`, `FAQPage.tsx`, `BlogPage.tsx` (+ `BlogPostPage.tsx` for single-post view). Each fetches its CMS list and section text at runtime, falling back to hardcoded data.
- Added blog CRUD cases (POST/PATCH/DELETE) to `/api/cms/route.ts` for `blogPosts` type. `content` field is serialized as a JSON string of paragraphs in DB; the mapper parses it back to `string[]` on the client.
- Added a `BlogCMS` editor component to `CMSPage.tsx` with multi-paragraph textarea editor (separate paragraphs with blank line). New "Blog" tab in the CMS UI.
- Expanded `scripts/seed.ts` from 32 to 47 content blocks: added `events.*`, `blog.*`, `testimonials.*`, `faq.*`, `gallery.*` section headers, plus `contact.phone`, `contact.phoneRaw`, `contact.whatsapp`, `contact.email`, `contact.shortAddress`, `contact.mapEmbed`, `contact.mapLink`, `contact.checkIn`, `contact.checkOut`.
- Expanded `AdminContent.tsx` category list from 8 to 13 categories (added Events, Blog, Testimonials, FAQ, Gallery).

Stage Summary:
- SEO audit button now runs real checks (no more fake 100/100) and surfaces per-page issue lists in the UI.
- All 8 user-listed sections (hero, why-us, events, blog, testimonials, about, contact, FAQ) now read from CMS at runtime. Admin edits to `/admin/content` and `/admin/cms` propagate to the live site on next page load.
- Every component falls back to `site-data.ts` hardcoded values if the DB is empty/unreachable, so the site still renders correctly during cold starts or DB outages.
- Blog editor UI added to CMS with multi-paragraph support. Blog CRUD fully wired through `/api/cms`.
- All 13 modified files pass `tsc --noEmit` with zero new errors. The 22 pre-existing TS errors are in unrelated files (examples/, skills/, oauth.ts, PWAEnhancements, etc.).
- Artifacts: `src/lib/use-cms.ts` (new), `src/app/api/seo-audit/route.ts` (rewritten), `src/app/api/cms/route.ts` (added blog CRUD), `src/pages/CMSPage.tsx` (added BlogCMS), `src/pages/admin/AdminContent.tsx` (more categories), `src/pages/SettingsPage.tsx` (SEO issues UI), 8 site components + 4 standalone pages refactored, `scripts/seed.ts` (more content blocks).
- Next step for the user: run `bun run scripts/seed.ts` against the production Neon DB to populate the new content blocks, then visit `/#/admin/content` to edit any section's text, and `/#/admin/cms` → Blog tab to add posts.
