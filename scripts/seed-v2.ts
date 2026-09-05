/**
 * Seed script v2 — adds menu items, housekeeping rooms, staff users, blog posts, gallery, coupons, pricing rules, etc.
 */
import { PrismaClient } from "@prisma/client";
import { BLOG_POSTS, GALLERY_IMAGES, ROOMS } from "../src/lib/site-data";

const db = new PrismaClient();

const MENU_ITEMS = [
  { name: "Idli Sambar (2 pcs)", description: "Steamed rice cakes with lentil sambar", price: 40, category: "BREAKFAST", veg: true, prepTime: 10 },
  { name: "Masala Dosa", description: "Crispy rice crepe with potato masala", price: 70, category: "BREAKFAST", veg: true, prepTime: 12 },
  { name: "Poori Bhaji (2 pcs)", description: "Fried wheat bread with potato curry", price: 60, category: "BREAKFAST", veg: true, prepTime: 10 },
  { name: "Upma", description: "Semolina with vegetables", price: 50, category: "BREAKFAST", veg: true, prepTime: 8 },
  { name: "Filter Coffee", description: "South Indian filter coffee", price: 25, category: "BEVERAGES", veg: true, prepTime: 5 },
  { name: "Masala Chai", description: "Spiced milk tea", price: 20, category: "BEVERAGES", veg: true, prepTime: 5 },
  { name: "Veg Meals (Thali)", description: "Rice, 3 curries, sambar, rasam, curd, pickle, papad", price: 120, category: "LUNCH", veg: true, prepTime: 15 },
  { name: "Curd Rice", description: "Yogurt rice with tempered spices", price: 60, category: "LUNCH", veg: true, prepTime: 10 },
  { name: "Lemon Rice", description: "Tangy rice with peanuts", price: 50, category: "LUNCH", veg: true, prepTime: 10 },
  { name: "Veg Biryani", description: "Fragrant basmati with vegetables", price: 130, category: "DINNER", veg: true, prepTime: 20 },
  { name: "Chapati (2 pcs)", description: "Wheat flatbread with dal", price: 50, category: "DINNER", veg: true, prepTime: 12 },
  { name: "Paneer Butter Masala", description: "Cottage cheese in creamy tomato gravy", price: 150, category: "DINNER", veg: true, prepTime: 18 },
  { name: "Veg Fried Rice", description: "Indo-Chinese fried rice", price: 110, category: "DINNER", veg: true, prepTime: 15 },
  { name: "Gobi Manchurian", description: "Crispy cauliflower in spicy sauce", price: 100, category: "SNACKS", veg: true, prepTime: 15 },
  { name: "Samosa (2 pcs)", description: "Crispy pastry with potato filling", price: 30, category: "SNACKS", veg: true, prepTime: 10 },
  { name: "Pazham (Banana)", description: "Fresh banana", price: 15, category: "SNACKS", veg: true, prepTime: 2 },
  { name: "Mineral Water 1L", description: "Bottled water", price: 20, category: "BEVERAGES", veg: true, prepTime: 1 },
  { name: "Buttermilk", description: "Spiced buttermilk", price: 25, category: "BEVERAGES", veg: true, prepTime: 5 },
];

const STAFF = [
  { name: "Krishnan Warrier", email: "manager@guruvayurdham.com", phone: "+91 98765 43210", role: "MANAGER", pin: "1234" },
  { name: "Lakshmi Pillai", email: "reception@guruvayurdham.com", phone: "+91 99876 54321", role: "RECEPTIONIST", pin: "2345" },
  { name: "Ravi Menon", email: "housekeeping@guruvayurdham.com", phone: "+91 90123 45678", role: "HOUSEKEEPING", pin: "3456" },
  { name: "Saritha Nair", email: "accounts@guruvayurdham.com", phone: "+91 91234 56789", role: "ACCOUNTANT", pin: "4567" },
];

const COUPONS = [
  { code: "EARLYBIRD10", description: "10% off for bookings made 30+ days in advance", type: "PERCENTAGE", value: 10, maxDiscount: 500, minBooking: 1000, usageLimit: 100, validFrom: new Date("2026-01-01"), validTo: new Date("2026-12-31") },
  { code: "EKADASI2026", description: "₹300 off during Ekadasi festival season", type: "FLAT", value: 300, maxDiscount: null, minBooking: 1500, usageLimit: 50, validFrom: new Date("2026-11-01"), validTo: new Date("2026-12-15") },
  { code: "RETURN15", description: "15% off for returning guests (loyalty)", type: "PERCENTAGE", value: 15, maxDiscount: 700, minBooking: 1000, usageLimit: 0, validFrom: new Date("2026-01-01"), validTo: new Date("2026-12-31") },
  { code: "WEEKDAY5", description: "5% off for Monday-Thursday stays", type: "PERCENTAGE", value: 5, maxDiscount: 200, minBooking: 700, usageLimit: 0, validFrom: new Date("2026-01-01"), validTo: new Date("2026-12-31") },
  { code: "GROUP10", description: "₹500 off for group bookings (10+ guests)", type: "FLAT", value: 500, maxDiscount: null, minBooking: 5000, usageLimit: 0, validFrom: new Date("2026-01-01"), validTo: new Date("2026-12-31") },
];

