import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { lectureId, question, imageUrl } = await req.json();
    if (!question) return NextResponse.json({ error: "Question is required" }, { status: 400 });

    const { data, error } = await supabase
      .from("doubts")
      .insert({
        user_id: user.id,
        lecture_id: lectureId || null,
        question,
        image_url: imageUrl || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Try AI answer in background
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || "https://vismartlearningeducation.com"}/api/doubts/ai-answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doubtId: data.id, question }),
    }).catch(() => {});

    return NextResponse.json({ doubt: data });
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
