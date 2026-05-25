import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const sort = searchParams.get("sort") || "recent";
    const search = searchParams.get("q") || "";

    let query = supabase
      .from("bookmarks")
      .select(`*, lectures(id, title, cloudflare_thumbnail_url, duration_label, subject_id)`)
      .eq("user_id", user.id);

    if (search) {
      query = query.or(`note_title.ilike.%${search}%,lectures.title.ilike.%${search}%`);
    }

    if (sort === "recent") query = query.order("created_at", { ascending: false });
    else if (sort === "subject") query = query.order("lectures.subject_id");

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ bookmarks: data || [] });
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
