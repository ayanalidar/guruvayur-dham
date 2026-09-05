/**
 * Seed all editable CMS content to Neon
 */
import { PrismaClient } from "@prisma/client";
import { WHY_CHOOSE_US, EVENTS, TESTIMONIALS, FAQS, TRUST_BADGES, POOJAS } from "../src/lib/site-data";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CMS content to Neon...");

  // Features (Why Choose Us)
  for (let i = 0; i < WHY_CHOOSE_US.length; i++) {
    const f = WHY_CHOOSE_US[i];
    await db.feature.create({ data: { icon: f.icon, title: f.title, text: f.text, sortOrder: i } });
  }
  console.log(`✓ ${WHY_CHOOSE_US.length} features`);

  // Events
  for (let i = 0; i < EVENTS.length; i++) {
    const e = EVENTS[i];
    await db.event.create({ data: { name: e.name, date: e.date, dateISO: e.dateISO ? new Date(e.dateISO) : null, description: e.description, highlight: e.highlight, image: e.image, sortOrder: i } });
  }
  console.log(`✓ ${EVENTS.length} events`);

  // Testimonials
  for (let i = 0; i < TESTIMONIALS.length; i++) {
    const t = TESTIMONIALS[i];
    await db.testimonial.create({ data: { name: t.name, city: t.city, rating: t.rating, text: t.text, room: t.room || null, sortOrder: i } });
  }
  console.log(`✓ ${TESTIMONIALS.length} testimonials`);

  // FAQs
  for (let i = 0; i < FAQS.length; i++) {
    const f = FAQS[i];
    await db.fAQItem.create({ data: { question: f.q, answer: f.a, sortOrder: i } });
  }
  console.log(`✓ ${FAQS.length} FAQs`);

  // Trust badges
  for (let i = 0; i < TRUST_BADGES.length; i++) {
    const t = TRUST_BADGES[i];
    await db.trustBadge.create({ data: { icon: t.icon, text: t.text, sortOrder: i } });
  }
  console.log(`✓ ${TRUST_BADGES.length} trust badges`);

  // Poojas (from site-data, now editable in DB)
  for (let i = 0; i < POOJAS.length; i++) {
    const p = POOJAS[i];
    await db.pooja.create({ data: { name: p.name, price: p.price, duration: p.duration, description: p.description, prasadam: p.prasadam, image: p.image, significance: p.significance, sortOrder: i } });
  }
  console.log(`✓ ${POOJAS.length} poojas`);

  console.log("\n✅ CMS content seeded!");
  await db.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
