import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabaseAdmin
      .from("test_attempts")
      .select(`*, tests(id, title, batch_id, subject_id, total_marks, duration_minutes, subjects(name))`)
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false })
      .limit(50);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ attempts: data || [] });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
