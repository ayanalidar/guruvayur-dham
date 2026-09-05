/**
 * Audit all SEO pages — verify each has complete content.
 * Checks: intro length, sections, FAQs, meta description, etc.
 */
import { SEO_PAGES } from "../src/lib/seo-pages";

console.log("📊 SEO Pages Audit\n");
console.log("═".repeat(80));

let totalWords = 0;
let issues: string[] = [];

for (const page of SEO_PAGES) {
  console.log(`\n📄 /${page.slug}`);
  console.log(`   Category: ${page.category}`);
  console.log(`   Title: ${page.title.substring(0, 70)}...`);

  // Check meta description length (ideal: 120-160 chars)
  const metaLen = page.metaDescription.length;
  const metaStatus = metaLen >= 120 && metaLen <= 160 ? "✅" : metaLen < 120 ? "⚠️  short" : "⚠️  long";
  console.log(`   Meta desc: ${metaLen} chars ${metaStatus}`);

  // Count words in intro
  const introWords = page.intro.join(" ").split(/\s+/).length;
  console.log(`   Intro: ${introWords} words, ${page.intro.length} paragraphs`);

  // Count sections
  console.log(`   Sections: ${page.sections.length}`);
  for (const s of page.sections) {
    const sectionWords = s.body.join(" ").split(/\s+/).length;
    console.log(`     • ${s.heading} (${sectionWords} words)`);
  }

  // Count FAQs
  console.log(`   FAQs: ${page.faqs.length}`);

  // Check hero image
  console.log(`   Hero image: ${page.heroImage ? "✅" : "❌ missing"}`);

  // Check CTA
  console.log(`   CTA: ${page.ctaHeadline ? "✅" : "❌ missing"}`);

  // Total word count
  const allText = [
    ...page.intro,
    ...page.sections.flatMap(s => s.body),
    ...page.faqs.map(f => f.q + " " + f.a),
    page.title,
    page.metaDescription,
    page.ctaHeadline,
  ].join(" ");
  const wordCount = allText.split(/\s+/).length;
  totalWords += wordCount;
  console.log(`   Total words: ${wordCount}`);

  // Flag issues
  if (introWords < 200) issues.push(`/${page.slug}: intro too short (${introWords} words)`);
  if (page.sections.length < 2) issues.push(`/${page.slug}: only ${page.sections.length} sections`);
  if (page.faqs.length < 3) issues.push(`/${page.slug}: only ${page.faqs.length} FAQs`);
  if (metaLen < 120 || metaLen > 160) issues.push(`/${page.slug}: meta desc ${metaLen} chars (ideal 120-160)`);
}

console.log("\n" + "═".repeat(80));
console.log(`\n📈 Summary:`);
console.log(`   Total pages: ${SEO_PAGES.length}`);
console.log(`   Total words: ${totalWords.toLocaleString()}`);
console.log(`   Avg words/page: ${Math.round(totalWords / SEO_PAGES.length)}`);

console.log(`\n📁 By category:`);
const categories = ["festivals", "hotels-near", "darshan-timings"] as const;
for (const cat of categories) {
  const pages = SEO_PAGES.filter(p => p.category === cat);
  const words = pages.reduce((sum, p) => {
    const text = [...p.intro, ...p.sections.flatMap(s => s.body), ...p.faqs.map(f => f.q + " " + f.a)].join(" ");
    return sum + text.split(/\s+/).length;
  }, 0);
  console.log(`   ${cat}: ${pages.length} pages, ${words.toLocaleString()} words`);
}

if (issues.length > 0) {
  console.log(`\n⚠️  Issues found (${issues.length}):`);
  issues.forEach(i => console.log(`   • ${i}`));
} else {
  console.log(`\n✅ No issues found — all pages have complete content!`);
}
