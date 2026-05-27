import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const attemptId = searchParams.get("attemptId");
    const testId = searchParams.get("testId");

    let query = supabaseAdmin
      .from("test_attempts")
      .select(`*, tests(*)`)
      .eq("user_id", user.id);

    if (attemptId) query = query.eq("id", attemptId);
    else if (testId) query = query.eq("test_id", testId);

    const { data, error } = await query.order("submitted_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Get questions for review
    let questions: any[] = [];
    if (data && data.length > 0) {
      const { data: qs } = await supabaseAdmin
        .from("test_questions")
        .select("id, question, option_a, option_b, option_c, option_d, correct_option, explanation, marks, question_order")
        .eq("test_id", data[0].test_id)
        .order("question_order");
      questions = qs || [];
    }

    return NextResponse.json({ attempts: data || [], questions });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
