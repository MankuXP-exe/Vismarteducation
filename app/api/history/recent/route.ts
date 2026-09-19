import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { isVpsApiEnabled } from "@/lib/api/config";
import { api } from "@/lib/api/client";

export async function GET() {
  try {
    if (isVpsApiEnabled()) {
      try {
        const cookieStore = await cookies();
        const token = cookieStore.get("vi_session")?.value;
        if (token) {
          const { data, error } = await api.history.list({
            headers: { Cookie: `vi_session=${token}`, Authorization: `Bearer ${token}` },
          });
          if (!error && data?.history) {
            return NextResponse.json({ history: data.history });
          }
        }
      } catch {
        // Fallback to Supabase on failure
      }
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("watch_history")
      .select(`*, lectures(id, title, cloudflare_thumbnail_url, cloudflare_playback_url, duration_label, subject_id)`)
      .eq("user_id", user.id)
      .order("last_watched_at", { ascending: false })
      .limit(20);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ history: data || [] });
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
