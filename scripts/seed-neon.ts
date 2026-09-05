/**
 * Seed script — uses process.env.DATABASE_URL directly (bypasses .env loading issues)
 */
import { PrismaClient } from "@prisma/client";
import { ROOMS, POOJAS, FAQS, TESTIMONIALS, SITE, BLOG_POSTS, GALLERY_IMAGES } from "../src/lib/site-data";

const db = new PrismaClient();

const CHANNELS = [
  { code: "BOOKING_COM", name: "Booking.com", logo: "booking", webhookUrl: "/api/channel/booking-com", apiEndpoint: "/api/channel/booking-com/inbox" },
  { code: "MAKEMYTRIP", name: "MakeMyTrip", logo: "mmt", webhookUrl: "/api/channel/makemytrip", apiEndpoint: "/api/channel/makemytrip/inbox" },
  { code: "GOIBIBO", name: "Goibibo", logo: "goibibo", webhookUrl: "/api/channel/goibibo", apiEndpoint: "/api/channel/goibibo/inbox" },
  { code: "AGODA", name: "Agoda", logo: "agoda", webhookUrl: "/api/channel/agoda", apiEndpoint: "/api/channel/agoda/inbox" },
];

const CONTENT_BLOCKS: Array<{ key: string; value: string; category: string; label: string }> = [
  { key: "site.name", value: "Guruvayur Dham", category: "site", label: "Site Name" },
  { key: "site.phone", value: "+91-90908 20208", category: "site", label: "Phone" },
  { key: "site.email", value: "stay@guruvayurdham.com", category: "site", label: "Email" },
  { key: "site.address", value: "Opposite. Mata Pathwari Mandir, Natwar Nagar, Dholi Pyau, Mathura, Uttar Pradesh 281001", category: "site", label: "Address" },
  { key: "hero.headline", value: "Stay Near the Divine", category: "hero", label: "Hero Headline" },
  { key: "hero.subheadline", value: "Clean AC & non-AC rooms, 24x7 hot water, family-friendly. Book in 30 seconds.", category: "hero", label: "Hero Subheadline" },
];

const STAFF = [
  { name: "Krishnan Warrier", email: "manager@guruvayurdham.com", phone: "+91-90908 20208", role: "MANAGER", pin: "1234" },
  { name: "Lakshmi Pillai", email: "reception@guruvayurdham.com", phone: "+91 99876 54321", role: "RECEPTIONIST", pin: "2345" },
  { name: "Ravi Menon", email: "housekeeping@guruvayurdham.com", phone: "+91 90123 45678", role: "HOUSEKEEPING", pin: "3456" },
  { name: "Saritha Nair", email: "accounts@guruvayurdham.com", phone: "+91 91234 56789", role: "ACCOUNTANT", pin: "4567" },
];

const COUPONS = [
  { code: "EARLYBIRD10", description: "10% off for bookings 30+ days ahead", type: "PERCENTAGE", value: 10, maxDiscount: 500, minBooking: 1000, usageLimit: 100, validFrom: new Date("2026-01-01"), validTo: new Date("2026-12-31") },
  { code: "RETURN15", description: "15% off for returning guests", type: "PERCENTAGE", value: 15, maxDiscount: 700, minBooking: 1000, usageLimit: 0, validFrom: new Date("2026-01-01"), validTo: new Date("2026-12-31") },
  { code: "WEEKDAY5", description: "5% off Mon-Thu", type: "PERCENTAGE", value: 5, maxDiscount: 200, minBooking: 700, usageLimit: 0, validFrom: new Date("2026-01-01"), validTo: new Date("2026-12-31") },
];

const PRICING_RULES = [
  { name: "Weekend Surge", type: "WEEKEND", multiplier: 1.3, dayOfWeek: "5,6", priority: 10 },
  { name: "Early Bird (30+ days)", type: "EARLY_BIRD", multiplier: 0.9, priority: 7 },
  { name: "Last-Minute (same day)", type: "LAST_MINUTE", multiplier: 0.85, priority: 5 },
];

const MENU_ITEMS = [
  { name: "Idli Sambar (2 pcs)", description: "Steamed rice cakes with lentil sambar", price: 40, category: "BREAKFAST", veg: true, prepTime: 10 },
  { name: "Masala Dosa", description: "Crispy rice crepe with potato masala", price: 70, category: "BREAKFAST", veg: true, prepTime: 12 },
  { name: "Filter Coffee", description: "South Indian filter coffee", price: 25, category: "BEVERAGES", veg: true, prepTime: 5 },
  { name: "Veg Meals (Thali)", description: "Rice, 3 curries, sambar, rasam, curd", price: 120, category: "LUNCH", veg: true, prepTime: 15 },
  { name: "Veg Biryani", description: "Fragrant basmati with vegetables", price: 130, category: "DINNER", veg: true, prepTime: 20 },
  { name: "Mineral Water 1L", description: "Bottled water", price: 20, category: "BEVERAGES", veg: true, prepTime: 1 },
];

