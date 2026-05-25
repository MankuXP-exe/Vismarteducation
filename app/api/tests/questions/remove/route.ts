import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function DELETE(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { questionId, testId } = await req.json();
    if (!questionId) return NextResponse.json({ error: "questionId required" }, { status: 400 });

    const { error } = await supabase.from("test_questions").delete().eq("id", questionId);
    if (testId) await supabase.rpc("update_test_total_marks", { test_id: testId });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
