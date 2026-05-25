import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get("batchId");
    const subjectId = searchParams.get("subjectId");
    const chapterId = searchParams.get("chapterId");
    const type = searchParams.get("type");

    let query = supabase
      .from("study_materials")
      .select(`*, subjects(name), chapters(title)`)
      .order("created_at", { ascending: false });

    if (batchId) query = query.eq("batch_id", batchId);
    if (subjectId) query = query.eq("subject_id", subjectId);
    if (chapterId) query = query.eq("chapter_id", chapterId);
    if (type) query = query.eq("material_type", type);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ materials: data || [] });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
