import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { testId, question, optionA, optionB, optionC, optionD, correctOption, explanation, marks } = await req.json();
    if (!testId || !question) return NextResponse.json({ error: "testId and question required" }, { status: 400 });

    // Get next order
    const { data: last } = await supabase
      .from("test_questions")
      .select("question_order")
      .eq("test_id", testId)
      .order("question_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const order = (last?.question_order ?? -1) + 1;

    const { data, error } = await supabase
      .from("test_questions")
      .insert({
        test_id: testId,
        question,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC,
        option_d: optionD,
        correct_option: correctOption,
        explanation: explanation || "",
        marks: marks || 1,
        question_order: order,
      })
      .select()
      .single();

    // Update total marks
    await supabase.rpc("update_test_total_marks", { test_id: testId });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ question: data });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
