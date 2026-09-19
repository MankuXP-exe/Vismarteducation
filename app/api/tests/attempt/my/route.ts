import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isVpsApiEnabled } from "@/lib/api/config";
import { api } from "@/lib/api/client";

export async function GET() {
  try {
    if (isVpsApiEnabled()) {
      try {
        const cookieStore = await cookies();
        const token = cookieStore.get("vi_session")?.value;
        if (token) {
          const { data, error } = await api.tests.myAttempts({
            headers: { Cookie: `vi_session=${token}`, Authorization: `Bearer ${token}` },
          });
          if (!error && data?.attempts) {
            return NextResponse.json({ attempts: data.attempts });
          }
        }
      } catch {
        // Fallback to Supabase
      }
    }

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
