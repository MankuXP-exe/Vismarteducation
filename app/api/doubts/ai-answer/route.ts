import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { findFAQReply, AI_SYSTEM_PROMPT } from "@/lib/ai-assistant";

const AI_API_KEY = process.env.AI_API_KEY;
const AI_BASE_URL = process.env.AI_BASE_URL || "https://api.aicredits.in/v1";
const AI_MODEL = process.env.AI_MODEL || "deepseek/deepseek-v4-flash";

export async function POST(req: Request) {
  try {
    const { doubtId, question } = await req.json();
    if (!doubtId || !question) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const supabase = await createServerClient();

    // First check FAQ
    const faq = findFAQReply(question);
    if (faq) {
      await supabase.from("doubts").update({ ai_answer: faq.reply, status: "answered_by_ai" }).eq("id", doubtId);
      return NextResponse.json({ answer: faq.reply, source: "faq" });
    }

    // Call AI
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
          { role: "user", content: `Explain this doubt clearly: ${question}` },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      await supabase.from("doubts").update({ status: "pending" }).eq("id", doubtId);
      return NextResponse.json({ error: "AI unavailable" }, { status: 502 });
    }

    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content || "I couldn't process this doubt.";

    await supabase.from("doubts").update({ ai_answer: answer, status: "answered_by_ai" }).eq("id", doubtId);
    return NextResponse.json({ answer, source: "ai" });
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
