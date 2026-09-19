import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isVpsApiEnabled } from "@/lib/api/config";
import { api } from "@/lib/api/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const attemptId = searchParams.get("attemptId");
    const testId = searchParams.get("testId");

    if (isVpsApiEnabled()) {
      try {
        const cookieStore = await cookies();
        const token = cookieStore.get("vi_session")?.value;
        if (token) {
          const headers = { Cookie: `vi_session=${token}`, Authorization: `Bearer ${token}` };

          if (attemptId) {
            const { data, error } = await api.tests.getAttemptById(attemptId, { headers });
            if (!error && data) {
              // Build response matching Supabase format
              const attempts = data.attempt ? [data.attempt] : [];
              const questions = data.test?.test_questions || [];
              return NextResponse.json({ attempts, questions });
            }
          } else if (testId) {
            const { data, error } = await api.tests.getAttempts(testId, { headers });
            if (!error && data?.attempts) {
              return NextResponse.json({ attempts: data.attempts, questions: [] });
            }
          }
        }
      } catch {
        // Fallback to Supabase
      }
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
