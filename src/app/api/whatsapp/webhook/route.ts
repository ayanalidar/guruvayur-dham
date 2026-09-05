import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chat } from "@/lib/ai/provider";

/**
 * WhatsApp Business API Webhook
 *
 * This endpoint receives incoming WhatsApp messages from Meta's WhatsApp
 * Business API (or Twilio's WhatsApp API). Configure the webhook URL in
 * your Meta Business Manager → WhatsApp Manager → Webhook setup.
 *
 * GET  /api/whatsapp/webhook  — Webhook verification (Meta sends hub.challenge)
 * POST /api/whatsapp/webhook  — Incoming messages
 *
 * Environment variables needed:
 *   - WHATSAPP_VERIFY_TOKEN  — the token you set in Meta Business Manager
 *   - WHATSAPP_PHONE_NUMBER_ID  — your WhatsApp Business phone number ID
 *   - WHATSAPP_ACCESS_TOKEN  — your WhatsApp Business API access token
 *
 * If env vars are not set, the endpoint returns a friendly message explaining
 * how to set them up. The /api/whatsapp-bot endpoint (used by the website
 * chat widget) works without these.
 */

// GET — Webhook verification (Meta calls this when you set up the webhook)
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (!verifyToken) {
    return NextResponse.json(
      {
        error: "WHATSAPP_VERIFY_TOKEN env var not set",
        setup: "Set WHATSAPP_VERIFY_TOKEN in your .env file, then enter the same token in Meta Business Manager → WhatsApp Manager → Webhook setup.",
      },
      { status: 500 }
    );
  }

  if (mode === "subscribe" && token === verifyToken) {
    console.log("✅ WhatsApp webhook verified");
    return new NextResponse(challenge || "", { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// POST — Incoming WhatsApp message
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Meta WhatsApp webhook payload structure
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];
    const contact = change?.value?.contacts?.[0];

    if (!message) {
      // Not a message webhook (could be status update) — acknowledge
      return NextResponse.json({ status: "ok" });
    }

    const from = message.from; // phone number
    const text = message.text?.body || "";

    if (!text) {
      return NextResponse.json({ status: "ok" });
    }

    // Process the message using the same intent logic as /api/whatsapp-bot
    const reply = await processMessage(from, text);

    // Log the conversation
    await db.notification.create({
      data: {
        type: "WHATSAPP",
        recipient: from,
        body: `[IN] ${text}\n[OUT] ${reply}`,
        status: "SENT",
        sentAt: new Date(),
      },
    });

    // Send the reply back via WhatsApp API
    await sendWhatsAppReply(from, reply);

    return NextResponse.json({ status: "ok", reply });
  } catch (error: any) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Process an incoming message and return a reply.
 */
async function processMessage(phone: string, message: string): Promise<string> {
  const msg = message.toLowerCase().trim();

  if (msg.match(/^(hi|hello|hey|namaskaram|namaste)/)) {
    return `Namaskaram! 🙏 Welcome to Guruvayur Dham. I can help you with:\n\n• Book a room\n• Check your booking\n• Pooja list & booking\n• Darshan timings\n• Festival dates\n• Check-in/out times\n• How to reach us\n\nWhat would you like to know?`;
  }

  if (msg.match(/book|room|availability|reserve/)) {
    return `We'd love to host you! 🏨\n\nOur rooms (2 min walk to the temple):\n• Non-AC Budget: ₹700/night\n• Standard AC: ₹1,500/night\n• Deluxe AC: ₹2,200/night\n• Family Suite AC: ₹3,500/night\n\nBook instantly: https://guruvayurdham.com/#/rooms\n\nOr tell me your check-in date, check-out date, and number of guests.`;
  }

  if (msg.match(/pooja|aarti|abhishek|bhog|offering/)) {
    return `Sacred offerings (zero commission): 🙏\n\n• Pushpanjali · ₹21\n• Mangala Aarti · ₹51\n• Sandhya Aarti · ₹101\n• Rajbhog Aarti · ₹251\n• Abhishek · ₹1,100\n• Annadan · ₹2,100\n\nBook online: https://guruvayurdham.com/#/pooja`;
  }

  if (msg.match(/darshan|timing|aarti|temple time/)) {
    return `Temple Darshan Timings: 🛕\n\n• Mata Pathwari Mandir: 5:00 AM - 9:00 PM (next to us!)\n• Krishna Janmabhoomi: 5:00 AM - 12:00 PM, 4:00 PM - 9:30 PM\n• Dwarkadhish Temple: 6:30 AM - 10:30 AM, 4:00 PM - 7:00 PM\n\nBest time: Early morning for peaceful darshan.`;
  }

  if (msg.match(/festival|janmashtami|holi|diwali/)) {
    return `Major Festivals: 🎉\n\n• Janmashtami (Aug/Sept): Krishna's birthday\n• Holi (March): Lathmar Holi in Barsana\n• Diwali (Oct/Nov): Festival of lights\n• Radhashtami (Aug/Sept)\n\nBook rooms 60+ days in advance! https://guruvayurdham.com/#/events`;
  }

  if (msg.match(/check.?in|check.?out|time/)) {
    return `Check-in & Check-out: ⏰\n\n• Check-in: 12:00 PM\n• Check-out: 11:00 AM\n• Early check-in (8 AM): ₹200 extra\n• Late check-out (2 PM): ₹300\n\nFree pickup from Mathura railway station for 2+ night stays!`;
  }

  if (msg.match(/my booking|status|reference/)) {
    const booking = await db.booking.findFirst({
      where: { guestPhone: phone },
      orderBy: { createdAt: "desc" },
    });
    if (booking) {
      return `Your booking: 📋\n\nReference: ${booking.reference}\nStatus: ${booking.status}\nCheck-in: ${new Date(booking.checkIn).toLocaleDateString("en-IN")}\nCheck-out: ${new Date(booking.checkOut).toLocaleDateString("en-IN")}\nAmount: ₹${booking.amount}\n\nNeed changes? Call +91-90908 20208.`;
    }
    return `I couldn't find a booking for ${phone}. Could you share your booking reference (starts with GD-)?`;
  }

  // AI fallback for general questions
  try {
    const result = await chat([
      {
        role: "system",
        content: "You are the Guruvayur Dham WhatsApp assistant in Mathura, UP. Be warm, brief, and helpful. Use Namaskaram as greeting. Keep replies under 150 words. For booking, share https://guruvayurdham.com/#/rooms. For urgent help, share +91-90908 20208.",
      },
      { role: "user", content: message },
    ], { temperature: 0.6, maxTokens: 250 });
    return result.content;
  } catch {
    return `Namaskaram! I can help with: booking, pooja, darshan timings, festivals, dress code, how to reach, or check your booking. Try one of those, or call +91-90908 20208.`;
  }
}

/**
 * Send a WhatsApp reply via Meta's WhatsApp Business API.
 * Falls back gracefully if env vars are not set (dev mode).
 */
async function sendWhatsAppReply(to: string, message: string): Promise<void> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.log("📱 [DEV] WhatsApp reply not sent (env vars not set):", message.slice(0, 80));
    return;
  }

  try {
    await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message },
      }),
    });
  } catch (error) {
    console.error("Failed to send WhatsApp reply:", error);
  }
}
