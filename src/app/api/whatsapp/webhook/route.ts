import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chat } from "@/lib/ai/provider";
import crypto from "crypto";

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
 *   - WHATSAPP_APP_SECRET    — your Meta app secret (used for signature
 *                              verification of POST payloads — REQUIRED in
 *                              production for security)
 *   - WHATSAPP_PHONE_NUMBER_ID  — your WhatsApp Business phone number ID
 *   - WHATSAPP_ACCESS_TOKEN  — your WhatsApp Business API access token
 *
 * SECURITY (Phase B C8 fix):
 * - POST now verifies Meta's X-Hub-Signature-256 HMAC header. Without this,
 *   anyone could POST fake inbound messages (triggering WhatsApp replies +
 *   leaking booking details to the attacker by phone).
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
    console.log("WhatsApp webhook verified");
    return new NextResponse(challenge || "", { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// POST — Incoming WhatsApp message (signature-verified).
export async function POST(req: NextRequest) {
  try {
    // ===== Signature verification (X-Hub-Signature-256) =====
    // Meta signs every webhook POST with HMAC-SHA256 of the raw body using
    // your App Secret. Verifying this prevents fake inbound messages.
    const appSecret = process.env.WHATSAPP_APP_SECRET;
    const sig = req.headers.get("x-hub-signature-256") || "";

    // Read the raw body once (so we can both verify and parse).
    const rawBody = await req.text();

    if (appSecret) {
      const expected = "sha256=" + crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
      // Constant-time comparison to prevent timing attacks.
      if (
        sig.length !== expected.length ||
        !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
      ) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === "production") {
      // Fail-closed in production — without app secret, we can't verify.
      console.error("WHATSAPP_APP_SECRET not set — refusing to process WhatsApp webhook in production");
      return NextResponse.json(
        { error: "Server misconfiguration: WHATSAPP_APP_SECRET not set" },
        { status: 503 }
      );
    } else {
      // Dev only — warn but allow (so you can test without configuring Meta).
      console.warn("WHATSAPP_APP_SECRET not set — skipping webhook signature verification (dev mode)");
    }

    const body = JSON.parse(rawBody);

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

    // Log the conversation (in dev only — PII in prod logs is risky).
    if (process.env.NODE_ENV !== "production") {
      console.log(`WhatsApp IN from ${from}: ${text.slice(0, 80)}`);
    }

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
    console.error("WhatsApp webhook error:", error.message || error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Process an incoming message and return a reply.
 *
 * SECURITY (Round 3 F4 fix): "my booking" intent no longer returns booking
 * details by arbitrary phone number. Was: anyone texting the WhatsApp
 * Business number with "my booking" got full booking details for the phone
 * Meta sent the message from. Now: asks for booking reference (GD-XXXX) like
 * the simulated /api/whatsapp-bot does (Phase C M2).
 *
 * FUNCTIONAL (Round 3 F12 fix): added missing 'directions' and 'dresscode'
 * intents that exist in /api/whatsapp-bot but were never ported here.
 */
async function processMessage(phone: string, message: string): Promise<string> {
  const msg = message.toLowerCase().trim();

  if (msg.match(/^(hi|hello|hey|namaskaram|namaste)/)) {
    return `Namaskaram! 🙏 Welcome to Guruvayur Dham. I can help you with:\n\n• Book a room\n• Check your booking\n• Pooja list & booking\n• Darshan timings\n• Festival dates\n• Check-in/out times\n• How to reach us\n• Dress code\n\nWhat would you like to know?`;
  }

  if (msg.match(/book|room|availability|reserve/)) {
    return `We'd love to host you! 🏨\n\nOur rooms (2 min walk to the temple):\n• Non-AC Budget: ₹700/night\n• Standard AC: ₹1,500/night\n• Deluxe AC: ₹2,200/night\n• Family Suite AC: ₹3,500/night\n\nBook instantly: https://guruvayurdham.com/#/rooms\n\nOr tell me your check-in date, check-out date, and number of guests.`;
  }

  if (msg.match(/pooja|aarti|abhishek|bhog|offering/)) {
    return `Sacred offerings (zero commission): 🙏\n\n• Pushpanjali · ₹21\n• Mangala Aarti · ₹51\n• Sandhya Aarti · ₹101\n• Rajbhog Aarti · ₹251\n• Abhishek · ₹1,100\n• Annadan · ₹2,100\n\nBook online: https://guruvayurdham.com/#/pooja`;
  }

  if (msg.match(/darshan|timing|temple time/)) {
    return `Temple Darshan Timings: 🛕\n\n• Mata Pathwari Mandir: 5:00 AM - 9:00 PM (next to us!)\n• Krishna Janmabhoomi: 5:00 AM - 12:00 PM, 4:00 PM - 9:30 PM\n• Dwarkadhish Temple: 6:30 AM - 10:30 AM, 4:00 PM - 7:00 PM\n\nBest time: Early morning for peaceful darshan.`;
  }

  if (msg.match(/festival|janmashtami|holi|diwali/)) {
    return `Major Festivals: 🎉\n\n• Janmashtami (Aug/Sept): Krishna's birthday\n• Holi (March): Lathmar Holi in Barsana\n• Diwali (Oct/Nov): Festival of lights\n• Radhashtami (Aug/Sept)\n\nBook rooms 60+ days in advance! https://guruvayurdham.com/#/events`;
  }

  if (msg.match(/check.?in|check.?out|time/)) {
    return `Check-in & Check-out: ⏰\n\n• Check-in: 12:00 PM\n• Check-out: 11:00 AM\n• Early check-in (8 AM): ₹200 extra\n• Late check-out (2 PM): ₹300\n\nFree pickup from Mathura railway station for 2+ night stays!`;
  }

  // F12 fix: directions intent (was missing from webhook)
  if (msg.match(/reach|how|direction|airport|train|bus/)) {
    return `How to Reach Us: 🚗\n\n• Address: Opp. Mata Pathwari Mandir, Natwar Nagar, Dholi Pyau, Mathura, UP 281001\n• Phone: +91-90908 20208\n• Nearest airport: Agra (60 km) / Delhi (150 km)\n• Mathura railway station: 3 km\n• Vrindavan: 15 km\n\nFree parking for 25+ vehicles. WhatsApp +91-90908 20208 for pickup!`;
  }

  // F12 fix: dress code intent (was missing from webhook)
  if (msg.match(/dress|code|mundu|saree|wear/)) {
    return `Dress Code for Mathura Temples: 👕\n\nMen:\n• Dhoti/kurta or traditional wear preferred\n• No shorts or sleeveless shirts\n\nWomen:\n• Saree, salwar kameez, or modest traditional wear\n• Cover head in some temples (especially Krishna Janmabhoomi)\n\nGeneral:\n• Remove footwear before entering\n• No leather items inside sanctum\n• Photography prohibited inside most temples`;
  }

  if (msg.match(/my booking|status|reference/)) {
    // SECURITY (F4): do NOT return booking details by phone — anyone texting
    // the WhatsApp Business number with "my booking" would learn that phone's
    // booking reference, dates, amount. Ask for booking reference instead
    // (GD-XXXX is a secret known only to the actual guest).
    return `To check your booking, please share your booking reference (starts with GD-, e.g. GD-AB12CD). You received it via WhatsApp/SMS when you booked. Lost your reference? Please call our front desk at +91-90908 20208 — we'll verify your identity before sharing details.`;
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
    // Only log in dev — PII in prod logs is risky.
    if (process.env.NODE_ENV !== "production") {
      console.log("[DEV] WhatsApp reply not sent (env vars not set):", message.slice(0, 80));
    }
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
