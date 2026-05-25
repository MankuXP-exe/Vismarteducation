import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { batchId, subjectId, title, description, durationMinutes, totalMarks, negativeMarking, passPercentage, startsAt, endsAt } = await req.json();
    if (!batchId || !title) return NextResponse.json({ error: "batchId and title required" }, { status: 400 });

    const { data, error } = await supabase
      .from("tests")
      .insert({
        batch_id: batchId,
        subject_id: subjectId || null,
        title,
        description: description || "",
        duration_minutes: durationMinutes || 60,
        total_marks: totalMarks || 0,
        negative_marking: negativeMarking || 0,
        pass_percentage: passPercentage || 40,
        starts_at: startsAt || null,
        ends_at: endsAt || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ test: data });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
