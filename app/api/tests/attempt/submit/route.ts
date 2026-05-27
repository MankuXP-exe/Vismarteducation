import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { attemptId, answers, timeTakenSeconds } = await req.json();
    if (!attemptId) return NextResponse.json({ error: "attemptId required" }, { status: 400 });

    // Get attempt + test + questions
    const { data: attempt } = await supabaseAdmin
      .from("test_attempts")
      .select("*, tests(*)")
      .eq("id", attemptId)
      .eq("user_id", user.id)
      .single();

    if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    if (attempt.submitted_at) return NextResponse.json({ error: "Already submitted" }, { status: 400 });

    const { data: questions } = await supabaseAdmin
      .from("test_questions")
      .select("*")
      .eq("test_id", attempt.test_id)
      .order("question_order");

    // Calculate score
    let score = 0;
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    const totalQuestions = questions?.length || 0;
    const negativeMarks = attempt.tests?.negative_marking || 0;

    for (const q of questions || []) {
      const userAnswer = answers?.[q.id];
      if (!userAnswer) { unanswered++; continue; }
      if (userAnswer === q.correct_option) {
        score += q.marks;
        correct++;
      } else {
        score -= negativeMarks;
        incorrect++;
      }
    }

    const totalMarks = questions?.reduce((s, q) => s + (q.marks || 1), 0) || 0;
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100 * 100) / 100 : 0;
    const passed = percentage >= (attempt.tests?.pass_percentage || 40);

    // Award XP for attempting
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || "https://vismartlearningeducation.com"}/api/xp/award`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "test_attempt", metadata: { testId: attempt.test_id, score, passed } }),
    }).catch(() => {});

    const { data, error } = await supabaseAdmin
      .from("test_attempts")
      .update({
        answers,
        score,
        total_marks: totalMarks,
        correct_count: correct,
        incorrect_count: incorrect,
        unanswered_count: unanswered,
        percentage,
        passed,
        submitted_at: new Date().toISOString(),
        time_taken_seconds: timeTakenSeconds || 0,
      })
      .eq("id", attemptId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Award high score XP
    if (passed && percentage >= 90) {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || "https://vismartlearningeducation.com"}/api/xp/award`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_high_score", metadata: { testId: attempt.test_id, score, percentage } }),
      }).catch(() => {});
    }

    return NextResponse.json({
      attempt: data,
      result: { score, totalMarks, correct, incorrect, unanswered, percentage, passed },
    });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