const INFLUENCERS_PARTNERS = [
  { code: "BOOKING_COM", name: "Booking.com", category: "OTA", apiEndpoint: "https://supply-xml.booking.com" },
  { code: "MAKEMYTRIP", name: "MakeMyTrip", category: "OTA", apiEndpoint: "https://api.makemytrip.com" },
  { code: "GOIBIBO", name: "Goibibo", category: "OTA", apiEndpoint: "https://api.goibibo.com" },
  { code: "AGODA", name: "Agoda", category: "OTA", apiEndpoint: "https://api.agoda.com" },
  { code: "RAZORPAY", name: "Razorpay", category: "PAYMENT", apiEndpoint: "https://api.razorpay.com" },
  { code: "WHATSAPP_BUSINESS", name: "WhatsApp Business API", category: "MESSAGING", apiEndpoint: "https://graph.facebook.com/v18.0" },
  { code: "HOSTINGER", name: "Hostinger", category: "HOSTING", apiEndpoint: "https://api.hostinger.com" },
  { code: "VERCEL", name: "Vercel", category: "HOSTING", apiEndpoint: "https://api.vercel.com" },
  { code: "TWILIO", name: "Twilio (SMS/WhatsApp)", category: "MESSAGING", apiEndpoint: "https://api.twilio.com" },
  { code: "MSG91", name: "MSG91 (SMS India)", category: "MESSAGING", apiEndpoint: "https://api.msg91.com" },
  { code: "PAYU", name: "PayU India", category: "PAYMENT", apiEndpoint: "https://api.payu.in" },
  { code: "GOOGLE_HOTELS", name: "Google Hotels", category: "OTA", apiEndpoint: "https://hotels.google.com" },
  { code: "STAAH", name: "STAAH Channel Manager", category: "CHANNEL_MANAGER", apiEndpoint: "https://api.staah.com" },
  { code: "SITEMINDER", name: "SiteMinder", category: "CHANNEL_MANAGER", apiEndpoint: "https://api.siteminder.com" },
  { code: "AIRBNB", name: "Airbnb", category: "OTA", apiEndpoint: "https://api.airbnb.com" },
  { code: "EXPEDIA", name: "Expedia", category: "OTA", apiEndpoint: "https://api.expedia.com" },
  { code: "YATRA", name: "Yatra", category: "OTA", apiEndpoint: "https://api.yatra.com" },
  { code: "CLEARTRIP", name: "Cleartrip", category: "OTA", apiEndpoint: "https://api.cleartrip.com" },
  { code: "EASEMYTRIP", name: "EaseMyTrip", category: "OTA", apiEndpoint: "https://api.easemytrip.com" },
  { code: "GOOGLE_ANALYTICS", name: "Google Analytics 4", category: "ANALYTICS", apiEndpoint: "https://analyticsreporting.googleapis.com" },
  { code: "SENDGRID", name: "SendGrid", category: "EMAIL", apiEndpoint: "https://api.sendgrid.com" },
  { code: "TRIPADVISOR", name: "TripAdvisor", category: "OTA", apiEndpoint: "https://api.tripadvisor.com" },
];

