import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { lectureId, noteTitle, noteUrl, noteType } = await req.json();
    if (!lectureId && !noteUrl) {
      return NextResponse.json({ error: "lectureId or noteUrl required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("bookmarks")
      .insert({ user_id: user.id, lecture_id: lectureId || null, note_title: noteTitle || null, note_url: noteUrl || null, note_type: noteType || "lecture" })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ bookmark: data });
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
