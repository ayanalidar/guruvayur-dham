/**
 * Seed script — populates DB from existing site-data.ts mock content.
 * Run: bun run /home/z/my-project/scripts/seed.ts
 */
import { PrismaClient } from "@prisma/client";
import {
  ROOMS,
} from "../src/lib/site-data";

const db = new PrismaClient();

const CHANNELS = [
  { code: "BOOKING_COM", name: "Booking.com", logo: "booking", webhookUrl: "/api/channel/booking-com", apiEndpoint: "/api/channel/booking-com/inbox" },
  { code: "MAKEMYTRIP", name: "MakeMyTrip", logo: "mmt", webhookUrl: "/api/channel/makemytrip", apiEndpoint: "/api/channel/makemytrip/inbox" },
  { code: "GOIBIBO", name: "Goibibo", logo: "goibibo", webhookUrl: "/api/channel/goibibo", apiEndpoint: "/api/channel/goibibo/inbox" },
  { code: "AGODA", name: "Agoda", logo: "agoda", webhookUrl: "/api/channel/agoda", apiEndpoint: "/api/channel/agoda/inbox" },
];

const CONTENT_BLOCKS: Array<{ key: string; value: string; category: string; label: string }> = [
  { key: "site.name", value: "Guruvayur Dham", category: "site", label: "Site Name" },
  { key: "site.tagline", value: "Stay 2 Minutes from the Divine", category: "site", label: "Tagline" },
  { key: "site.phone", value: "+91 98765 43210", category: "site", label: "Phone" },
  { key: "site.email", value: "stay@guruvayurdham.com", category: "site", label: "Email" },
  { key: "site.address", value: "East Nada Road, Near Guruvayur Temple, Guruvayur, Kerala 680101", category: "site", label: "Address" },
  { key: "site.checkIn", value: "12:00 PM", category: "site", label: "Check-in Time" },
  { key: "site.checkOut", value: "11:00 AM", category: "site", label: "Check-out Time" },
  { key: "site.rating", value: "4.9", category: "site", label: "Rating" },
  { key: "site.reviewCount", value: "847", category: "site", label: "Review Count" },
  { key: "site.totalRooms", value: "52", category: "site", label: "Total Rooms" },
  { key: "site.distanceToTemple", value: "2 min walk to East Nada", category: "site", label: "Distance to Temple" },
  { key: "hero.eyebrow", value: "Stay · Pooja · Blessing · Since 1998", category: "hero", label: "Hero Eyebrow" },
  { key: "hero.headline", value: "Stay 2 Minutes from Guruvayur Temple", category: "hero", label: "Hero Headline" },
  { key: "hero.headlineHighlight", value: "Guruvayur Temple", category: "hero", label: "Hero Headline Highlight (gold foil)" },
  { key: "hero.subheadline", value: "Cinematic dark-luxe rooms, 24×7 hot water, family-friendly. Walk to East Nada for Nirmalya Darshan. Book in 30 seconds — no booking fee, instant WhatsApp confirmation.", category: "hero", label: "Hero Subheadline" },
  { key: "whyChooseUs.eyebrow", value: "Why Pilgrims Choose Us", category: "whyChooseUs", label: "Why Us Eyebrow" },
  { key: "whyChooseUs.title", value: "More Than a Stay — A Pilgrim Companion", category: "whyChooseUs", label: "Why Us Title" },
  { key: "whyChooseUs.subtitle", value: "We've hosted over 50,000 devotees since 1998. Every detail — from 24×7 hot water to free temple darshan guidance — is designed around what a pilgrim actually needs.", category: "whyChooseUs", label: "Why Us Subtitle" },
  { key: "rooms.eyebrow", value: "Rooms & Suites", category: "rooms", label: "Rooms Eyebrow" },
  { key: "rooms.title", value: "Cinematic Dark-Luxe Rooms", category: "rooms", label: "Rooms Title" },
  { key: "rooms.subtitle", value: "From ₹700/night budget rooms to ₹3,500 family suites — every option is sanitised daily and a 2-minute walk from East Nada.", category: "rooms", label: "Rooms Subtitle" },
  { key: "pooja.eyebrow", value: "Pooja & Offerings", category: "pooja", label: "Pooja Eyebrow" },
  { key: "pooja.title", value: "Guruvayur Pooja Booking — Palpayasam, Thulabharam & More", category: "pooja", label: "Pooja Title" },
  { key: "pooja.subtitle", value: "Book any temple pooja through Guruvayur Dham at the official temple rate — zero commission, zero waiting in queue.", category: "pooja", label: "Pooja Subtitle" },
  { key: "about.eyebrow", value: "About Guruvayur Dham", category: "about", label: "About Eyebrow" },
  { key: "about.title", value: "A Family-Run Pilgrim Home Since 1998", category: "about", label: "About Title" },
  { key: "about.story", value: "Guruvayur Dham began as a small four-room lodge in 1998, when our grandfather Shri Krishna Warrier — himself a daily devotee at the temple — noticed that pilgrims arriving from distant states had nowhere clean, affordable, and walking-distance to stay. What started as a single rented house has, over 25 years and three generations, grown into a 52-room property that has welcomed over 50,000 devotees from across India and the diaspora.\n\nWe are not a hotel — we are a pilgrim home. Every decision, from the 3 AM reception shift during Nirmalya darshan to the complimentary chai service before temple visits, is made with the devotee in mind. Our pooja-booking coordinator works directly with the temple tantri's office to secure your slots, and our housekeeping team inspects every room against a 22-point checklist before check-in.\n\nOur mission is simple: to make every pilgrim's Guruvayur visit spiritually fulfilling, physically comfortable, and logistically effortless. Whether you're a solo traveller on a quick darshan trip or a multi-generational family here for a child's Choroonu ceremony, you'll find a warm welcome, honest pricing, and the kind of personal care that only a family-run home can offer.", category: "about", label: "About Story" },
  { key: "contact.eyebrow", value: "Get in Touch", category: "contact", label: "Contact Eyebrow" },
  { key: "contact.title", value: "Book Your Stay or Ask Anything", category: "contact", label: "Contact Title" },
  { key: "contact.subtitle", value: "Fill the form below and we'll WhatsApp you back within minutes — or reach us directly through any of the channels here.", category: "contact", label: "Contact Subtitle" },
  { key: "footer.ctaHeadline", value: "Ready for Divine Comfort, 2 Minutes from the Temple?", category: "footer", label: "Footer CTA Headline" },
  { key: "footer.ctaSubtitle", value: "Book your room on WhatsApp in 30 seconds. Real-time availability, instant confirmation, and zero booking fee.", category: "footer", label: "Footer CTA Subtitle" },
];

