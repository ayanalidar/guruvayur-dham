/**
 * Seed all India OTAs + hosting + messaging partners into ChannelConfig table
 */
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

const PARTNERS = [
  // ===== OTAs (Online Travel Agencies) =====
  { code: "BOOKING_COM", name: "Booking.com", category: "OTA", apiEndpoint: "https://supply-xml.booking.com", logo: "booking" },
  { code: "MAKEMYTRIP", name: "MakeMyTrip", category: "OTA", apiEndpoint: "https://api.makemytrip.com", logo: "mmt" },
  { code: "GOIBIBO", name: "Goibibo", category: "OTA", apiEndpoint: "https://api.goibibo.com", logo: "goibibo" },
  { code: "AGODA", name: "Agoda", category: "OTA", apiEndpoint: "https://api.agoda.com", logo: "agoda" },
  { code: "EXPEDIA", name: "Expedia", category: "OTA", apiEndpoint: "https://api.expedia.com", logo: "expedia" },
  { code: "YATRA", name: "Yatra", category: "OTA", apiEndpoint: "https://api.yatra.com", logo: "yatra" },
  { code: "CLEARTRIP", name: "Cleartrip", category: "OTA", apiEndpoint: "https://api.cleartrip.com", logo: "cleartrip" },
  { code: "TRAVELGURU", name: "Travelguru", category: "OTA", apiEndpoint: "", logo: "travelguru" },
  { code: "EASEMYTRIP", name: "EaseMyTrip", category: "OTA", apiEndpoint: "https://api.easemytrip.com", logo: "emt" },
  { code: "IXIGO", name: "ixigo", category: "OTA", apiEndpoint: "https://api.ixigo.com", logo: "ixigo" },
  { code: "FABHOTELS", name: "FabHotels", category: "OTA", apiEndpoint: "https://api.fabhotels.com", logo: "fab" },
  { code: "TREEBO", name: "Treebo Hotels", category: "OTA", apiEndpoint: "https://api.treebo.com", logo: "treebo" },
  { code: "OSTELLO", name: "Ostello", category: "OTA", apiEndpoint: "", logo: "ostello" },
  { code: "MMT_LITE", name: "MMT Lite (Budget)", category: "OTA", apiEndpoint: "", logo: "mmt" },
  { code: "AIRBNB", name: "Airbnb", category: "OTA", apiEndpoint: "https://api.airbnb.com", logo: "airbnb" },
  { code: "TRIPADVISOR", name: "TripAdvisor", category: "OTA", apiEndpoint: "https://api.tripadvisor.com", logo: "ta" },
  { code: "GOOGLE_HOTELS", name: "Google Hotels", category: "OTA", apiEndpoint: "https://hotels.google.com", logo: "google" },
  { code: "HOTEL_TRAVEL", name: "HotelTravel.com", category: "OTA", apiEndpoint: "", logo: "ht" },

  // ===== Channel Managers =====
  { code: "STAAH", name: "STAAH Channel Manager", category: "CHANNEL_MANAGER", apiEndpoint: "https://api.staah.com", logo: "staah" },
  { code: "SITEMINDER", name: "SiteMinder", category: "CHANNEL_MANAGER", apiEndpoint: "https://api.siteminder.com", logo: "sm" },
  { code: "EZEE", name: "eZee Channel Manager", category: "CHANNEL_MANAGER", apiEndpoint: "https://api.ezeems.com", logo: "ezee" },
  { code: "WEBVOYAGE", name: "WebVoyage", category: "CHANNEL_MANAGER", apiEndpoint: "", logo: "wv" },
  { code: "REVENUEPLUS", name: "RevenuePlus", category: "CHANNEL_MANAGER", apiEndpoint: "", logo: "rp" },

  // ===== Hosting / Infrastructure =====
  { code: "HOSTINGER", name: "Hostinger", category: "HOSTING", apiEndpoint: "https://api.hostinger.com", logo: "hostinger" },
  { code: "VERCEL", name: "Vercel", category: "HOSTING", apiEndpoint: "https://api.vercel.com", logo: "vercel" },
  { code: "CLOUDFLARE", name: "Cloudflare", category: "HOSTING", apiEndpoint: "https://api.cloudflare.com", logo: "cf" },
  { code: "GOOGLE_CLOUD", name: "Google Cloud", category: "HOSTING", apiEndpoint: "https://api.google.com", logo: "gcp" },

  // ===== Messaging =====
  { code: "WHATSAPP_BUSINESS", name: "WhatsApp Business API", category: "MESSAGING", apiEndpoint: "https://graph.facebook.com/v18.0", logo: "wa" },
  { code: "TWILIO", name: "Twilio (SMS/WhatsApp)", category: "MESSAGING", apiEndpoint: "https://api.twilio.com", logo: "twilio" },
  { code: "MSG91", name: "MSG91 (SMS India)", category: "MESSAGING", apiEndpoint: "https://api.msg91.com", logo: "msg91" },
  { code: "GUPSHUP", name: "Gupshup (WhatsApp/SMS)", category: "MESSAGING", apiEndpoint: "https://api.gupshup.io", logo: "gupshup" },
  { code: "INTERAKT", name: "Interakt (WhatsApp)", category: "MESSAGING", apiEndpoint: "https://api.interakt.ai", logo: "interakt" },
  { code: "WATI", name: "Wati (WhatsApp)", category: "MESSAGING", apiEndpoint: "https://api.wati.io", logo: "wati" },

  // ===== Payment =====
  { code: "RAZORPAY", name: "Razorpay", category: "PAYMENT", apiEndpoint: "https://api.razorpay.com", logo: "rzp" },
  { code: "PAYU", name: "PayU India", category: "PAYMENT", apiEndpoint: "https://api.payu.in", logo: "payu" },
  { code: "CASHFREE", name: "Cashfree", category: "PAYMENT", apiEndpoint: "https://api.cashfree.com", logo: "cf" },
  { code: "PHONEPE", name: "PhonePe", category: "PAYMENT", apiEndpoint: "https://api.phonepe.com", logo: "pp" },
  { code: "PAYTM", name: "Paytm", category: "PAYMENT", apiEndpoint: "https://api.paytm.com", logo: "paytm" },

  // ===== Analytics =====
  { code: "GOOGLE_ANALYTICS", name: "Google Analytics 4", category: "ANALYTICS", apiEndpoint: "https://analyticsreporting.googleapis.com", logo: "ga" },
  { code: "GOOGLE_SEARCH_CONSOLE", name: "Google Search Console", category: "ANALYTICS", apiEndpoint: "https://www.googleapis.com/searchconsole", logo: "gsc" },
  { code: "FB_PIXEL", name: "Facebook Pixel", category: "ANALYTICS", apiEndpoint: "https://graph.facebook.com", logo: "fb" },
  { code: "HOTJAR", name: "Hotjar", category: "ANALYTICS", apiEndpoint: "https://api.hotjar.com", logo: "hj" },

  // ===== Email =====
  { code: "SENDGRID", name: "SendGrid", category: "EMAIL", apiEndpoint: "https://api.sendgrid.com", logo: "sg" },
  { code: "SENDBLUE", name: "Sendinblue (Brevo)", category: "EMAIL", apiEndpoint: "https://api.sendinblue.com", logo: "sb" },
  { code: "AMAZON_SES", name: "Amazon SES", category: "EMAIL", apiEndpoint: "https://email.us-east-1.amazonaws.com", logo: "ses" },
];

async function main() {
  console.log("🌱 Seeding channel partner configurations...");
  for (const p of PARTNERS) {
    await db.channelConfig.upsert({
      where: { code: p.code },
      create: { ...p, connected: false },
      update: {},
    });
  }
  console.log(`✓ ${PARTNERS.length} partner configurations seeded`);
  await db.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
