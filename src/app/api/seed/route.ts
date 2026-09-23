import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ROOMS, POOJAS, FAQS, TESTIMONIALS, BLOG_POSTS, GALLERY_IMAGES, SITE } from "@/lib/site-data";
import { DEFAULT_SETTINGS, DEFAULT_FEATURE_FLAGS } from "@/lib/settings";
import crypto from "crypto";

/**
 * POST /api/seed
 *
 * Database seeding endpoint — NO AUTH REQUIRED.
 * This is a bootstrap/setup tool that creates initial data so you can login.
 *
 * Safe to call multiple times (uses upsert — creates or updates).
 * The only "risk" is overwriting CMS content with defaults.
 *
 * Resilient: if one step fails, the next step still runs.
 * The response includes per-step status + any error messages so you can
 * see exactly what failed without digging through Vercel logs.
 */
export async function POST(req: NextRequest) {
  const results: string[] = [];
  const errors: string[] = [];

  // Helper: run a step, capture any error, continue
  async function step<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
    try {
      const r = await fn();
      results.push(`✓ ${label}`);
      return r;
    } catch (e: any) {
      const msg = e?.message || String(e);
      errors.push(`✗ ${label}: ${msg}`);
      // Also log to Vercel functions log
      console.error(`[seed] FAILED step: ${label}`, e);
      return null;
    }
  }

  // Pre-flight DB ping
  await step("DB ping", async () => {
    await db.$queryRaw`SELECT 1`;
  });
  if (errors.length === 1 && errors[0].startsWith("✗ DB ping")) {
    // Can't reach DB — fail fast
    return NextResponse.json({
      ok: false,
      error: "Cannot reach database",
      message: errors[0],
      hint: "Check DATABASE_URL on Vercel (Settings → Environment Variables). Neon cold start can take 2-3s — try once more.",
      results,
      errors,
    }, { status: 500 });
  }

  // 1. Clean old rooms
  await step("Delete old rooms", async () => {
    const oldRooms = await db.room.findMany({ select: { slug: true } });
    const currentSlugs = ROOMS.map(r => r.slug);
    const oldSlugs = oldRooms.map(r => r.slug).filter(s => !currentSlugs.includes(s));
    if (oldSlugs.length > 0) {
      await db.room.deleteMany({ where: { slug: { in: oldSlugs } } });
      results.push(`  Deleted ${oldSlugs.length} old rooms`);
    }
  });

  // 2. Seed rooms
  const unitCounts: Record<string, number> = { "deluxe-room": 4, "super-deluxe-room": 5, "superior-room": 5, "gvd-suite": 2 };
  await step("Seed rooms", async () => {
    for (const r of ROOMS) {
      await db.room.upsert({
        where: { slug: r.slug },
        create: {
          slug: r.slug, name: r.name, type: r.type, price: r.price,
          originalPrice: r.originalPrice || null, capacity: r.capacity,
          size: r.size, bedType: r.bedType, image: r.image,
          gallery: JSON.stringify(r.gallery), badge: r.badge || null,
          description: r.description, amenities: JSON.stringify(r.amenities),
          shortDesc: r.shortDesc, rating: r.rating, reviews: r.reviews,
          totalUnits: unitCounts[r.slug] || 4, active: true,
        },
        update: {
          name: r.name, type: r.type, price: r.price,
          originalPrice: r.originalPrice || null, capacity: r.capacity,
          size: r.size, bedType: r.bedType, image: r.image,
          gallery: JSON.stringify(r.gallery), badge: r.badge || null,
          description: r.description, amenities: JSON.stringify(r.amenities),
          shortDesc: r.shortDesc, rating: r.rating, reviews: r.reviews,
          totalUnits: unitCounts[r.slug] || 4,
        },
      });
    }
  });

  // 3. Seed content blocks (the most important ones for footer etc.)
  const blocks = [
    { key: "hero.eyebrow", value: "Stay · Pooja · Blessing · Since 1998", category: "hero", label: "Hero Eyebrow" },
    { key: "hero.headline", value: "Where Your Stay", category: "hero", label: "Hero Headline" },
    { key: "hero.headlineHighlight", value: "Journey", category: "hero", label: "Hero Highlight" },
    { key: "hero.subheadline", value: "Guruvayur Dham is a premium pilgrimage stay in Mathura, created for travellers seeking comfort, serenity and thoughtful hospitality while experiencing the sacred land.", category: "hero", label: "Hero Subheadline" },
    { key: "footer.tagline", value: "Luxury Pilgrim Stay", category: "footer", label: "Footer Tagline" },
    { key: "site.name", value: "GuruVayur Dham", category: "site", label: "Site Name" },
    { key: "site.email", value: "bookings@guruvayurdham.co.in", category: "site", label: "Site Email" },
    { key: "site.address", value: "68/396 Mali Para, Opp. Mata Pathwari Mandir, Dholi Pyau, Mathura, Uttar Pradesh - 281001", category: "site", label: "Site Address" },
    { key: "site.distanceToTemple", value: "Walk to Mata Pathwari Mandir", category: "site", label: "Distance to Temple" },
    { key: "site.totalRooms", value: "16", category: "site", label: "Total Rooms" },
    { key: "contact.phone", value: "+91 8445555584", category: "contact", label: "Primary Phone" },
    { key: "contact.phoneRaw", value: "+918445555584", category: "contact", label: "Phone Raw" },
    { key: "contact.phone2", value: "+91 9410077786", category: "contact", label: "Secondary Phone" },
    { key: "contact.phones", value: "+91 8445555584, +91 9410077786", category: "contact", label: "Combined Phones Display" },
    { key: "contact.whatsapp", value: "918445555584", category: "contact", label: "WhatsApp" },
    { key: "contact.email", value: "bookings@guruvayurdham.co.in", category: "contact", label: "Contact Email" },
    { key: "contact.shortAddress", value: "Mali Para, Dholi Pyau, Mathura 281001", category: "contact", label: "Short Address" },
    { key: "contact.checkIn", value: "12:00 PM", category: "contact", label: "Check-in" },
    { key: "contact.checkOut", value: "11:00 AM", category: "contact", label: "Check-out" },
    // Homepage stats strip — WhyChooseUs section
    { key: "homepage.stats.rooms", value: "16", category: "homepage", label: "Homepage Stat · Rooms" },
    { key: "homepage.stats.years", value: "10", category: "homepage", label: "Homepage Stat · Years of Service" },
    { key: "homepage.stats.guests", value: "15000", category: "homepage", label: "Homepage Stat · Happy Guests" },
    { key: "homepage.stats.rating", value: "4.8", category: "homepage", label: "Homepage Stat · Google Rating" },
    // Invoice / Tax settings — synced to sample PDF
    { key: "invoice.hotelName", value: "GuruVayur Dham", category: "invoice", label: "Invoice · Hotel Name" },
    { key: "invoice.gstin", value: "09ABAFG2373H1ZG", category: "invoice", label: "Invoice · Hotel GSTIN" },
    { key: "invoice.address", value: "68/396 Mali Para, Opp. Mata Pathwari Mandir, Dholi Pyau, Mathura, Uttar Pradesh - 281001", category: "invoice", label: "Invoice · Hotel Address" },
    { key: "invoice.phones", value: "+91 8445555584, +91 9410077786", category: "invoice", label: "Invoice · Hotel Phones" },
    { key: "invoice.email", value: "bookings@guruvayurdham.co.in", category: "invoice", label: "Invoice · Hotel Email" },
    { key: "invoice.bank.name", value: "AU Small Finance Bank", category: "invoice", label: "Invoice · Bank Name" },
    { key: "invoice.bank.accountNumber", value: "2502421377158310", category: "invoice", label: "Invoice · Bank Account Number" },
    { key: "invoice.bank.ifsc", value: "AUBL0004213", category: "invoice", label: "Invoice · Bank IFSC" },
    { key: "invoice.bank.branch", value: "Mathura", category: "invoice", label: "Invoice · Bank Branch" },
    { key: "invoice.terms", value: "1. Subjected to Mathura jurisdiction only.\n2. Goods once sold will not be taken back.\n3. Interest @ 24% p.a. will be charged if bill not paid within 15 days.", category: "invoice", label: "Invoice · Terms & Conditions" },
    { key: "invoice.footerCredit", value: "Powered By: GUARDIANX", category: "invoice", label: "Invoice · Footer Credit" },
    { key: "invoice.logoPath", value: "/public/logo-invoice.png", category: "invoice", label: "Invoice · Logo Path" },
  ];
  await step("Seed content blocks", async () => {
    for (const b of blocks) {
      await db.contentBlock.upsert({ where: { key: b.key }, create: b, update: { value: b.value } });
    }
  });

  // 4. Seed poojas
  await step("Seed poojas", async () => {
    for (const p of POOJAS) {
      await db.pooja.upsert({
        where: { id: p.id },
        create: { id: p.id, name: p.name, price: p.price, duration: (p as any).duration || null, description: p.description, prasadam: (p as any).prasadam || "", image: p.image || "", significance: (p as any).significance || "", active: true },
        update: { name: p.name, price: p.price, description: p.description },
      });
    }
  });

  // 5. Seed FAQs
  await step("Seed FAQs", async () => {
    for (let i = 0; i < FAQS.length; i++) {
      await db.fAQItem.upsert({
        where: { id: `faq-${i+1}` },
        create: { id: `faq-${i+1}`, question: FAQS[i].q, answer: FAQS[i].a, active: true, sortOrder: i },
        update: { question: FAQS[i].q, answer: FAQS[i].a, sortOrder: i },
      });
    }
  });

  // 6. Seed testimonials (as Reviews)
  await step("Seed testimonials", async () => {
    for (const t of TESTIMONIALS) {
      const id = `seed-${t.name.replace(/\s+/g, "-").toLowerCase()}`;
      await db.review.upsert({
        where: { id },
        create: { id, authorName: t.name, rating: t.rating, text: t.text, published: true, featured: (t as any).featured || false, reviewDate: new Date() },
        update: { authorName: t.name, rating: t.rating, text: t.text },
      });
    }
  });

  // 7. Seed settings
  await step("Seed settings", async () => {
    for (const s of DEFAULT_SETTINGS) {
      await db.setting.upsert({
        where: { key: s.key },
        create: { key: s.key, value: "", category: s.category, label: s.label, isSecret: s.isSecret, isSet: false },
        update: {},
      });
    }
  });

  // 8. Seed feature flags
  await step("Seed feature flags", async () => {
    for (const f of DEFAULT_FEATURE_FLAGS) {
      await db.featureFlag.upsert({
        where: { key: f.key },
        create: { key: f.key, label: f.label, description: f.description, enabled: f.enabled },
        update: {},
      });
    }
  });

  // 9. Seed coupons
  await step("Seed coupons", async () => {
    const coupons = [
      { code: "EARLYBIRD10", description: "10% off 30+ days ahead", type: "PERCENTAGE", value: 10, maxDiscount: 500, minBooking: 1000, usageLimit: 100, validFrom: new Date("2026-01-01"), validTo: new Date("2026-12-31") },
      { code: "RETURN15", description: "15% off returning guests", type: "PERCENTAGE", value: 15, maxDiscount: 700, minBooking: 1000, usageLimit: 0, validFrom: new Date("2026-01-01"), validTo: new Date("2026-12-31") },
    ];
    for (const c of coupons) {
      await db.coupon.upsert({ where: { code: c.code }, create: c as any, update: {} });
    }
  });

  // 10. Seed pricing rules
  await step("Seed pricing rules", async () => {
    const rules = [
      { name: "Weekend Surge", type: "WEEKEND", multiplier: 1.3, dayOfWeek: "5,6", priority: 10 },
      { name: "Early Bird", type: "EARLY_BIRD", multiplier: 0.9, priority: 7 },
      { name: "Last-Minute", type: "LAST_MINUTE", multiplier: 0.85, priority: 5 },
    ];
    for (const r of rules) {
      const existing = await db.dynamicPricingRule.findFirst({ where: { name: r.name } });
      if (!existing) await db.dynamicPricingRule.create({ data: r as any });
    }
  });

  // 11. Seed staff users — MANAGER pin is the most important (login)
  const pins: string[] = [];
  await step("Seed staff users", async () => {
    const staff = [
      { name: "Krishnan Sharma", email: "manager@guruvayurdham.co.in", phone: "+91-90908 20208", role: "MANAGER", pin: crypto.randomInt(1000, 10000).toString() },
      { name: "Lakshmi Sharma", email: "reception@guruvayurdham.co.in", phone: "+91 99876 54321", role: "RECEPTIONIST", pin: crypto.randomInt(1000, 10000).toString() },
      { name: "Ravi Sharma", email: "housekeeping@guruvayurdham.co.in", phone: "+91 90123 45678", role: "HOUSEKEEPING", pin: crypto.randomInt(1000, 10000).toString() },
      { name: "Saritha Sharma", email: "accounts@guruvayurdham.co.in", phone: "+91 91234 56789", role: "ACCOUNTANT", pin: crypto.randomInt(1000, 10000).toString() },
    ];
    for (const s of staff) {
      await db.staffUser.upsert({ where: { email: s.email }, create: s, update: {} });
      pins.push(`${s.role} | ${s.email} | PIN: ${s.pin}`);
    }
  });

  // Always disconnect cleanly
  try { await db.$disconnect(); } catch {}

  const ok = errors.length === 0;
  return NextResponse.json({
    ok,
    message: ok ? "Seed complete!" : `Seed partially complete — ${errors.length} step(s) failed`,
    results,
    errors,
    staffPins: pins,
    hint: ok ? "" : "If only 'Seed staff users' failed, you may have a database column mismatch — check Prisma schema vs migrations.",
  }, { status: ok ? 200 : 500 });
}

export async function GET(req: NextRequest) {
  // No auth required — this is a status check (safe to expose)
  try {
    const [rooms, settings, flags, poojas, faqs, staff] = await Promise.all([
      db.room.count(), db.setting.count(), db.featureFlag.count(),
      db.pooja.count(), db.fAQItem.count(), db.staffUser.count(),
    ]);

    return NextResponse.json({
      seeded: { rooms, settings, featureFlags: flags, poojas, faqs, staffUsers: staff },
      expected: { rooms: ROOMS.length, settings: DEFAULT_SETTINGS.length, featureFlags: DEFAULT_FEATURE_FLAGS.length },
      needsSeeding: rooms === 0,
    });
  } catch (e: any) {
    return NextResponse.json({
      error: "DB check failed",
      message: e?.message || String(e),
      hint: "Check DATABASE_URL on Vercel (Settings → Environment Variables). Neon cold start can take 2-3s — try once more.",
    }, { status: 500 });
  }
}
