/**
 * SEO Pages — Phase 4 (6 additional pages)
 *
 * All Phase 4 pages are Mathura-specific (no Kerala references). They
 * reference Guruvayur Dham as a 16-room premium stay in Mathura, 2 min
 * from Mathura Station, near Mata Pathwari Mandir.
 *
 * Pages:
 *   1. hotels-near-banke-bihari-temple-vrindavan — Banke Bihari pilgrims
 *   2. hotels-near-pre-mandir-vrindavan          — Prem Mandir visitors
 *   3. hotels-near-radha-rani-mandir-barsana     — Radha Rani pilgrims
 *   4. hotels-near-gowardhan-hill                — Gowardhan parikrama
 *   5. janmashtami-2026-mathura-hotel-booking    — Janmashtami 2026 booking
 *   6. holi-2026-mathura-accommodation           — Holi 2026 accommodation
 *
 * Routing: these pages are auto-routed by src/app/page.tsx because the
 * router checks `SEO_PAGE_SLUGS.includes(path)` and ALL_PHASE4_PAGES is
 * merged into ALL_SEO_PAGES in seo-pages.ts. No new route entries needed.
 *
 * Editing: pages are static (not CMS-editable) — admins who want to tweak
 * content can edit this file or use the Phase 1-3 pages which ARE
 * CMS-driven.
 */
import type { SEOPage } from "./seo-pages";

