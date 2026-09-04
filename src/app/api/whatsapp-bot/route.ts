import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

// POST /api/whatsapp-bot · simulated WhatsApp chatbot
// body: { phone, message }
// Recognizes intents: "book a room", "my booking", "pooja list", "check-out time", "festival dates"
export async function POST(req: NextRequest) {
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
  } else if (msg.match(/pooja|palpayasam|thulabharam|choroonu|archana|offering/)) {
    intent = "pooja";
    reply = ` sacred offerings at Guruvayur Temple (zero commission): 🙏\n\n• Palpayasam · ₹50\n• Archana · ₹100\n• Pushpanjali · ₹75\n• Mala Offering · ₹250\n• Thulabharam · ₹1,500\n• Choroonu (Annaprasham) · ₹800\n• Bhagavatha Sapthaham · ₹5,000\n\nBook online: https://guruvayurdham.com/#/pooja\n\nOr tell me which pooja and preferred date · I'll book it for you!`;
  } else if (msg.match(/darshan|timing|nirmalya|deeparadhana|seeveli/)) {
    intent = "darshan";
    reply = `Guruvayur Temple Darshan Timings: 🛕\n\n• Nirmalya Darshan: 3:00 AM (most sacred)\n• Seeveli procession: 7:30 AM\n• General Darshan: 8:30 AM - 12:30 PM\n• Temple reopens: 4:30 PM\n• Deeparadhana (evening aarti): 6:15 PM\n• Temple closes: 9:15 PM\n\nShortest queue slots: Nirmalyam (3 AM), post-Ucha Pooja (12 PM), post-Deeparadhana (7:30 PM)\n\nAvoid weekends & Ekadasi unless specifically attending.`;
  } else if (msg.match(/festival|utsavam|ekadasi|vishu|ashtami/)) {
    intent = "festival";
    reply = `Major Guruvayur Festivals 2026: 🎉\n\n• Guruvayur Ekadasi: Dec 8, 2026 (Chembai music festival finale)\n• Ashtami Rohini: Aug 25, 2026 (Krishna Jayanti)\n• Guruvayur Utsavam: Feb 26 - Mar 7, 2026 (10-day elephant processions)\n• Vishu: Apr 14, 2026 (Malayalam New Year)\n• Mandala Season: Nov 16 - Dec 27, 2026\n\nBook rooms 60+ days in advance for festival dates! https://guruvayurdham.com/#/events`;
  } else if (msg.match(/check.?in|check.?out|time/)) {
    intent = "checkin";
    reply = `Check-in & Check-out: ⏰\n\n• Check-in: 12:00 PM\n• Check-out: 11:00 AM\n• Early check-in (8 AM): ₹200 extra\n• Late check-out (2 PM): ₹300\n• Half-day extension (6 PM): ₹600\n\nFree pickup from Guruvayur railway station for 2+ night stays!`;
  } else if (msg.match(/reach|how|direction|airport|train|bus/)) {
    intent = "directions";
    reply = `How to Reach Guruvayur: 🚗\n\n• Nearest airport: Cochin (COK), 87 km, 2-hr taxi (₹2,500-3,500)\n• Nearest major railhead: Thrissur (29 km)\n• Guruvayur railway station: 1 km from temple\n• KSRTC buses from all Kerala cities\n\nFree parking for 25+ vehicles at Guruvayur Dham. WhatsApp +91 98765 43210 for pickup arrangement!`;
  } else if (msg.match(/dress|code|mundu|saree|wear/)) {
    intent = "dresscode";
    reply = `Dress Code for Guruvayur Temple: 👕\n\nMen:\n• Must wear mundu/dhoti\n• Remove upper garment (chest bare)\n• Towel/angavastram on shoulder OK\n\nWomen:\n• Saree or salwar kameez with dupatta\n• No trousers, jeans, leggings\n\nChildren under 10: relaxed\n\nSpare mundus/sarees at our reception (₹100 refundable deposit). Photography prohibited inside temple.`;
  } else if (msg.match(/my booking|status|reference/)) {
    intent = "booking_status";
    // Try to find booking by phone
    const booking = await db.booking.findFirst({
      where: { guestPhone: phone },
      orderBy: { createdAt: "desc" },
    });
    if (booking) {
      reply = `Your booking: 📋\n\nReference: ${booking.reference}\nStatus: ${booking.status}\nCheck-in: ${new Date(booking.checkIn).toLocaleDateString("en-IN")}\nCheck-out: ${new Date(booking.checkOut).toLocaleDateString("en-IN")}\nNights: ${booking.nights}\nAmount: ₹${booking.amount}\nSource: ${booking.source}\n\nNeed changes? WhatsApp our front desk: +91 98765 43210`;
    } else {
      reply = `I couldn't find a booking for ${phone}. Could you share your booking reference (starts with GD-)? Or book a new room at https://guruvayurdham.com/#/rooms`;
    }
  } else {
    // Use AI for general questions
    intent = "ai_fallback";
    try {
      const zai = await ZAI.create();
      const response = await zai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are the Guruvayur Dham WhatsApp assistant. Be warm, brief, and helpful. Use Namaskaram as greeting. Keep replies under 150 words. For booking, share https://guruvayurdham.com/#/rooms. For urgent help, share +91 98765 43210.",
          },
          { role: "user", content: message },
        ],
        temperature: 0.6,
        max_tokens: 250,
      });
      reply = response.choices[0]?.message?.content || "I'll have our team reply shortly. WhatsApp +91 98765 43210 for urgent help.";
    } catch {
      reply = `Namaskaram! I didn't quite understand that. I can help with: booking, pooja, darshan timings, festivals, dress code, how to reach, or check your booking. Try one of those, or WhatsApp our team at +91 98765 43210.`;
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
