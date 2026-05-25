import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { doubtId, answer } = await req.json();
    if (!doubtId || !answer) return NextResponse.json({ error: "doubtId and answer required" }, { status: 400 });

    const { error } = await supabase
      .from("doubts")
      .update({ teacher_answer: answer, status: "answered_by_teacher" })
      .eq("id", doubtId);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
