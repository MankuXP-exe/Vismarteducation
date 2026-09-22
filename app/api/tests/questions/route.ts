import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isVpsApiEnabled } from "@/lib/api/config";
import { api } from "@/lib/api/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const testId = searchParams.get("testId");

    if (isVpsApiEnabled()) {
      try {
        const cookieStore = await cookies();
        const token = cookieStore.get("vi_session")?.value;
        if (token) {
          const headers = { Cookie: `vi_session=${token}`, Authorization: `Bearer ${token}` };

          if (testId) {
            // Get questions for a specific test + test details
            const [qRes, tRes] = await Promise.all([
              api.tests.getQuestions(testId, { headers }),
              api.tests.getById(testId, { headers }),
            ]);
            if (!qRes.error && qRes.data?.questions) {
              return NextResponse.json({
                questions: qRes.data.questions,
                test: tRes.data?.test || null,
              });
            }
          } else {
            // Teacher view: list all tests with question counts
            const { data, error } = await api.tests.list(undefined, { headers });
            if (!error && data?.tests) {
              return NextResponse.json({ tests: data.tests });
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

    if (testId) {
      const [qRes, tRes] = await Promise.all([
        supabaseAdmin['from']("test_questions").select("*").eq("test_id", testId).order("question_order"),
        supabaseAdmin['from']("tests").select("*").eq("id", testId).single(),
      ]);
      return NextResponse.json({ questions: qRes.data || [], test: tRes.data });
    }

    // Teacher view: get all tests with question counts
    const { data, error } = await supabaseAdmin
      ['from']("tests")
      .select(`*, subjects(name), test_questions(count)`)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ tests: data || [] });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