async function main() {
  console.log("🌱 Seeding Neon PostgreSQL...");

  // Rooms
  for (const r of ROOMS) {
    await db.room.upsert({
      where: { slug: r.slug },
      create: {
        slug: r.slug, name: r.name, type: r.type, price: r.price,
        originalPrice: r.originalPrice ?? null, rating: r.rating, reviews: r.reviews,
        capacity: r.capacity, size: r.size, bedType: r.bedType, image: r.image,
        gallery: JSON.stringify(r.gallery), badge: r.badge ?? null,
        description: r.description, shortDesc: r.shortDesc,
        amenities: JSON.stringify(r.amenities),
        totalUnits: r.type === "Family" ? 4 : r.type === "Deluxe" ? 6 : r.slug === "non-ac-room" ? 18 : r.slug === "ac-dormitory" ? 8 : 10,
      },
      update: {},
    });
  }
  console.log(`✓ ${ROOMS.length} rooms`);

  // Channels
  for (const c of CHANNELS) {
    await db.channelPartner.upsert({ where: { code: c.code }, create: c, update: {} });
  }
  console.log(`✓ ${CHANNELS.length} channels`);

  // Content blocks
  for (const b of CONTENT_BLOCKS) {
    await db.contentBlock.upsert({ where: { key: b.key }, create: b, update: { value: b.value } });
  }
  console.log(`✓ ${CONTENT_BLOCKS.length} content blocks`);

  // Staff
  for (const s of STAFF) {
    await db.staffUser.upsert({ where: { email: s.email }, create: s, update: {} });
  }
  console.log(`✓ ${STAFF.length} staff users`);

  // Coupons
  for (const c of COUPONS) {
    await db.coupon.upsert({ where: { code: c.code }, create: c as any, update: {} });
  }
  console.log(`✓ ${COUPONS.length} coupons`);

  // Pricing rules
  for (const r of PRICING_RULES) {
    await db.dynamicPricingRule.create({ data: r as any });
  }
  console.log(`✓ ${PRICING_RULES.length} pricing rules`);

  // Menu items
  for (const m of MENU_ITEMS) {
    await db.menuItem.create({ data: m });
  }
  console.log(`✓ ${MENU_ITEMS.length} menu items`);

  // Availability (90 days)
  const rooms = await db.room.findMany();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (const room of rooms) {
    for (let i = 0; i < 30; i++) { // 30 days for faster seed
      const date = new Date(today); date.setDate(date.getDate() + i);
      const day = date.getDay();
      let available = room.totalUnits;
      if (day === 5 || day === 6) available = Math.max(0, room.totalUnits - Math.floor(Math.random() * 3) - 1);
      else if (Math.random() > 0.8) available = Math.max(0, room.totalUnits - 1);
      await db.availability.upsert({
        where: { roomId_date: { roomId: room.id, date } },
        create: { roomId: room.id, date, available },
        update: {},
      });
    }
  }
  console.log(`✓ Availability (30 days × ${rooms.length} rooms)`);

  // Channel configs
  for (const p of INFLUENCERS_PARTNERS) {
    await db.channelConfig.upsert({
      where: { code: p.code },
      create: { ...p, connected: false },
      update: {},
    });
  }
  console.log(`✓ ${INFLUENCERS_PARTNERS.length} channel configs`);

  // Blog posts
  for (const p of BLOG_POSTS) {
    await db.blogPost.upsert({
      where: { slug: p.slug },
      create: { slug: p.slug, title: p.title, excerpt: p.excerpt, category: p.category, readTime: p.readTime, date: p.date, image: p.image, content: JSON.stringify(p.content) },
      update: {},
    });
  }
  console.log(`✓ ${BLOG_POSTS.length} blog posts`);

  // Demo bookings
  const demoBookings = [
    { guestName: "Anand Krishnan", guestPhone: "+91-90908 20208", source: "BOOKING_COM", channelBookingId: "BC-887412", nights: 2, guests: 2, roomSlug: "deluxe-ac-room", offsetDays: 3 },
    { guestName: "Rajesh Menon", guestPhone: "+91 90123 45678", source: "WALKIN", nights: 1, guests: 2, roomSlug: "non-ac-room", offsetDays: 1 },
    { guestName: "Sunita Nair", guestPhone: "+91 91234 56789", source: "DIRECT", nights: 2, guests: 2, roomSlug: "standard-ac-room", offsetDays: 7 },
  ];
  for (const b of demoBookings) {
    const room = await db.room.findUnique({ where: { slug: b.roomSlug } });
    if (!room) continue;
    const checkIn = new Date(today); checkIn.setDate(checkIn.getDate() + b.offsetDays);
    const checkOut = new Date(checkIn); checkOut.setDate(checkOut.getDate() + b.nights);
    const ref = "GD-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    await db.booking.create({
      data: { reference: ref, roomId: room.id, guestName: b.guestName, guestPhone: b.guestPhone, checkIn, checkOut, nights: b.nights, guests: b.guests, amount: room.price * b.nights, source: b.source, channelBookingId: b.channelBookingId || null, status: "CONFIRMED" },
    });
  }
  console.log(`✓ ${demoBookings.length} demo bookings`);

  // Reviews
  const demoReviews = [
    { authorName: "Anand Krishnan", rating: 5, text: "Stayed for two nights during Ekadasi. The room was spotless, the staff arranged our 3 AM Nirmalya Darshan slot. Will come back every year.", reviewDate: new Date("2026-08-15"), source: "GOOGLE", googleReviewId: "r1", published: true, featured: true },
    { authorName: "Lakshmi Pillai", rating: 5, text: "Travelled with my 70-year-old mother and two kids. The Family Suite gave us all space, the elevator worked. Felt like staying with relatives.", reviewDate: new Date("2026-07-22"), source: "GOOGLE", googleReviewId: "r2", published: true, featured: true },
    { authorName: "Rajesh Menon", rating: 5, text: "Booked the budget non-AC room for ₹700. Clean, hot water 24x7, location unbeatable. Free chai at 6 AM was a sweet surprise.", reviewDate: new Date("2026-07-10"), source: "GOOGLE", googleReviewId: "r3", published: true, featured: true },
  ];
  for (const r of demoReviews) {
    await db.review.create({ data: r as any });
  }
  console.log(`✓ ${demoReviews.length} reviews`);

  console.log("\n✅ Neon DB seed complete!");
  await db.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
