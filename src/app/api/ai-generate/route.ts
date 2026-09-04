import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/ai/provider";

/**
 * POST /api/ai-generate
 * AI-powered content generation for blog posts, room descriptions, SEO meta, etc.
 * Uses Groq (Llama 3.3 70B) first, falls back to z-ai SDK (GLM)
 *
 * body: { type, prompt, context? }
 * type: "blog" | "room-description" | "seo-meta" | "pooja-description" | "email" | "social" | "custom"
 */
export async function POST(req: NextRequest) {
  const { type, prompt, context } = await req.json();

  if (!prompt) {
    return NextResponse.json({ error: "Prompt required" }, { status: 400 });
  }

  const systemPrompts: Record<string, string> = {
    blog: "You are a travel writer specializing in Indian pilgrimage destinations. Write engaging, SEO-optimized blog posts about Guruvayur Dham and Mathura. Use a warm, informative tone. Include practical tips for pilgrims. Always mention the address: Opposite Mata Pathwari Mandir, Natwar Nagar, Dholi Pyau, Mathura, UP 281001. Phone: +91-90908 20208.",
    "room-description": "You are a luxury hotel copywriter. Write compelling room descriptions that highlight comfort, cleanliness, and pilgrim-friendly features. Keep it 100-150 words. Mention amenities naturally.",
    "seo-meta": "You are an SEO expert. Generate optimized meta titles (under 60 chars) and meta descriptions (under 160 chars) for hotel web pages. Include relevant keywords naturally.",
    "pooja-description": "You are a knowledgeable temple priest. Write brief, respectful descriptions of Hindu poojas and offerings. Explain significance and what prasadam is included. Keep it 80-120 words.",
    email: "You are a warm hospitality email writer for Guruvayur Dham. Write professional but friendly emails for booking confirmations, festival greetings, and follow-ups. Always sign off as 'Guruvayur Dham Team'.",
    social: "You are a social media manager for a luxury pilgrim hotel. Write engaging Instagram/Facebook posts with relevant hashtags. Keep it under 200 characters + hashtags. Use emojis appropriately.",
    custom: "You are a helpful AI assistant for Guruvayur Dham, a luxury pilgrim hotel in Mathura, UP.",
  };

  const systemPrompt = systemPrompts[type] || systemPrompts.custom;
  const fullPrompt = context ? `Context: ${context}\n\nRequest: ${prompt}` : prompt;

  try {
    const result = await generateContent(fullPrompt, systemPrompt, {
      temperature: 0.8,
      maxTokens: type === "seo-meta" ? 300 : 2000,
    });

    return NextResponse.json({
      content: result.content,
      provider: result.provider,
      type,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      error: "Content generation failed",
      message: error.message,
    }, { status: 500 });
  }
}

/**
 * GET /api/ai-generate — check AI provider status
 */
export async function GET() {
  const { isGroqAvailable, getGroqModels } = await import("@/lib/ai/provider");
  const groqAvailable = isGroqAvailable();
  let models: string[] = [];

  if (groqAvailable) {
    models = await getGroqModels();
  }

  return NextResponse.json({
    groq: {
      configured: groqAvailable,
      models: models.length > 0 ? models : ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"],
    },
    zai: {
      configured: true,
      model: "glm-4-flash",
    },
    primary: groqAvailable ? "groq" : "z-ai",
    fallback: "z-ai",
  });
}
