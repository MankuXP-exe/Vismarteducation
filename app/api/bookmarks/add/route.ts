import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { isVpsApiEnabled } from "@/lib/api/config";
import { api } from "@/lib/api/client";

export async function POST(req: Request) {
  try {
    if (isVpsApiEnabled()) {
      try {
        const cookieStore = await cookies();
        const token = cookieStore.get("vi_session")?.value;
        if (token) {
          const body = await req.clone().json().catch(() => ({}));
          const { lectureId, noteTitle, noteUrl, noteType } = body;
          if (!lectureId && !noteUrl) {
            return NextResponse.json({ error: "lectureId or noteUrl required" }, { status: 400 });
          }
          const { data, error } = await api.bookmarks.toggle(
            { lectureId, noteTitle, noteUrl, noteType },
            { headers: { Cookie: `vi_session=${token}`, Authorization: `Bearer ${token}` } }
          );
          if (!error) {
            return NextResponse.json({ bookmark: data?.bookmark || data });
          }
        }
      } catch {
        // Fallback to Supabase on failure
      }
    }

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
