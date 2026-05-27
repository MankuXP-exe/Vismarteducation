import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const testId = searchParams.get("testId");

    if (testId) {
      const [qRes, tRes] = await Promise.all([
        supabaseAdmin.from("test_questions").select("*").eq("test_id", testId).order("question_order"),
        supabaseAdmin.from("tests").select("*").eq("id", testId).single(),
      ]);
      return NextResponse.json({ questions: qRes.data || [], test: tRes.data });
    }

    // Teacher view: get all tests with question counts
    const { data, error } = await supabaseAdmin
      .from("tests")
      .select(`*, subjects(name), test_questions(count)`)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ tests: data || [] });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
