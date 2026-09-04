/**
 * Unified AI Provider — tries Groq first (free, fast), falls back to z-ai SDK.
 *
 * Supports:
 * 1. Groq (Llama 3.3 70B) — free tier, very fast, needs GROQ_API_KEY
 * 2. z-ai-web-dev-sdk (GLM) — always available, no key needed
 *
 * Usage:
 *   import { chat, streamChat, generateContent } from "@/lib/ai/provider";
 *   const reply = await chat("What time is Nirmalya darshan?");
 */

import ZAI from "z-ai-web-dev-sdk";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

/**
 * Check if Groq is available (key configured)
 */
export function isGroqAvailable(): boolean {
  return !!GROQ_API_KEY;
}

/**
 * Chat completion — tries Groq first, falls back to z-ai SDK
 */
export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<{ content: string; provider: "groq" | "z-ai"; model: string }> {
  const { temperature = 0.7, maxTokens = 500, model } = options;

  // ===== Try Groq first =====
  if (isGroqAvailable()) {
    try {
      const response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model || GROQ_MODEL,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return { content, provider: "groq", model: model || GROQ_MODEL };
        }
      }
      // If Groq fails, fall through to z-ai
      console.log("[AI] Groq failed, falling back to z-ai SDK");
    } catch (e) {
      console.log("[AI] Groq error, falling back to z-ai SDK:", (e as Error).message);
    }
  }

  // ===== Fallback: z-ai SDK (always works) =====
  const zai = await ZAI.create();
  const response = await zai.chat.completions.create({
    messages: messages as any,
    temperature,
    max_tokens: maxTokens,
  });

  return {
    content: response.choices[0]?.message?.content || "I apologize, I couldn't process that.",
    provider: "z-ai",
    model: "glm-4-flash",
  };
}

/**
 * Stream chat completion (for real-time typing effect)
 * Tries Groq streaming first, falls back to non-streaming z-ai
 */
export async function* streamChat(
  messages: ChatMessage[],
  options: ChatOptions = {}
): AsyncGenerator<{ chunk: string; provider: string }> {
  const { temperature = 0.7, maxTokens = 500, model } = options;

  // ===== Try Groq streaming =====
  if (isGroqAvailable()) {
    try {
      const response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model || GROQ_MODEL,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: true,
        }),
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") return;
              try {
                const parsed = JSON.parse(data);
                const chunk = parsed.choices?.[0]?.delta?.content;
                if (chunk) {
                  yield { chunk, provider: "groq" };
                }
              } catch {}
            }
          }
        }
        return;
      }
    } catch (e) {
      console.log("[AI] Groq streaming failed, falling back to z-ai");
    }
  }

  // ===== Fallback: z-ai SDK (non-streaming, yield as single chunk) =====
  const result = await chat(messages, options);
  yield { chunk: result.content, provider: result.provider };
}

/**
 * Generate content (for blog posts, descriptions, etc.)
 */
export async function generateContent(
  prompt: string,
  systemPrompt?: string,
  options: ChatOptions = {}
): Promise<{ content: string; provider: string }> {
  const messages: ChatMessage[] = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  const result = await chat(messages, { temperature: 0.8, maxTokens: 2000, ...options });
  return { content: result.content, provider: result.provider };
}

/**
 * Get available models from Groq
 */
export async function getGroqModels(): Promise<string[]> {
  if (!isGroqAvailable()) return [];

  try {
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { "Authorization": `Bearer ${GROQ_API_KEY}` },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return (data.data || []).map((m: any) => m.id).sort();
  } catch {
    return [];
  }
}
