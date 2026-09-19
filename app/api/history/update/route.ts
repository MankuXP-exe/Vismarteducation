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
          const { lectureId, watchedSeconds, totalSeconds, completed } = body;
          if (!lectureId) return NextResponse.json({ error: "lectureId required" }, { status: 400 });

          const authHeaders = { Cookie: `vi_session=${token}`, Authorization: `Bearer ${token}` };
          await Promise.all([
            api.lectures.updateProgress(
              lectureId,
              { watchedSeconds: watchedSeconds || 0, totalSeconds: totalSeconds || 0 },
              { headers: authHeaders }
            ),
            api.history.record(
              { lectureId, watchedSeconds, totalSeconds, completed },
              { headers: authHeaders }
            ),
          ]);
          return NextResponse.json({ success: true });
        }
      } catch {
        // Fallback to Supabase on failure
      }
    }

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