const PRICING_RULES = [
  { name: "Weekend Surge", type: "WEEKEND", multiplier: 1.3, dayOfWeek: "5,6", priority: 10 },
  { name: "Friday + Saturday + Sunday", type: "WEEKEND", multiplier: 1.2, dayOfWeek: "0", priority: 8 },
  { name: "Last-Minute Discount (same day)", type: "LAST_MINUTE", multiplier: 0.85, priority: 5 },
  { name: "Early Bird (30+ days ahead)", type: "EARLY_BIRD", multiplier: 0.9, priority: 7 },
  { name: "Summer Off-Season", type: "SEASONAL", multiplier: 0.85, startDate: new Date("2026-03-15"), endDate: new Date("2026-05-31"), priority: 3 },
];

const TRAVEL_AGENTS = [
  { companyName: "Kerala Pilgrim Tours", contactName: "Anand Kumar", phone: "+91 94470 12345", email: "anand@keralapilgrim.com", commissionRate: 0.12, creditLimit: 50000 },
  { companyName: "South India Travels", contactName: "Priya Sharma", phone: "+91 98400 67890", email: "priya@southindiatravels.com", commissionRate: 0.15, creditLimit: 75000 },
  { companyName: "Divine Journeys", contactName: "Mohan Das", phone: "+91 93300 11111", email: "mohan@divinejourneys.in", commissionRate: 0.10, creditLimit: 40000 },
];

async function seed() {
  console.log("🌱 Seeding v2 data...");

  // Menu items
  for (const m of MENU_ITEMS) {
    await db.menuItem.create({ data: m });
  }
  console.log(`✓ ${MENU_ITEMS.length} menu items seeded`);

  // Staff users
  for (const s of STAFF) {
    await db.staffUser.upsert({
      where: { email: s.email },
      create: s,
      update: {},
    });
  }
  console.log(`✓ ${STAFF.length} staff users seeded`);

  // Coupons
  for (const c of COUPONS) {
    await db.coupon.upsert({
      where: { code: c.code },
      create: c as any,
      update: {},
    });
  }
  console.log(`✓ ${COUPONS.length} coupons seeded`);

  // Pricing rules
  for (const r of PRICING_RULES) {
    await db.dynamicPricingRule.create({ data: r as any });
  }
  console.log(`✓ ${PRICING_RULES.length} pricing rules seeded`);

  // Travel agents
  for (const t of TRAVEL_AGENTS) {
    await db.travelAgent.create({ data: t });
  }
  console.log(`✓ ${TRAVEL_AGENTS.length} travel agents seeded`);

  // Housekeeping status — create physical rooms for each room type
  const rooms = await db.room.findMany();
  const roomNumbersByType: Record<string, string[]> = {};
  for (const room of rooms) {
    const count = room.totalUnits;
    const numbers: string[] = [];
    const floor = room.type === "Deluxe" ? 3 : room.type === "Family" ? 2 : room.type === "AC" ? 1 : 0;
    for (let i = 1; i <= Math.min(count, 10); i++) {
      numbers.push(`${floor}${String(i).padStart(2, "0")}`);
    }
    roomNumbersByType[room.slug] = numbers;
    for (const num of numbers) {
      const statuses = ["READY", "OCCUPIED", "DIRTY", "CLEANING", "READY", "READY"];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      await db.housekeepingStatus.upsert({
        where: { roomNumber: num },
        create: {
          roomNumber: num,
          roomSlug: room.slug,
          status,
          assignedTo: status === "CLEANING" || status === "DIRTY" ? "Ravi Menon" : null,
          lastCleanedAt: status === "READY" ? new Date() : null,
        },
        update: {},
      });
    }
  }
  const totalHk = Object.values(roomNumbersByType).flat().length;
  console.log(`✓ ${totalHk} housekeeping rooms seeded`);

  // Blog posts
  for (const p of BLOG_POSTS) {
    await db.blogPost.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        category: p.category,
        readTime: p.readTime,
        date: p.date,
        image: p.image,
        content: JSON.stringify(p.content),
      },
      update: {},
    });
  }
  console.log(`✓ ${BLOG_POSTS.length} blog posts seeded`);

  // Gallery images
  for (const g of GALLERY_IMAGES) {
    await db.galleryImage.create({
      data: {
        tab: g.tab,
        src: g.src,
        alt: g.alt,
        caption: g.caption,
        span: g.span || null,
      },
    });
  }
  console.log(`✓ ${GALLERY_IMAGES.length} gallery images seeded`);

  // Early-bird campaign
  await db.earlyBirdCampaign.create({
    data: {
      name: "Ekadasi 2026 Early Bird",
      festivalName: "Guruvayur Ekadasi",
      startDate: new Date("2026-09-01"),
      endDate: new Date("2026-11-08"),
      discountPercent: 15,
      bookingWindowStart: new Date("2026-09-01"),
      bookingWindowEnd: new Date("2026-10-15"),
    },
  });
  console.log(`✓ 1 early-bird campaign seeded`);

  console.log("\n✅ Seed v2 complete!");
  await db.$disconnect();
}

seed().catch((e) => { console.error(e); process.exit(1); });
