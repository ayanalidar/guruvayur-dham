import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chat } from "@/lib/ai/provider";
import { rateLimit } from "@/lib/rate-limiter";

// POST /api/whatsapp-bot · simulated WhatsApp chatbot
// body: { phone, message }
// Recognizes intents: "book a room", "my booking", "pooja list", "check-out time", "festival dates"
//
// SECURITY (Phase C M2 fix):
// - Rate limited: 20 messages/min per IP (prevents AI cost abuse).
// - "my booking" intent no longer returns booking details by arbitrary phone.
//   Instead, asks the user for their booking reference (GD-XXXX) — which is
//   a secret known only to the actual guest. Was: anyone could pass any
//   phone number and learn that person's booking reference, dates, amount.
export async function POST(req: NextRequest) {
  // Rate limit — 20 messages/min per IP.
  const rl = await rateLimit(req, { window: 60, max: 20, key: "whatsapp-bot" });
  if (!rl.ok) return NextResponse.json({ error: "Too many messages. Please wait a minute." }, { status: 429 });

  const { phone, message } = await req.json();
  if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

  const msg = message.toLowerCase().trim();
  let reply = "";
  let intent = "general";

  // Intent recognition
  if (msg.match(/^(hi|hello|hey|namaskaram|namaste)/)) {
    intent = "greeting";
    reply = `Namaskaram! 🙏 Welcome to Guruvayur Dham. I can help you with:\n\n• Book a room\n• Check your booking\n• Pooja list & booking\n• Darshan timings\n• Festival dates\n• Check-in/out times\n• How to reach us\n\nWhat would you like to know?`;
  } else if (msg.match(/book|room|availability|reserve/)) {
    intent = "booking";
    reply = `We'd love to host you! 🏨\n\nOur rooms (2 min walk to Guruvayur Temple):\n• Non-AC Budget: ₹700/night\n• Standard AC: ₹1,500/night\n• Deluxe AC: ₹2,200/night\n• Family Suite AC: ₹3,500/night\n\nTo check availability & book instantly:\n👉 https://guruvayurdham.com/#/rooms\n\nOr just tell me:\n• Check-in date\n• Check-out date\n• Number of guests\n\nAnd I'll check availability for you!`;
  } else if (msg.match(/pooja|aarti|abhishek|bhog|offering/)) {
    intent = "pooja";
    reply = `Sacred offerings at Mathura temples (zero commission): 🙏\n\n• Pushpanjali · ₹21\n• Mangala Aarti · ₹51\n• Sandhya Aarti · ₹101\n• Rajbhog Aarti · ₹251\n• Abhishek · ₹1,100\n• Annadan · ₹2,100\n• Phool Bangla · ₹5,100\n\nBook online: https://guruvayurdham.com/#/pooja`;
  } else if (msg.match(/darshan|timing|aarti|temple time/)) {
    intent = "darshan";
    reply = `Mathura Temple Darshan Timings: 🛕\n\n• Krishna Janmabhoomi: 5:00 AM - 12:00 PM, 4:00 PM - 9:30 PM\n• Dwarkadhish Temple: 6:30 AM - 10:30 AM, 4:00 PM - 7:00 PM\n• Banke Bihari (Vrindavan): 7:45 AM - 12:00 PM, 5:30 PM - 9:30 PM\n• Mata Pathwari Mandir: 5:00 AM - 9:00 PM (next to us!)\n\nBest time: Early morning for peaceful darshan.`;
  } else if (msg.match(/festival|janmashtami|holi|diwali/)) {
    intent = "festival";
    reply = `Major Mathura Festivals: 🎉\n\n• Janmashtami (Aug/Sept): Krishna's birthday · biggest festival\n• Holi (March): Lathmar Holi in Barsana, Phoolon ki Holi in Vrindavan\n• Diwali (Oct/Nov): Festival of lights\n• Radhashtami (Aug/Sept): Radha's appearance day\n• Kartik Purnima (Nov): Full moon celebration\n\nBook rooms 60+ days in advance! https://guruvayurdham.com/#/events`;
  } else if (msg.match(/check.?in|check.?out|time/)) {
    intent = "checkin";
    reply = `Check-in & Check-out: ⏰\n\n• Check-in: 12:00 PM\n• Check-out: 11:00 AM\n• Early check-in (8 AM): ₹200 extra\n• Late check-out (2 PM): ₹300\n• Half-day extension (6 PM): ₹600\n\nFree pickup from Mathura railway station for 2+ night stays!`;
  } else if (msg.match(/reach|how|direction|airport|train|bus/)) {
    intent = "directions";
    reply = `How to Reach Us: 🚗\n\n• Address: Opposite. Mata Pathwari Mandir, Natwar Nagar, Dholi Pyau, Mathura, UP 281001\n• Phone: +91-90908 20208\n• Nearest airport: Agra (60 km) / Delhi (150 km)\n• Mathura railway station: 3 km\n• Vrindavan: 15 km\n\nFree parking for 25+ vehicles. WhatsApp +91-90908 20208 for pickup!`;
  } else if (msg.match(/dress|code|mundu|saree|wear/)) {
    intent = "dresscode";
    reply = `Dress Code for Mathura Temples: 👕\n\nMen:\n• Dhoti/kurta or traditional wear preferred\n• No shorts or sleeveless shirts\n\nWomen:\n• Saree, salwar kameez, or modest traditional wear\n• Cover head in some temples (especially Krishna Janmabhoomi)\n\nGeneral:\n• Remove footwear before entering\n• No leather items inside sanctum\n• Photography prohibited inside most temples`;
  } else if (msg.match(/my booking|status|reference/)) {
    intent = "booking_status";
    // SECURITY (M2): Do NOT return booking details by phone — that allows
    // anyone to enumerate bookings for any phone number. Instead, ask for
    // the booking reference (GD-XXXX), which is a secret known only to the
    // actual guest.
    reply = `To check your booking, please share your booking reference (starts with GD-, e.g. GD-AB12CD). You received it via WhatsApp/SMS when you booked. Lost your reference? Please call our front desk at +91-90908 20208 — we'll verify your identity before sharing details.`;
  } else {
    // Use AI for general questions (Groq first, z-ai fallback)
    intent = "ai_fallback";
    try {
      const result = await chat([
        {
          role: "system",
          content: "You are the Guruvayur Dham WhatsApp assistant in Mathura, UP. Be warm, brief, and helpful. Use Namaskaram as greeting. Keep replies under 150 words. For booking, share https://guruvayurdham.com/#/rooms. For urgent help, share +91-90908 20208. Location: Opposite Mata Pathwari Mandir, Natwar Nagar, Dholi Pyau, Mathura, UP 281001.",
        },
        { role: "user", content: message },
      ], { temperature: 0.6, maxTokens: 250 });

      reply = result.content;
    } catch {
      reply = `Namaskaram! I didn't quite understand that. I can help with: booking, pooja, darshan timings, festivals, dress code, how to reach, or check your booking. Try one of those, or WhatsApp our team at +91-90908 20208.`;
    }
  }

  // Log the conversation
  await db.notification.create({
    data: {
      type: "WHATSAPP",
      recipient: phone,
      body: `[IN] ${message}\n[OUT] ${reply}`,
      status: "SENT",
      sentAt: new Date(),
    },
  });

  return NextResponse.json({ reply, intent, phone });
}