async function seed() {
  console.log("🌱 Seeding database...");

  for (const r of ROOMS) {
    await db.room.upsert({
      where: { slug: r.slug },
      create: {
        slug: r.slug,
        name: r.name,
        type: r.type,
        price: r.price,
        originalPrice: r.originalPrice ?? null,
        rating: r.rating,
        reviews: r.reviews,
        capacity: r.capacity,
        size: r.size,
        bedType: r.bedType,
        image: r.image,
        gallery: JSON.stringify(r.gallery),
        badge: r.badge ?? null,
        description: r.description,
        shortDesc: r.shortDesc,
        amenities: JSON.stringify(r.amenities),
        totalUnits: r.type === "Family" ? 4 : r.type === "Deluxe" ? 6 : r.slug === "non-ac-room" ? 18 : r.slug === "ac-dormitory" ? 8 : 10,
      },
      update: {},
    });
  }
  console.log(`✓ ${ROOMS.length} rooms seeded`);

  for (const c of CHANNELS) {
    await db.channelPartner.upsert({
      where: { code: c.code },
      create: c,
      update: {},
    });
  }
  console.log(`✓ ${CHANNELS.length} channel partners seeded`);

  const rooms = await db.room.findMany();
  for (const room of rooms) {
    for (const c of CHANNELS) {
      const modifier = c.code === "BOOKING_COM" ? 1.18 : c.code === "MAKEMYTRIP" ? 1.15 : c.code === "GOIBIBO" ? 1.12 : 1.10;
      await db.ratePlan.upsert({
        where: { roomId_channelPartner: { roomId: room.id, channelPartner: c.code } },
        create: { roomId: room.id, channelPartner: c.code, priceModifier: modifier },
        update: {},
      });
    }
    await db.ratePlan.upsert({
      where: { roomId_channelPartner: { roomId: room.id, channelPartner: "DIRECT" } },
      create: { roomId: room.id, channelPartner: "DIRECT", priceModifier: 1.0 },
      update: {},
    });
  }
  console.log(`✓ Rate plans seeded (${rooms.length * (CHANNELS.length + 1)})`);

  for (const b of CONTENT_BLOCKS) {
    await db.contentBlock.upsert({
      where: { key: b.key },
      create: b,
      update: { value: b.value },
    });
  }
  console.log(`✓ ${CONTENT_BLOCKS.length} content blocks seeded`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (const room of rooms) {
    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
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
  console.log(`✓ Availability initialized for 90 days × ${rooms.length} rooms`);

  const demoBookings = [
    { guestName: "Anand Krishnan", guestPhone: "+91 98765 43210", source: "BOOKING_COM", channelBookingId: "BC-887412", nights: 2, guests: 2, roomSlug: "deluxe-ac-room", offsetDays: 3 },
    { guestName: "Lakshmi Pillai", guestPhone: "+91 99876 54321", source: "MAKEMYTRIP", channelBookingId: "MMT-552103", nights: 3, guests: 4, roomSlug: "family-suite-ac", offsetDays: 5 },
    { guestName: "Rajesh Menon", guestPhone: "+91 90123 45678", source: "WALKIN", nights: 1, guests: 2, roomSlug: "non-ac-room", offsetDays: 1 },
    { guestName: "Sunita Nair", guestPhone: "+91 91234 56789", source: "DIRECT", nights: 2, guests: 2, roomSlug: "standard-ac-room", offsetDays: 7 },
    { guestName: "Vinod Sharma", guestPhone: "+91 93456 78901", source: "GOIBIBO", channelBookingId: "GI-339871", nights: 1, guests: 2, roomSlug: "deluxe-non-ac", offsetDays: 4 },
  ];

  for (const b of demoBookings) {
    const room = await db.room.findUnique({ where: { slug: b.roomSlug } });
    if (!room) continue;
    const checkIn = new Date(today);
    checkIn.setDate(checkIn.getDate() + b.offsetDays);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + b.nights);
    const ref = "GD-" + Math.random().toString(36).slice(2, 8).toUpperCase();

    const booking = await db.booking.create({
      data: {
        reference: ref,
        roomId: room.id,
        guestName: b.guestName,
        guestPhone: b.guestPhone,
        checkIn,
        checkOut,
        nights: b.nights,
        guests: b.guests,
        amount: room.price * b.nights,
        source: b.source,
        channelBookingId: b.channelBookingId,
        status: "CONFIRMED",
      },
    });

    for (let i = 0; i < b.nights; i++) {
      const d = new Date(checkIn);
      d.setDate(d.getDate() + i);
      await db.availability.updateMany({
        where: { roomId: room.id, date: d },
        data: { available: { decrement: 1 } },
      });
    }

    if (b.source !== "DIRECT" && b.source !== "WALKIN") {
      const otherChannels = CHANNELS.filter((c) => c.code !== b.source).map((c) => c.code);
      for (const ch of otherChannels) {
        await db.syncLog.create({
          data: {
            bookingId: booking.id,
            channel: ch,
            action: "BLOCK",
            status: "SUCCESS",
            message: `Room blocked for ${b.guestName} (${ref}) — sync from ${b.source}`,
            payload: JSON.stringify({ reference: ref, checkIn, checkOut, roomSlug: b.roomSlug }),
          },
        });
      }
    }
  }
  console.log(`✓ ${demoBookings.length} demo bookings seeded with sync logs`);

  console.log("\n✅ Seed complete!");
  console.log("\n📋 Admin: visit /#/admin");
  await db.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
