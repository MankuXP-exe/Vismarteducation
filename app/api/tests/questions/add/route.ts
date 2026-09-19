import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isVpsApiEnabled } from "@/lib/api/config";
import { api } from "@/lib/api/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const testId = body.testId || body.test_id;
    if (!testId || !body.question) return NextResponse.json({ error: "testId and question required" }, { status: 400 });

    if (isVpsApiEnabled()) {
      try {
        const cookieStore = await cookies();
        const token = cookieStore.get("vi_session")?.value;
        if (token) {
          const headers = { Cookie: `vi_session=${token}`, Authorization: `Bearer ${token}` };
          const { data, error } = await api.tests.addQuestion(testId, {
            question: body.question,
            option_a: body.optionA || body.option_a,
            option_b: body.optionB || body.option_b,
            option_c: body.optionC || body.option_c,
            option_d: body.optionD || body.option_d,
            correct_option: body.correctOption || body.correct_option,
            explanation: body.explanation,
            marks: body.marks,
          }, { headers });
          if (!error && data?.question) {
            return NextResponse.json({ question: data.question });
          }
        }
      } catch {
        // Fallback to Supabase
      }
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { question, optionA, optionB, optionC, optionD, correctOption, explanation, marks } = body;

    // Get next order
    const { data: last } = await supabaseAdmin
      .from("test_questions")
      .select("question_order")
      .eq("test_id", testId)
      .order("question_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const order = (last?.question_order ?? -1) + 1;

    const { data, error } = await supabaseAdmin
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
    await supabaseAdmin.rpc("update_test_total_marks", { test_id: testId });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ question: data });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