export const SEO_PAGES_PHASE4: SEOPage[] = [
  // ─────────────────────────────────────────────────────────────────────
  // 1. Hotels near Banke Bihari Temple, Vrindavan
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "hotels-near-banke-bihari-temple-vrindavan",
    category: "hotels-near" as any,
    navLabel: "Near Banke Bihari",
    title: "Hotels Near Banke Bihari Temple Vrindavan - Stay at Guruvayur Dham Mathura",
    metaDescription:
      "Hotels near Banke Bihari Temple Vrindavan. Guruvayur Dham Mathura — 16 premium rooms, 2 min from Mathura Station, 15 min drive to Banke Bihari. AC rooms from Rs 1,500/night.",
    heroImage:
      "https://images.unsplash.com/photo-1604608672516-f1b9b1d37076?w=1920&h=1080&fit=crop",
    jsonLdType: "TouristAttraction",
    eyebrow: "Hotels Near · Banke Bihari Temple",
    intro: [
      "Banke Bihari Temple in Vrindavan is one of the most revered Krishna temples in India. Devotees travel from across the country for a glimpse of Thakurji (the deity of Banke Bihari), whose darshan is uniquely held behind a curtain that is opened and closed every few minutes — a tradition found nowhere else in the Braj region. If you are planning a pilgrimage to Banke Bihari, your choice of accommodation matters: Vrindavan hotels are often basic and overpriced during festivals, while staying in Mathura gives you a quieter, cleaner base with easy access to both Banke Bihari and other major temples.",
      "Guruvayur Dham is a 16-room premium stay in Mathura, located 2 minutes from Mathura Railway Station and adjacent to Mata Pathwari Mandir in Natwar Nagar. From here, Banke Bihari Temple is a 15-km, 25-minute drive — easy to time around darshan hours, and easy to return to for a relaxed meal and rest. Our rooms are sanitised daily, with 24×7 hot water, attached bathrooms, free WiFi, and pure-veg restaurant tie-ups within 200 m.",
      "We coordinate darshan slots, pooja bookings and local transport for our guests. Whether you're a solo pilgrim arriving by train, a family doing the Braj circuit, or a couple visiting for the first time, Guruvayur Dham gives you a clean, honest, premium base for your Banke Bihari pilgrimage — at straightforward Mathura pricing, not inflated Vrindavan tourist rates.",
    ],
    sections: [
      {
        heading: "Banke Bihari Temple Darshan Timings & Travel from Mathura",
        body: [
          "Banke Bihari Temple is open daily for three darshan slots: morning (7:45 AM - 12:00 PM in summer, 8:00 AM - 12:00 PM in winter), afternoon (5:30 PM - 9:30 PM in summer, 4:30 PM - 8:30 PM in winter), and special Mangala Aarti on certain festive days. The curtain darshan is unique to this temple — be prepared to wait for short bursts of darshan between curtain closings.",
          "From Guruvayur Dham in Mathura, the drive to Banke Bihari takes 25 minutes by auto (Rs 200-300 one way) or 20 minutes by cab (Rs 400-600). We arrange reliable drivers and can time your visit to avoid peak crowds. Early morning (8 AM) darshan is the most peaceful; weekends and festival days are very crowded.",
        ],
      },
      {
        heading: "Why Stay in Mathura Instead of Vrindavan",
        body: [
          "Many pilgrims assume they must stay in Vrindavan to visit Banke Bihari. In practice, Mathura is the better base for most travellers: it has direct train connectivity from Delhi, Mumbai, Agra and Varanasi (Vrindavan has no railway station — the nearest is Mathura Junction). Mathura hotels also have a wider range of room types and more honest pricing, especially during peak festival seasons when Vrindavan rates surge 3-4x.",
          "Staying at Guruvayur Dham in Mathura means you can do a one-day Vrindavan circuit (Banke Bihari morning → Prem Mandir afternoon → ISKCON evening aarti) and return to a quiet, spacious room with proper amenities. We also coordinate Vrindavan temple poojas from Mathura at zero commission.",
        ],
      },
      {
        heading: "Room Options at Guruvayur Dham",
        body: [
          "We offer four room categories — Deluxe Room (Rs 1,500/night, king bed, 240 sq.ft), Super Deluxe Room (Rs 2,200/night, king + sofa bed, 320 sq.ft), Superior Room (Rs 2,800/night, two king beds, 400 sq.ft — ideal for families), and our signature GVD Suite (Rs 3,500/night, separate living room, 520 sq.ft, complimentary breakfast and welcome tea). All rooms are air-conditioned with attached bathrooms, 24×7 hot water, power backup, free WiFi, and free parking.",
          "Book at least 30-60 days in advance during Janmashtami, Holi, Radhashtami, and Kartik Purnima — Mathura sells out completely. Use the booking page on this site for instant confirmation, or WhatsApp +91-90908 20208 for assistance with darshan slots, early check-in, and local transport.",
        ],
      },
    ],
    faqs: [
      { q: "How far is Guruvayur Dham from Banke Bihari Temple?", a: "Guruvayur Dham in Mathura is 15 km (25-minute drive) from Banke Bihari Temple in Vrindavan. Auto Rs 200-300 one way, cab Rs 400-600. We arrange reliable drivers." },
      { q: "What are Banke Bihari Temple timings?", a: "Banke Bihari darshan: 7:45 AM - 12:00 PM and 5:30 PM - 9:30 PM (summer). 8:00 AM - 12:00 PM and 4:30 PM - 8:30 PM (winter). Mangala Aarti on festive days." },
      { q: "Should I stay in Vrindavan or Mathura for Banke Bihari?", a: "Stay in Mathura — it has direct train connectivity, better room quality, and honest pricing. Vrindavan has no railway station; you'll need to come via Mathura Junction anyway. Guruvayur Dham is 2 min from Mathura Station." },
      { q: "Do you arrange Banke Bihari pooja bookings?", a: "Yes. We coordinate Banke Bihari aarti, Abhishek, and Shringar darshan bookings at zero commission — you pay the official temple rate. WhatsApp +91-90908 20208 with your request." },
      { q: "What is the best time to visit Banke Bihari?", a: "October-March (cool weather). For darshan, early morning (8 AM) is most peaceful. Avoid weekends and Janmashtami/Holi unless booked 60+ days ahead." },
    ],
    ctaHeadline: "Stay Near Banke Bihari - Premium Rooms in Mathura from Rs 1,500/Night",
  },

  // ─────────────────────────────────────────────────────────────────────
  // 2. Hotels near Prem Mandir, Vrindavan
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "hotels-near-pre-mandir-vrindavan",
    category: "hotels-near" as any,
    navLabel: "Near Prem Mandir",
    title: "Hotels Near Prem Mandir Vrindavan - Guruvayur Dham Mathura 15 Min Away",
    metaDescription:
      "Hotels near Prem Mandir Vrindavan. Guruvayur Dham Mathura — 16 premium AC rooms, 15 min drive to Prem Mandir, 2 min from Mathura Station. Rooms from Rs 1,500/night.",
    heroImage:
      "https://images.unsplash.com/photo-1604608672516-f1b9b1d37076?w=1920&h=1080&fit=crop",
    jsonLdType: "TouristAttraction",
    eyebrow: "Hotels Near · Prem Mandir",
    intro: [
      "Prem Mandir in Vrindavan is one of the most beautiful temples in the Braj region — a stunning white marble structure built by Jagadguru Kripalu Maharaj, depicting scenes from Krishna's pastimes through intricate carvings and life-size dioramas. The evening light-and-sound show, with the temple illuminated in soft colours against the night sky, is a must-see. For pilgrims visiting Prem Mandir, the practical question is where to stay: Vrindavan hotels are basic and costly, while Mathura offers better-quality rooms at honest prices with quick access to Prem Mandir.",
      "Guruvayur Dham is a 16-room premium stay in Mathura, located 2 minutes from Mathura Railway Station and adjacent to Mata Pathwari Mandir in Natwar Nagar. From here, Prem Mandir in Vrindavan is a 15-km, 25-minute drive — easy to time around the evening light show, and easy to return to for a relaxed dinner. Our rooms are air-conditioned with 24×7 hot water, attached bathrooms, free WiFi, and free parking.",
      "We coordinate local transport, pooja bookings, and darshan assistance for Prem Mandir and other Vrindavan temples. Whether you're travelling solo, as a couple, or with family, Guruvayur Dham gives you a clean, premium, well-connected base for your Prem Mandir pilgrimage — at Mathura rates, not Vrindavan tourist rates.",
    ],
    sections: [
      {
        heading: "Prem Mandir Timings, Light Show & Travel from Mathura",
        body: [
          "Prem Mandir is open daily from 8:30 AM to 8:30 PM (with a 12:00 PM - 4:00 PM break for shrine cleaning). The famous evening light-and-sound show starts around 6:30 PM (varies seasonally) and runs for 30-45 minutes, with the temple illuminated against the night sky. Entry is free; photography is allowed outside the main shrine.",
          "From Guruvayur Dham in Mathura, the drive to Prem Mandir takes 25 minutes by auto (Rs 250-300 one way) or 20 minutes by cab (Rs 400-600). We recommend leaving Mathura by 5:30 PM for the evening show. Many of our guests combine Prem Mandir (evening) with Banke Bihari (morning) and ISKCON (afternoon) in a single Vrindavan day-circuit.",
        ],
      },
      {
        heading: "Staying in Mathura vs Vrindavan",
        body: [
          "Vrindavan has no railway station. The nearest railhead is Mathura Junction, just 2 minutes from Guruvayur Dham. If you're arriving by train from Delhi, Agra, Mumbai, or Varanasi, Mathura is the natural base. Vrindavan hotels are also smaller, older, and pricier — especially during festival seasons when rates surge 3-4x.",
          "Mathura hotels offer larger rooms, more amenities, and more consistent quality. Guruvayur Dham gives you 16 premium rooms with daily housekeeping, 24×7 hot water, power backup, free parking, and pure-veg restaurant tie-ups within 200 m — plus easy walk-out access to Mata Pathwari Mandir (next door) and Krishna Janmabhoomi (1.5 km).",
        ],
      },
      {
        heading: "Room Options & Booking",
        body: [
          "We offer four room categories: Deluxe (Rs 1,500/night, king bed), Super Deluxe (Rs 2,200/night, king + sofa bed), Superior (Rs 2,800/night, two king beds — great for families), and GVD Suite (Rs 3,500/night, separate living room, complimentary breakfast). All rooms are AC with attached bathrooms, free WiFi, and free parking.",
          "Book 30-60 days ahead during Janmashtami, Holi, and Kartik Purnima. Use the booking page on this site for instant confirmation, or WhatsApp +91-90908 20208 for assistance with Prem Mandir visit timing, Vrindavan transport, and combined Banke Bihari + Prem Mandir + ISKCON day-tour arrangements.",
        ],
      },
    ],
    faqs: [
      { q: "How far is Guruvayur Dham from Prem Mandir Vrindavan?", a: "Guruvayur Dham in Mathura is 15 km (25-minute drive) from Prem Mandir in Vrindavan. Auto Rs 250-300, cab Rs 400-600. We can arrange reliable drivers." },
      { q: "What are Prem Mandir timings?", a: "Prem Mandir is open 8:30 AM - 8:30 PM (closed 12:00 PM - 4:00 PM for shrine cleaning). Evening light-and-sound show starts around 6:30 PM. Entry free. Photography allowed outside main shrine." },
      { q: "Can I cover Prem Mandir and Banke Bihari in one day?", a: "Yes. Morning Banke Bihari (8 AM darshan), afternoon ISKCON (1-4 PM), evening Prem Mandir (5:30 PM onwards for light show). Guruvayur Dham arranges this as a Vrindavan day-circuit." },
      { q: "Where should I stay for Prem Mandir visit?", a: "Stay in Mathura, not Vrindavan. Vrindavan has no railway station — you'll arrive via Mathura Junction anyway. Guruvayur Dham is 2 min from Mathura Station with premium AC rooms from Rs 1,500/night." },
      { q: "Is photography allowed inside Prem Mandir?", a: "Photography is allowed in the outer complex and the gardens, but not inside the main shrine. The evening light show is best photographed from the main courtyard." },
    ],
    ctaHeadline: "Stay Near Prem Mandir - Guruvayur Dham Mathura, 25 Min Drive",
  },

  // ─────────────────────────────────────────────────────────────────────
  // 3. Hotels near Radha Rani Mandir, Barsana
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "hotels-near-radha-rani-mandir-barsana",
    category: "hotels-near" as any,
    navLabel: "Near Radha Rani Mandir",
    title: "Hotels Near Radha Rani Mandir Barsana - Stay at Guruvayur Dham Mathura",
    metaDescription:
      "Hotels near Radha Rani Mandir Barsana. Guruvayur Dham Mathura — 16 premium AC rooms, 1-hour drive to Radha Rani Temple, 2 min from Mathura Station. Rooms from Rs 1,500/night.",
    heroImage:
      "https://images.unsplash.com/photo-1604608672516-f1b9b1d37076?w=1920&h=1080&fit=crop",
    jsonLdType: "TouristAttraction",
    eyebrow: "Hotels Near · Radha Rani Mandir Barsana",
    intro: [
      "The Radha Rani Temple in Barsana — also known as the Ladli Lal Temple — is the only temple in India dedicated exclusively to Radha, the eternal consort of Lord Krishna. Perched atop Bhanugarh Hill, it marks the spot of Radha's birthplace. Pilgrims climb approximately 200 steps to reach the temple, where the deities of Radha and Krishna (Ladli Lal) are adorned with fresh flower garlands daily. The view from the top — rolling Braj countryside in every direction — is among the most spiritually charged in the entire region.",
      "Barsana is 40 km from Mathura (1-hour drive). Hotels in Barsana itself are extremely basic — most pilgrims prefer to stay in Mathura and do a day-trip. Guruvayur Dham in Mathura is the ideal base: 16 premium AC rooms, 2 minutes from Mathura Railway Station, with reliable car-and-guide arrangements for the Barsana circuit. We coordinate the full day-trip — pickup, transport, temple visits, and return — at straightforward Mathura pricing.",
      "Barsana is most famous for Lathmar Holi (typically 7-8 days before main Holi), when women playfully chase men with sticks (lathis) reenacting Krishna's teasing visit to Radha and the Gopis. If you're visiting for Lathmar Holi, book 60+ days in advance — Mathura sells out completely during this period.",
    ],
    sections: [
      {
        heading: "Radha Rani Temple Timings & How to Reach",
        body: [
          "Radha Rani Temple timings: Summer 5:00 AM - 12:00 PM, 4:00 PM - 9:00 PM. Winter 5:30 AM - 12:00 PM, 3:30 PM - 8:30 PM. Mangala Aarti at dawn and Sandhya Aarti at sunset are the most auspicious times. Entry is free. The climb involves 200 steps — palanquin (doli) service is available for elderly devotees for Rs 200-300.",
          "From Guruvayur Dham in Mathura, Barsana is a 1-hour drive (40 km) via Kosi Kalan. Transport options: taxi (Rs 1,500-2,500 round trip with waiting), Guruvayur Dham guided tour (Rs 1,200-1,500 including car, guide, all temple visits). Best visiting hours: 7-10 AM for peaceful darshan. Combine with Nandgaon (8 km away) and Vrindavan for the full Braj circuit.",
        ],
      },
      {
        heading: "Why Guruvayur Dham is the Best Base for Barsana",
        body: [
          "Barsana itself has limited accommodation — basic dharmshalas and guesthouses without AC or reliable hot water. For most pilgrims, the better choice is a clean, premium base in Mathura with day-trip transport to Barsana. Guruvayur Dham offers exactly this: 16 AC rooms with 24×7 hot water, free WiFi, free parking, and pure-veg restaurant tie-ups within 200 m.",
          "We arrange the full Barsana day-trip: pickup from your room, drive to Barsana, climb assistance (doli booking for elderly), guided darshan at Radha Rani Temple, optional visit to Nandgaon (8 km) on the way back, and return to Mathura by afternoon. Total cost from Rs 1,200-1,500 per person including car and guide — half what Vrindavan-based tour operators charge.",
        ],
      },
      {
        heading: "Lathmar Holi in Barsana — Plan Ahead",
        body: [
          "Lathmar Holi 2026 is expected around 24-25 February 2026 (7-8 days before main Holi on 14 March 2026). The festival draws massive crowds from across India and abroad. Hotels in Mathura sell out 60-90 days in advance and prices surge 3-4x. We strongly recommend booking Guruvayur Dham rooms at least 60 days ahead for Lathmar Holi.",
          "During Lathmar Holi, we coordinate early-morning transport to Barsana (5:30 AM pickup to beat the rush), bottled water and refreshments, and return to Mathura by 2-3 PM. Book via the booking page or WhatsApp +91-90908 20208 for Lathmar Holi packages.",
        ],
      },
    ],
    faqs: [
      { q: "How far is Guruvayur Dham from Radha Rani Temple Barsana?", a: "Guruvayur Dham in Mathura is 40 km (1-hour drive) from Radha Rani Temple in Barsana. We arrange round-trip car + guide from Rs 1,200-1,500 per person." },
      { q: "When is Lathmar Holi in Barsana 2026?", a: "Lathmar Holi 2026 is expected around 24-25 February 2026 (7-8 days before main Holi on 14 March 2026). Book Guruvayur Dham rooms 60+ days ahead." },
      { q: "How many steps to Radha Rani Temple?", a: "Approximately 200 steps climb Bhanugarh Hill to the temple. Wear comfortable shoes. For elderly, palanquin (doli) service is available for Rs 200-300." },
      { q: "Can I visit Barsana and Vrindavan in one day?", a: "Yes. Morning Barsana (7-10 AM), then Nandgaon (10:30 AM), then Vrindavan (2-7 PM). Full-day Braj circuit tour with car from Guruvayur Dham: Rs 1,500-2,000." },
      { q: "Is Radha Rani Temple the only temple to Radha in India?", a: "It is the most prominent temple in India dedicated exclusively to Radha (Ladli Lal). It marks her birthplace in Barsana. Other major Radha-Krishna temples in Braj include Banke Bihari (Vrindavan) and Radha Vallabh (Vrindavan)." },
    ],
    ctaHeadline: "Stay Near Radha Rani Mandir - Guruvayur Dham Mathura, 1-Hr Drive",
  },

  // ─────────────────────────────────────────────────────────────────────
  // 4. Hotels near Gowardhan Hill (parikrama)
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "hotels-near-gowardhan-hill",
    category: "hotels-near" as any,
    navLabel: "Near Gowardhan Hill",
    title: "Hotels Near Gowardhan Hill Mathura - Stay at Guruvayur Dham for Parikrama",
    metaDescription:
      "Hotels near Gowardhan Hill for parikrama. Guruvayur Dham Mathura — 16 premium AC rooms, 45-min drive to Gowardhan, parikrama guide arrangement. Rooms from Rs 1,500/night.",
    heroImage:
      "https://images.unsplash.com/photo-1604608672516-f1b9b1d37076?w=1920&h=1080&fit=crop",
    jsonLdType: "TouristAttraction",
    eyebrow: "Hotels Near · Gowardhan Hill",
    intro: [
      "Gowardhan Hill is the sacred hill that Lord Krishna lifted on his little finger to protect the villagers of Braj from the wrath of Indra, the rain god. Today, devotees perform the Gowardhan Parikrama — a 21-kilometre circumambulation of the hill — as one of the most spiritually charged pilgrimages in the Braj region. The route passes through Mansi Ganga (the sacred lake where the parikrama begins and ends), Daan Ghati Temple, Kusum Sarovar, Radha Kund, and Shyam Kund.",
      "Gowardhan town is 25 km from Mathura (45-minute drive). Hotels in Gowardhan itself are basic — most pilgrims prefer to stay in Mathura and do the parikrama as a day-trip. Guruvayur Dham in Mathura is the ideal base: 16 premium AC rooms, 2 minutes from Mathura Railway Station, with car + guide arrangements for the parikrama. We coordinate the full day-trip — pickup, transport, parikrama guide, and return — at straightforward Mathura pricing.",
      "The parikrama can be done on foot (5-7 hours), by car (1 hour), or by cycle rickshaw (2-3 hours). For elderly devotees, we arrange car parikrama with stops at all major temples. The most auspicious day for the parikrama is Govardhan Puja (the day after Diwali), when the entire hill is lit with lamps and millions of pilgrims gather.",
    ],
    sections: [
      {
        heading: "Gowardhan Parikrama Route, Distance & Timings",
        body: [
          "The parikrama is 21 km (14 miles) long, starting and ending at Mansi Ganga. The route passes: Mansi Ganga (start) → Daan Ghati Temple → Kusum Sarovar → Radha Kund → Shyam Kund → Govind Kund → Mansi Ganga (end). On foot: 5-7 hours. By car: 1 hour. By cycle rickshaw: 2-3 hours.",
          "Best time to start: 4:30 AM in summer (5:30 AM in winter) to finish before noon and avoid heat. Avoid April-June (40°C makes the 21 km walk dangerous). Govardhan Puja (day after Diwali) is the most auspicious day — expect massive crowds.",
        ],
      },
      {
        heading: "How Guruvayur Dham Arranges Your Parikrama",
        body: [
          "From Guruvayur Dham in Mathura, we arrange day-trips to Gowardhan with the following options: (1) Walking parikrama with guide (Rs 800-1,200 per person — guide + transport to start point); (2) Car parikrama with stops at all major temples (Rs 1,500-2,000 per car, 4-hour tour); (3) Cycle rickshaw parikrama for elderly (Rs 300-500 per rickshaw). All arrangements include pickup and drop from your room.",
          "For pilgrims doing the full Braj circuit, we also arrange combined Mathura → Gokul → Gowardhan → Vrindavan day-tours with car and guide from Rs 2,000-2,500. WhatsApp +91-90908 20208 with your dates and group size for a custom itinerary.",
        ],
      },
      {
        heading: "Room Options at Guruvayur Dham",
        body: [
          "We offer four room categories — Deluxe (Rs 1,500/night, king bed, 240 sq.ft), Super Deluxe (Rs 2,200/night, king + sofa bed, 320 sq.ft), Superior (Rs 2,800/night, two king beds, 400 sq.ft — ideal for families), and GVD Suite (Rs 3,500/night, separate living room, 520 sq.ft, complimentary breakfast). All rooms are air-conditioned with attached bathrooms, 24×7 hot water, power backup, free WiFi, and free parking.",
          "Book at least 30 days ahead for Govardhan Puja, Diwali, and Kartik Purnima. Use the booking page for instant confirmation, or WhatsApp +91-90908 20208 for combined parikrama + Mathura temple tour packages.",
        ],
      },
    ],
    faqs: [
      { q: "How far is Guruvayur Dham from Gowardhan Hill?", a: "Guruvayur Dham in Mathura is 25 km (45-minute drive) from Gowardhan Hill. We arrange car + guide for the parikrama day-trip from Rs 1,200." },
      { q: "How long is Gowardhan Parikrama?", a: "21 km (14 miles). On foot: 5-7 hours. By car: 1 hour. By cycle rickshaw: 2-3 hours. Start at 4:30 AM in summer, 5:30 AM in winter." },
      { q: "Can I do Gowardhan Parikrama by car?", a: "Yes. A paved road circles the hill. Car parikrama takes about 1 hour with stops at major temples. Guruvayur Dham arranges car parikrama from Rs 1,500-2,000 per car." },
      { q: "What is the best time for Gowardhan Parikrama?", a: "October-March (pleasant weather). Govardhan Puja (day after Diwali) is most auspicious. Avoid April-June (40°C heat makes 21 km walk dangerous)." },
      { q: "Is Gowardhan Parikrama safe for elderly?", a: "Yes, if done by car or cycle rickshaw. Walking 21 km may be challenging for elderly. Guruvayur Dham arranges car parikrama with stops at all major temples — comfortable for all ages." },
    ],
    ctaHeadline: "Stay Near Gowardhan Hill - Guruvayur Dham Mathura, 45 Min Drive",
  },

  // ─────────────────────────────────────────────────────────────────────
  // 5. Janmashtami 2026 Mathura Hotel Booking
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "janmashtami-2026-mathura-hotel-booking",
    category: "festivals" as any,
    navLabel: "Janmashtami 2026 Booking",
    title: "Janmashtami 2026 Mathura Hotel Booking - Guruvayur Dham Rooms from Rs 1,500",
    metaDescription:
      "Janmashtami 2026 Mathura hotel booking. Guruvayur Dham — 16 premium AC rooms, 2 min from Mathura Station, 1.5 km from Krishna Janmabhoomi. Book 60+ days ahead. Rooms from Rs 1,500.",
    heroImage:
      "https://images.unsplash.com/photo-1604608672516-f1b9b1d37076?w=1920&h=1080&fit=crop",
    jsonLdType: "Event",
    eyebrow: "Janmashtami 2026 · 26-27 August 2026 · Mathura",
    intro: [
      "Janmashtami 2026 is expected to be celebrated on 26-27 August 2026, marking the divine birth of Lord Krishna at midnight in Mathura. The Krishna Janmabhoomi Temple — built on the exact site of Krishna's birth — hosts the grand midnight celebration, with Mangala Aarti at dawn, Abhishek (ceremonial bathing of the deity), Raslila performances throughout the day, and the climactic midnight aarti that draws over 2 million pilgrims to Mathura and Vrindavan.",
      "Booking accommodation for Janmashtami is the single most important logistical decision for pilgrims. Mathura hotels sell out 60-90 days in advance, and prices surge 2-3x closer to the festival. Many pilgrims end up sleeping in temple corridors or paying exorbitant rates for substandard rooms. Guruvayur Dham — a 16-room premium stay in Mathura, 2 minutes from Mathura Station and 1.5 km from Krishna Janmabhoomi — offers clean, comfortable, well-located rooms at honest festival-season rates.",
      "We coordinate Janmashtami darshan slots, midnight aarti queueing, Abhishek bookings, and local transport for our guests. Book at least 60 days in advance to secure your preferred room type at the best available rate. Rooms are limited to 16 — once full, we cannot accommodate further bookings regardless of price. Use the booking page on this site for instant confirmation, or WhatsApp +91-90908 20208 for Janmashtami-specific assistance.",
    ],
    sections: [
      {
        heading: "Janmashtami 2026 Schedule at Krishna Janmabhoomi",
        body: [
          "Janmashtami 2026 celebrations at Krishna Janmabhoomi typically follow this schedule: Mangala Aarti at dawn (around 5:00 AM), Abhishek ceremony throughout the morning, special darshan slots from 8:00 AM - 12:00 PM and 4:00 PM - 9:30 PM, and the grand midnight celebration at 12:00 AM (26→27 August). The midnight aarti is the high point — expect heavy crowds and long queues.",
          "Special arrangements for Janmashtami 2026: temple stays open through midnight, special darshan passes available through authorised channels (we coordinate these at zero commission), and Raslila performances at various venues in Mathura and Vrindavan throughout the day. The Dahi Handi event takes place the following day in Mathura and Gokul.",
        ],
      },
      {
        heading: "Why Book Guruvayur Dham for Janmashtami 2026",
        body: [
          "Three reasons: location, quality, and honesty. Location — 2 min from Mathura Station (easy in/out by train) and 1.5 km from Krishna Janmabhoomi (20-min walk or 5-min auto). Quality — 16 premium AC rooms with 24×7 hot water, attached bathrooms, daily housekeeping, power backup, free WiFi, free parking. Honesty — festival-season rates are published upfront on this site (no surprise surcharges at check-in).",
          "We also coordinate Janmashtami-specific services for our guests: midnight aarti queue management, Abhishek bookings, darshan slot assistance, packed breakfast for early darshan, and local transport. Our team is on-call through the festival. Book 60+ days ahead to lock in the best rate.",
        ],
      },
      {
        heading: "How to Book Janmashtami 2026 Rooms",
        body: [
          "Use the booking page on this site — pick your dates (we recommend arriving by 25 August to settle in and attend pre-festival preparations), choose room type, and confirm. For Janmashtami-specific assistance (darshan passes, Abhishek, transport), WhatsApp +91-90908 20208 after booking — we'll coordinate the festival logistics.",
          "Cancellation policy for Janmashtami: free cancellation up to 7 days before check-in. Refund processed within 5-7 business days. No refund within 7 days of check-in (festival rooms are committed to you and held back from other bookings).",
        ],
      },
    ],
    faqs: [
      { q: "When is Janmashtami 2026 in Mathura?", a: "Janmashtami 2026 is expected on 26-27 August 2026. The midnight celebration takes place at Krishna Janmabhoomi temple. Arrive by 25 August to settle in." },
      { q: "How early should I book Janmashtami 2026 rooms?", a: "Book at least 60-90 days ahead. Guruvayur Dham has only 16 rooms — they fill up fast for Janmashtami. After full, no further bookings accepted regardless of price." },
      { q: "What are the Janmashtami 2026 room rates at Guruvayur Dham?", a: "Festival rates are published upfront on our booking page — typically Rs 3,000-7,000/night depending on room type (vs Rs 1,500-3,500 normal rate). No surprise surcharges at check-in." },
      { q: "Do you arrange Janmashtami darshan passes?", a: "Yes. We coordinate Krishna Janmabhoomi darshan passes, midnight aarti queueing, and Abhishek bookings at zero commission — you pay the official temple rate. WhatsApp +91-90908 20208 after booking your room." },
      { q: "What is the cancellation policy for Janmashtami bookings?", a: "Free cancellation up to 7 days before check-in. No refund within 7 days of check-in (your room is held back from other bookings). Refund processed in 5-7 business days." },
    ],
    ctaHeadline: "Book Janmashtami 2026 Mathura Stay - 16 Rooms Only, Booking Now",
  },

  // ─────────────────────────────────────────────────────────────────────
  // 6. Holi 2026 Mathura Accommodation
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "holi-2026-mathura-accommodation",
    category: "festivals" as any,
    navLabel: "Holi 2026 Stay",
    title: "Holi 2026 Mathura Accommodation - Guruvayur Dham Premium Rooms",
    metaDescription:
      "Holi 2026 Mathura accommodation. Guruvayur Dham — 16 premium AC rooms, 2 min from Mathura Station, 1.5 km from Krishna Janmabhoomi. Book 60+ days ahead. Rooms from Rs 3,000/night.",
    heroImage:
      "https://images.unsplash.com/photo-1583077783049-9c1e9e0f1a3e?w=1920&h=1080&fit=crop",
    jsonLdType: "Event",
    eyebrow: "Holi 2026 · 14 March 2026 · Mathura",
    intro: [
      "Holi 2026 in Mathura is the world's most vibrant Holi celebration — the festival of colours observed in the very region where Lord Krishna played Holi with Radha and the Gopis. Mathura and the surrounding Braj region (Vrindavan, Barsana, Nandgaon, Gokul) host a week-long series of unique Holi traditions: Lathmar Holi in Barsana (where women chase men with sticks), Phoolon ki Holi in Vrindavan (Holi with flower petals), widow's Holi at Gopinath Temple, and the grand main Holi celebration on 14 March 2026 at Dwarkadhish Temple in Mathura.",
      "Holi 2026 main day is 14 March 2026 (Phalguna Purnima). Lathmar Holi in Barsana is expected around 24-25 February 2026. The full Braj Holi season runs from late February to mid-March 2026, drawing pilgrims and photographers from across the world. Booking accommodation is the most critical decision — Mathura sells out completely during this period, prices surge 3-4x, and many travellers end up without a room.",
      "Guruvayur Dham — a 16-room premium stay in Mathura, 2 minutes from Mathura Station and 1.5 km from Krishna Janmabhoomi — offers clean, comfortable, well-located rooms at honest festival-season rates. Book at least 60 days in advance. Rooms are limited to 16 — once full, no further bookings are accepted regardless of price. Use the booking page for instant confirmation, or WhatsApp +91-90908 20208 for Holi-specific assistance and Lathmar Holi packages.",
    ],
    sections: [
      {
        heading: "Holi 2026 Calendar of Events in Mathura-Braj",
        body: [
          "The full Braj Holi 2026 calendar (subject to confirmation by temple authorities): Lathmar Holi in Barsana (24-25 February 2026), Lathmar Holi in Nandgaon (28 February 2026), Phoolon ki Holi at Banke Bihari Temple Vrindavan (early March), widow's Holi at Gopinath Temple Vrindavan (8-10 March), and the main Holi celebration on 14 March 2026 at Dwarkadhish Temple Mathura. Each event is unique — we coordinate day-trips to all of them.",
          "For guests staying at Guruvayur Dham, we arrange early-morning transport to Barsana for Lathmar Holi (5:30 AM pickup to beat the rush), and daytime transport to Vrindavan for Phoolon ki Holi. Bottled water, refreshments, and return-to-Mathura coordination included.",
        ],
      },
      {
        heading: "Why Stay at Guruvayur Dham for Holi 2026",
        body: [
          "Holi is the single most crowded festival in Mathura — even more so than Janmashtami. Accommodation quality matters because you'll be coming back covered in colour, exhausted, and needing a hot shower. Guruvayur Dham offers: 16 premium AC rooms with 24×7 hot water (essential for post-Holi showers), attached bathrooms, daily housekeeping, power backup, free WiFi, free parking, and pure-veg restaurant tie-ups within 200 m.",
          "Location advantage — 2 min walk from Mathura Station (easy in/out by train) and 1.5 km from Dwarkadhish Temple (the main Holi venue in Mathura). We coordinate Holi-specific services for our guests: Lathmar Holi day-trip packages, Phoolon ki Holi transport, festival-day darshan slots, and post-Holi laundry service.",
        ],
      },
      {
        heading: "Holi 2026 Booking & Rates",
        body: [
          "Festival rates for Holi 2026 (14 March) and the full Braj Holi season (24 February - 14 March 2026): typically Rs 3,000-7,000/night depending on room type, published upfront on our booking page (no surprise surcharges at check-in). All rooms are AC with attached bathrooms, 24×7 hot water, daily housekeeping, and free WiFi.",
          "Book 60+ days ahead — 16 rooms only, no overbooking. For Holi-specific assistance (Lathmar Holi package, Phoolon ki Holi transport, festival-day darshan), WhatsApp +91-90908 20208 after booking your room. Cancellation: free up to 7 days before check-in; no refund within 7 days (room is held back from other bookings).",
        ],
      },
    ],
    faqs: [
      { q: "When is Holi 2026 in Mathura?", a: "Main Holi 2026 is on 14 March 2026 (Phalguna Purnima). Lathmar Holi in Barsana is 24-25 February 2026. Full Braj Holi season runs late February - mid March 2026." },
      { q: "How early should I book Holi 2026 rooms in Mathura?", a: "Book 60+ days ahead. Guruvayur Dham has only 16 rooms — they sell out fast for Holi (Mathura's most crowded festival). After full, no further bookings accepted regardless of price." },
      { q: "What are the Holi 2026 rates at Guruvayur Dham?", a: "Festival rates are published upfront on our booking page — typically Rs 3,000-7,000/night depending on room type (vs Rs 1,500-3,500 normal rate). No surprise surcharges at check-in." },
      { q: "Do you arrange Lathmar Holi trips to Barsana?", a: "Yes. We arrange early-morning transport (5:30 AM pickup to beat the rush), bottled water, refreshments, and return to Mathura by 2-3 PM. Lathmar Holi package from Rs 1,500 per person including car." },
      { q: "What should I wear for Holi in Mathura?", a: "Wear white cotton clothes (they show colours best). Bring a change of clothes for return. Old sneakers or sandals. Sunglasses protect eyes. Apply coconut oil on skin/hair before — makes colour wash off easily. Guruvayur Dham provides post-Holi laundry service." },
    ],
    ctaHeadline: "Book Holi 2026 Mathura Stay - 16 Rooms Only, Booking 60+ Days Ahead",
  },
];

// Convenience export for sitemap / count checks.
export const ALL_PHASE4_PAGES = SEO_PAGES_PHASE4;
