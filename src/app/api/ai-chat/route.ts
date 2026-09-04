import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

// POST /api/ai-chat · Guruvayur Guide chatbot
// body: { message: "What time is Nirmalya darshan?" }
// Returns: { reply: "...", sources: [...] }
export async function POST(req: NextRequest) {
  const { message } = await req.json();
  if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

  // Knowledge base about Guruvayur · pulled from blog content
  const knowledgeBase = `
Guruvayur Dham is a boutique pilgrim accommodation 200 metres from Guruvayur Temple's East Nada gate.

KEY FACTS:
- Distance to temple: 2-minute walk (200 m) to East Nada gate
- Rooms: 52 total · AC, Non-AC, Family Suite, Dormitory
- Price range: ₹700 to ₹3,500 per night
- Check-in: 12:00 PM, Check-out: 11:00 AM
- 24×7 hot water, free WiFi, free parking for 25+ vehicles
- Rating: 4.9 stars on Google (847+ reviews)
- Family-run since 1998, three generations

GURUVAYUR TEMPLE DARSHAN TIMINGS:
- Nirmalya Darshan: 3:00 AM (most sacred · idol with previous night's flowers)
- Seeveli procession: 7:30 AM (elephant procession around inner pradakshina)
- Usha Pooja: 8:00 AM
- General Darshan: 8:30 AM - 12:30 PM
- Temple closes: 12:30 PM (afternoon break)
- Temple reopens: 4:30 PM
- Deeparadhana (evening aarti): 6:15 PM (most crowded)
- Temple closes for night: 9:15 PM

DRESS CODE:
- Men: Must wear mundu/dhoti, remove upper garment (chest bare)
- Women: Must wear saree or salwar kameez with dupatta
- No trousers, jeans, leggings for women inside sanctum
- Children under 10: relaxed dress code
- Spare mundus/sarees available at reception (₹100 refundable deposit)

POOJAS AVAILABLE (book through us, zero commission):
- Palpayasam: ₹50 (sweet rice-milk porridge, most beloved offering)
- Archana: ₹100 (nama-archana with 1008 names)
- Pushpanjali: ₹75 (short flower offering)
- Mala Offering: ₹250 (garland on deity)
- Thulabharam: ₹1,500 (weighing ceremony)
- Choroonu: ₹800 (first rice-feeding for infants)
- Bhagavatha Sapthaham: ₹5,000 (7-day Bhagavatam recitation)

MAJOR FESTIVALS:
- Guruvayur Ekadasi (Dec 8, 2026): Most important · Chembai Sangeetholsavam music festival
- Ashtami Rohini (Aug 25, 2026): Krishna Jayanti, midnight abhishekam
- Guruvayur Utsavam (Feb 26 - Mar 7, 2026): Annual 10-day festival with elephant processions
- Vishu (Apr 14, 2026): Malayalam New Year, Vishukkani darshan at 2:30 AM
- Mandala Pooja Season (Nov 16 - Dec 27, 2026): Sabarimala pilgrimage stopover

HOW TO REACH:
- Nearest airport: Cochin International (COK), 87 km, 2-hour drive
- Nearest railhead: Thrissur Junction (29 km), then local train to Guruvayur
- Guruvayur has its own railway station (1 km from temple)
- KSRTC buses from all major Kerala cities

BEST TIME TO VISIT:
- October-February: Best weather (22-32°C), peak season
- December first week: Sweet spot between Mandala end and Ekadasi
- Monsoon (June-September): Lush green, less crowded, but heavy rain
- Avoid: Festival days unless you specifically want to attend

NEARBY ATTRACTIONS (within 60 km):
1. Punnathur Kotta Elephant Sanctuary (3 km)
2. Athirappilly Waterfalls (60 km)
3. Kerala Kalamandalam (35 km) · performing arts university
4. Vadakkunnathan Temple, Thrissur (29 km)
5. Paramekkavu & Thiruvambadi Temples (29 km)
6. Palayur Church (25 km) · St. Thomas church
7. Peechi Dam & Wildlife Sanctuary (25 km)
8. Shakthan Thampuran Palace (29 km)
9. Chavakkad Beach (25 km)
10. Snehatheeram Beach (30 km)
`;

  const systemPrompt = `You are the Guruvayur Dham AI Guide · a warm, knowledgeable assistant for pilgrims visiting Guruvayur Temple in Kerala, India. You help with:
- Temple darshan timings, dress code, and rituals
- Room bookings at Guruvayur Dham (₹700-₹3,500/night, 2 min walk to temple)
- Pooja bookings (Palpayasam, Thulabharam, Choroonu, etc.)
- Festival dates and planning
- Travel routes and nearby attractions
- General pilgrim guidance

Always be respectful, warm, and concise. Use "Namaskaram" as greeting. If asked about booking, mention WhatsApp +91 98765 43210 or our website.

KNOWLEDGE BASE:
${knowledgeBase}

If you don't know something, say so honestly and suggest the guest WhatsApp us at +91 98765 43210.`;

  try {
    const zai = await ZAI.create();
    const response = await zai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const reply = response.choices[0]?.message?.content || "I apologize, I couldn't process that. Please WhatsApp us at +91 98765 43210.";

    return NextResponse.json({
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    // Fallback if AI SDK fails
    return NextResponse.json({
      reply: `Namaskaram! I'm having trouble connecting right now. For immediate assistance, please WhatsApp us at +91 98765 43210 · we reply within 5 minutes.`,
      error: error.message,
    });
  }
}
