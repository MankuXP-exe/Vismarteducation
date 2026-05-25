import { NextResponse } from "next/server";
import { findFAQReply, AI_SYSTEM_PROMPT, getDailyTip } from "@/lib/ai-assistant";

const AI_API_KEY = process.env.AI_API_KEY || "sk-live-05c599942dde682ee79aad91b3961e9ad6c246628e1e6d550257a370c3328f05";
const AI_BASE_URL = process.env.AI_BASE_URL || "https://api.aicredits.in/v1";
const AI_MODEL = process.env.AI_MODEL || "deepseek/deepseek-v4-flash";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { message, userId } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Layer 1: Check predefined FAQ
    const faq = findFAQReply(message);
    if (faq) {
      return NextResponse.json({
        reply: faq.reply,
        source: "faq",
        category: faq.category || "general",
      });
    }

    // Layer 2: AI API fallback
    const res = await fetch(`${AI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: "system", content: AI_SYSTEM_PROMPT },
          { role: "user", content: message },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("AI API error:", res.status, errText);
      // Fallback to a generic response if AI fails
      return NextResponse.json({
        reply: "I'm here to help! Try asking about XP, batches, lectures, or streaks. If the issue persists, contact support.",
        source: "fallback",
        category: "general",
      });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "I couldn't process that. Please try again.";

    return NextResponse.json({
      reply,
      source: "ai",
      category: "general",
    });
  } catch (err) {
    console.error("AI assistant error:", err);
    return NextResponse.json(
      { reply: "I'm having trouble connecting. Please try again later.", source: "error", category: "general" },
      { status: 200 }
    );
  }
}
