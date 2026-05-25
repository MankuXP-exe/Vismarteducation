import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { batchId, subjectId, chapterId, title, fileUrl, materialType } = await req.json();
    if (!batchId || !title || !fileUrl) {
      return NextResponse.json({ error: "batchId, title, and fileUrl required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("study_materials")
      .insert({
        batch_id: batchId,
        subject_id: subjectId || null,
        chapter_id: chapterId || null,
        title,
        file_url: fileUrl,
        material_type: materialType || "notes",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ material: data });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
