import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { ROOMS, POOJAS, FAQS, TESTIMONIALS, BLOG_POSTS, GALLERY_IMAGES, SITE } from "@/lib/site-data";
import { DEFAULT_SETTINGS, DEFAULT_FEATURE_FLAGS } from "@/lib/settings";
import crypto from "crypto";

/**
 * POST /api/seed
 *
 * One-click database seeding — NO AUTH REQUIRED (for first-time setup).
 * This is the bootstrap endpoint: it creates the initial staff users,
 * rooms, content, etc. so you can actually log in.
 *
 * After seeding, you should set up 2FA and change the default PINs.
 * This endpoint is safe to call multiple times (uses upsert).
 *
 * To protect against abuse, this endpoint only works if:
 * - There are no staff users yet (first-time setup), OR
 * - The caller is authenticated as MANAGER (re-seed)
 */
export async function POST(req: NextRequest) {
  // Check if this is a first-time setup (no staff users exist)
  const staffCount = await db.staffUser.count().catch(() => 0);
  const isFirstTime = staffCount === 0;

  if (!isFirstTime) {
    // Database already has staff — require MANAGER auth for re-seeding
    const { requireStaff } = await import("@/lib/auth");
    const { session, error } = await requireStaff(req, ["MANAGER"]);
    if (error || !session) {
      return error || NextResponse.json({ error: "Unauthorized — login as MANAGER to re-seed, or use the first-time setup path." }, { status: 401 });
    }
  }

  const results: string[] = [];

  try {
    // 1. Clean old rooms
    const oldRooms = await db.room.findMany({ select: { slug: true } });
    const currentSlugs = ROOMS.map(r => r.slug);
    const oldSlugs = oldRooms.map(r => r.slug).filter(s => !currentSlugs.includes(s));
    if (oldSlugs.length > 0) {
      await db.room.deleteMany({ where: { slug: { in: oldSlugs } } });
      results.push(`Deleted ${oldSlugs.length} old rooms`);
    }

    // 2. Seed rooms
    const unitCounts: Record<string, number> = { "deluxe-room": 4, "super-deluxe-room": 5, "superior-room": 5, "gvd-suite": 2 };
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
    results.push(`Seeded ${ROOMS.length} rooms`);

    // 3. Seed content blocks
    const blocks = [
      { key: "hero.eyebrow", value: "Stay · Pooja · Blessing · Since 1998", category: "hero", label: "Hero Eyebrow" },
      { key: "hero.headline", value: "Where Your Stay", category: "hero", label: "Hero Headline" },
      { key: "hero.headlineHighlight", value: "Journey", category: "hero", label: "Hero Highlight" },
      { key: "hero.subheadline", value: "Guruvayur Dham is a premium pilgrimage stay in Mathura, created for travellers seeking comfort, serenity and thoughtful hospitality while experiencing the sacred land.", category: "hero", label: "Hero Subheadline" },
      { key: "footer.tagline", value: "Luxury Pilgrim Stay", category: "footer", label: "Footer Tagline" },
      { key: "site.name", value: "Guruvayur Dham", category: "site", label: "Site Name" },
    ];
    for (const b of blocks) {
      await db.contentBlock.upsert({ where: { key: b.key }, create: b, update: { value: b.value } });
    }
    results.push(`Seeded ${blocks.length} content blocks`);

    // 4. Seed poojas
    for (const p of POOJAS) {
      await db.pooja.upsert({
        where: { id: p.id },
        create: { id: p.id, name: p.name, price: p.price, duration: (p as any).duration || null, description: p.description, prasadam: (p as any).prasadam || "", image: p.image || "", significance: (p as any).significance || "", active: true },
        update: { name: p.name, price: p.price, description: p.description },
      });
    }
    results.push(`Seeded ${POOJAS.length} poojas`);

    // 5. Seed FAQs
    for (let i = 0; i < FAQS.length; i++) {
      await db.fAQItem.upsert({
        where: { id: `faq-${i+1}` },
        create: { id: `faq-${i+1}`, question: FAQS[i].q, answer: FAQS[i].a, active: true, sortOrder: i },
        update: { question: FAQS[i].q, answer: FAQS[i].a, sortOrder: i },
      });
    }
    results.push(`Seeded ${FAQS.length} FAQs`);

    // 6. Seed testimonials
    for (const t of TESTIMONIALS) {
      const id = `seed-${t.name.replace(/\s+/g, "-").toLowerCase()}`;
      await db.review.upsert({
        where: { id },
        create: { id, authorName: t.name, rating: t.rating, text: t.text, published: true, featured: (t as any).featured || false, reviewDate: new Date() },
        update: { authorName: t.name, rating: t.rating, text: t.text },
      });
    }
    results.push(`Seeded ${TESTIMONIALS.length} testimonials`);

    // 7. Seed settings
    for (const s of DEFAULT_SETTINGS) {
      await db.setting.upsert({
        where: { key: s.key },
        create: { key: s.key, value: "", category: s.category, label: s.label, isSecret: s.isSecret, isSet: false },
        update: {},
      });
    }
    results.push(`Seeded ${DEFAULT_SETTINGS.length} settings`);

    // 8. Seed feature flags
    for (const f of DEFAULT_FEATURE_FLAGS) {
      await db.featureFlag.upsert({
        where: { key: f.key },
        create: { key: f.key, label: f.label, description: f.description, enabled: f.enabled },
        update: {},
      });
    }
    results.push(`Seeded ${DEFAULT_FEATURE_FLAGS.length} feature flags`);

    // 9. Seed coupons
    const coupons = [
      { code: "EARLYBIRD10", description: "10% off 30+ days ahead", type: "PERCENTAGE", value: 10, maxDiscount: 500, minBooking: 1000, usageLimit: 100, validFrom: new Date("2026-01-01"), validTo: new Date("2026-12-31") },
      { code: "RETURN15", description: "15% off returning guests", type: "PERCENTAGE", value: 15, maxDiscount: 700, minBooking: 1000, usageLimit: 0, validFrom: new Date("2026-01-01"), validTo: new Date("2026-12-31") },
    ];
    for (const c of coupons) {
      await db.coupon.upsert({ where: { code: c.code }, create: c as any, update: {} });
    }
    results.push(`Seeded ${coupons.length} coupons`);

    // 10. Seed pricing rules
    const rules = [
      { name: "Weekend Surge", type: "WEEKEND", multiplier: 1.3, dayOfWeek: "5,6", priority: 10 },
      { name: "Early Bird", type: "EARLY_BIRD", multiplier: 0.9, priority: 7 },
      { name: "Last-Minute", type: "LAST_MINUTE", multiplier: 0.85, priority: 5 },
    ];
    for (const r of rules) {
      const existing = await db.dynamicPricingRule.findFirst({ where: { name: r.name } });
      if (!existing) await db.dynamicPricingRule.create({ data: r as any });
    }
    results.push(`Seeded ${rules.length} pricing rules`);

    // 11. Seed staff users
    const staff = [
      { name: "Krishnan Sharma", email: "manager@guruvayurdham.co.in", phone: "+91-90908 20208", role: "MANAGER", pin: crypto.randomInt(1000, 10000).toString() },
      { name: "Lakshmi Sharma", email: "reception@guruvayurdham.co.in", phone: "+91 99876 54321", role: "RECEPTIONIST", pin: crypto.randomInt(1000, 10000).toString() },
      { name: "Ravi Sharma", email: "housekeeping@guruvayurdham.co.in", phone: "+91 90123 45678", role: "HOUSEKEEPING", pin: crypto.randomInt(1000, 10000).toString() },
      { name: "Saritha Sharma", email: "accounts@guruvayurdham.co.in", phone: "+91 91234 56789", role: "ACCOUNTANT", pin: crypto.randomInt(1000, 10000).toString() },
    ];
    const pins: string[] = [];
    for (const s of staff) {
      await db.staffUser.upsert({ where: { email: s.email }, create: s, update: {} });
      pins.push(`${s.role} | ${s.email} | PIN: ${s.pin}`);
    }
    results.push(`Seeded ${staff.length} staff users`);

    return NextResponse.json({ ok: true, message: "Seed complete!", results, staffPins: pins });

  } catch (e: any) {
    return NextResponse.json({ error: "Seed failed", message: e.message, results }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // No auth required — this is a status check (safe to expose)
  const [rooms, settings, flags, poojas, faqs, staff] = await Promise.all([
    db.room.count(), db.setting.count(), db.featureFlag.count(),
    db.pooja.count(), db.fAQItem.count(), db.staffUser.count(),
  ]);

  return NextResponse.json({
    seeded: { rooms, settings, featureFlags: flags, poojas, faqs, staffUsers: staff },
    expected: { rooms: ROOMS.length, settings: DEFAULT_SETTINGS.length, featureFlags: DEFAULT_FEATURE_FLAGS.length },
    needsSeeding: rooms === 0,
  });
}
