import type { Metadata } from "next";

/**
 * Per-route SEO metadata for the Guruvayur Dham SPA.
 *
 * Each route gets a UNIQUE <title>, <meta description>, and self-referencing
 * <link rel="canonical">. This is critical for Google to index each URL as a
 * separate page — without it, all 73 URLs serve byte-identical HTML (same
 * title, same description, no canonical) and Google collapses them into a
 * single "duplicate" page (the homepage), dropping the other 72 from the
 * index.
 *
 * Usage in per-route page.tsx files:
 *   export const metadata = ROUTE_METADATA["/book"];
 *   export { default } from "@/app/page";
 *
 * For SEO landing pages (janmashtami, holi-in-mathura, etc.), use the
 * catch-all route src/app/[slug]/page.tsx with generateMetadata that calls
 * getSEOMetadataForSlug(slug).
 */

const SITE_URL = "https://www.guruvayurdham.co.in";

export const ROUTE_METADATA: Record<string, Metadata> = {
  "/": {
    title: "Guruvayur Dham · Luxury Pilgrim Stay 2 Minutes from Mathura Junction",
    description:
      "Boutique pilgrim accommodation in Mathura, opposite Mata Pathwari Mandir and 3 km from Shri Krishna Janmabhoomi. 15+ cinematic dark-luxe AC rooms, 24×7 hot water, free parking, on-site Mathura-Braj pooja booking. 2 minutes from Mathura Junction railway station.",
    alternates: { canonical: `${SITE_URL}/` },
  },
  "/book": {
    title: "Book Your Stay — Guruvayur Dham Mathura | Instant Booking",
    description:
      "Instant booking for AC dark-luxe rooms at Guruvayur Dham, 2 min from Mathura Junction. Real-time availability, dynamic pricing, zero booking fee. Pay online via Razorpay or pay at hotel. Free parking + 24×7 hot water.",
    alternates: { canonical: `${SITE_URL}/book` },
  },
  "/rooms": {
    title: "AC Rooms & Suites in Mathura — Deluxe, Superior, GVD Suite | Guruvayur Dham",
    description:
      "15+ cinematic dark-luxe AC rooms: Deluxe (Family Suit/Quad), King Deluxe, Premium Double, Privilege Suite, Family Comfort Triple. All with Smart TV, Netflix/OTT, attached bathroom, 24×7 hot water. ₹1,250–₹2,699/night.",
    alternates: { canonical: `${SITE_URL}/rooms` },
  },
  "/pooja": {
    title: "Mathura Temple Pooja Booking — Mangala Aarti, Abhishek & More | Guruvayur Dham",
    description:
      "Book temple poojas at official rates — zero commission. Mangala Aarti, Abhishek, Rajbhog Aarti, Sandhya Aarti, Pushpanjali, Annadan. Coordinated with temple pandit on your behalf. Prasadam delivered to your room.",
    alternates: { canonical: `${SITE_URL}/pooja` },
  },
  "/about": {
    title: "About Guruvayur Dham — Family-Run Pilgrim Stay in Mathura Since 1998",
    description:
      "Guruvayur Dham is a family-run pilgrim accommodation in Mathura, serving 50,000+ devotees since 1998. 15+ AC rooms, 22-point housekeeping checklist, 3 AM reception. Founder Krishna Warrier shares the story of serving Braj pilgrims for 3 generations.",
    alternates: { canonical: `${SITE_URL}/about` },
  },
  "/contact": {
    title: "Contact Guruvayur Dham — Mathura Hotel Near Railway Station",
    description:
      "Call +91-90908 20208 or WhatsApp for instant booking. Guruvayur Dham, opposite Mata Pathwari Mandir, 2 min from Mathura Junction railway station. Check-in 11:30 AM, check-out 11:00 AM. Free parking, 24×7 reception.",
    alternates: { canonical: `${SITE_URL}/contact` },
  },
  "/events": {
    title: "Festivals & Events in Mathura — Janmashtami, Holi, Diwali 2026 | Guruvayur Dham",
    description:
      "Plan your pilgrimage around major Mathura festivals: Janmashtami (Krishna's birthday), Holi at Barsana/Vrindavan, Diwali at Dwarkadhish, Kartik Purnima at Vishram Ghat. Guruvayur Dham offers festival-season packages with early check-in.",
    alternates: { canonical: `${SITE_URL}/events` },
  },
  "/blog": {
    title: "Mathura Travel Blog — Pilgrim Guides, Temple Tips & Darshan Timings",
    description:
      "Read our Mathura travel blog for pilgrim guides, temple darshan timings, Braj yatra itineraries, pooja significance, and local tips. Written by Guruvayur Dham staff who serve 50,000+ devotees yearly.",
    alternates: { canonical: `${SITE_URL}/blog` },
  },
  "/faq": {
    title: "FAQ — Guruvayur Dham Mathura Hotel Questions Answered",
    description:
      "Answers to common questions: check-in time (11:30 AM), check-out (11:00 AM), distance to Krishna Janmabhoomi (3 km), nearest railway station (Mathura Junction, 2 km), pooja booking, cancellation policy, GST invoice, dress code, food options.",
    alternates: { canonical: `${SITE_URL}/faq` },
  },
  "/gallery": {
    title: "Photo Gallery — Guruvayur Dham Mathura | Rooms, Temple & Surroundings",
    description:
      "Browse photos of Guruvayur Dham: cinematic dark-luxe rooms, hotel exterior, temple proximity, Mathura surroundings, and Braj pilgrimage sites. See what your pilgrim stay looks like before booking.",
    alternates: { canonical: `${SITE_URL}/gallery` },
  },
  "/tour": {
    title: "360° Virtual Tour — Guruvayur Dham Mathura | Explore Rooms Online",
    description:
      "Take a 360° virtual tour of Guruvayur Dham rooms, lobby, and surroundings. Explore our Deluxe, Superior, and GVD Suite rooms from your browser before booking your pilgrim stay in Mathura.",
    alternates: { canonical: `${SITE_URL}/tour` },
  },
  "/planner": {
    title: "Pilgrimage Planner — Mathura, Vrindavan, Gokul, Barsana Darshan Guide",
    description:
      "Plan your Braj pilgrimage with our darshan planner. Suggested itineraries for 1-day, 2-day, and 3-day Mathura-Vrindavan-Gokul-Barsana yatra. Temple timings, distances, travel tips, and pooja recommendations.",
    alternates: { canonical: `${SITE_URL}/planner` },
  },
  "/privacy": {
    title: "Privacy Policy — Guruvayur Dham Mathura",
    description:
      "Guruvayur Dham privacy policy. How we collect, use, and protect your personal data when you book a room or pooja. GDPR-compliant. No third-party data sale. Contact us for data deletion.",
    alternates: { canonical: `${SITE_URL}/privacy` },
  },
  "/terms": {
    title: "Terms & Conditions — Guruvayur Dham Mathura Hotel Booking",
    description:
      "Booking terms and conditions for Guruvayur Dham, Mathura. Cancellation policy (7+ days: 90% refund, 3-6 days: 50%, <72h: no refund), festival-season rules, check-in/check-out times, guest conduct, and payment terms.",
    alternates: { canonical: `${SITE_URL}/terms` },
  },
  "/policies": {
    title: "Hotel Policies — Guruvayur Dham Mathura | Check-in, Pets, GST",
    description:
      "Guruvayur Dham hotel policies: check-in 11:30 AM, check-out 11:00 AM, early check-in ₹200 extra, max 8 guests per booking, GST invoice available, no pets, no smoking in rooms. Festival-season policies.",
    alternates: { canonical: `${SITE_URL}/policies` },
  },
};

/**
 * Get metadata for a SEO landing page slug (e.g., "janmashtami",
 * "hotels-near-krishna-janmabhoomi", etc.). These slugs are defined
 * in src/lib/seo-pages.ts.
 *
 * Used by src/app/[slug]/page.tsx (catch-all for SEO landing pages).
 */
export function getSEOMetadataForSlug(slug: string, title: string, metaDescription: string): Metadata {
  return {
    title,
    description: metaDescription,
    alternates: { canonical: `${SITE_URL}/${slug}` },
    openGraph: {
      title,
      description: metaDescription,
      url: `${SITE_URL}/${slug}`,
    },
  };
}

export { SITE_URL };
