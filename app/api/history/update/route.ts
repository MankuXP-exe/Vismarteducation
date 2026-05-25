import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { lectureId, watchedSeconds, totalSeconds, completed } = await req.json();
    if (!lectureId) return NextResponse.json({ error: "lectureId required" }, { status: 400 });

    const { data: existing } = await supabase
      .from("watch_history")
      .select("id, watched_seconds")
      .eq("user_id", user.id)
      .eq("lecture_id", lectureId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("watch_history")
        .update({
          watched_seconds: Math.max(existing.watched_seconds, watchedSeconds || 0),
          total_seconds: totalSeconds || 0,
          completed: completed || false,
          last_watched_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      const { error } = await supabase
        .from("watch_history")
        .insert({
          user_id: user.id,
          lecture_id: lectureId,
          watched_seconds: watchedSeconds || 0,
          total_seconds: totalSeconds || 0,
          completed: completed || false,
        });

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
