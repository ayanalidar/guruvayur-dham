import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/ai/provider";

// POST /api/ai-chat — Guruvayur Guide chatbot
// Uses Groq (Llama 3.3 70B) first, falls back to z-ai SDK (GLM)
export async function POST(req: NextRequest) {
  const { message, history } = await req.json();
  if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

  const systemPrompt = `You are the Guruvayur Dham AI Guide — a warm, knowledgeable assistant for pilgrims visiting Guruvayur Temple in Mathura, Uttar Pradesh, India. You help with:
- Temple darshan timings, dress code, and rituals
- Room bookings at Guruvayur Dham (₹700-₹3,500/night)
- Pooja bookings (Palpayasam, Thulabharam, Choroonu, etc.)
- Festival dates and planning
- Travel routes and nearby attractions
- General pilgrim guidance

Always be respectful, warm, and concise. Use "Namaskaram" as greeting. If asked about booking, mention WhatsApp +91-90908 20208 or our website.

KNOWLEDGE BASE:
- Location: Opposite. Mata Pathwari Mandir, Natwar Nagar, Dholi Pyau, Mathura, Uttar Pradesh 281001
- Phone: +91-90908 20208
- Rooms: 52 total — AC, Non-AC, Family Suite, Dormitory
- Price range: ₹700 to ₹3,500 per night
- Check-in: 12:00 PM, Check-out: 11:00 AM
- 24×7 hot water, free WiFi, free parking
- Rating: 4.9 stars (847+ reviews)
- Family-run since 1998

If you don't know something, say so honestly and suggest the guest WhatsApp us at +91-90908 20208.`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...(history || []).map((h: any) => ({ role: h.role as "user" | "assistant", content: h.content })),
    { role: "user" as const, content: message },
  ];

  try {
    const result = await chat(messages, { temperature: 0.7, maxTokens: 400 });

    return NextResponse.json({
      reply: result.content,
      provider: result.provider,
      model: result.model,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      reply: `Namaskaram! I'm having trouble connecting right now. For immediate assistance, please WhatsApp us at +91-90908 20208 — we reply within 5 minutes.`,
      error: error.message,
    });
  }
}
