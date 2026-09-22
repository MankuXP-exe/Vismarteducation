import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { isVpsApiEnabled } from "@/lib/api/config";
import { api } from "@/lib/api/client";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const questionId = body.questionId || body.question_id;
    const testId = body.testId || body.test_id;
    if (!questionId) return NextResponse.json({ error: "questionId required" }, { status: 400 });

    if (isVpsApiEnabled()) {
      try {
        const cookieStore = await cookies();
        const token = cookieStore.get("vi_session")?.value;
        if (token) {
          const headers = { Cookie: `vi_session=${token}`, Authorization: `Bearer ${token}` };
          const { data, error } = await api.tests.removeQuestion(questionId, { headers });
          if (!error && data) {
            return NextResponse.json({ success: true });
          }
        }
      } catch {
        // Fallback to Supabase
      }
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error } = await supabase['from']("test_questions").delete().eq("id", questionId);
    if (testId) await supabase.rpc("update_test_total_marks", { test_id: testId });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
