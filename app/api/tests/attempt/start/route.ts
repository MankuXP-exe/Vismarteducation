import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { testId } = await req.json();
    if (!testId) return NextResponse.json({ error: "testId required" }, { status: 400 });

    // Check if already attempted
    const { data: existing } = await supabaseAdmin
      .from("test_attempts")
      .select("id, submitted_at")
      .eq("user_id", user.id)
      .eq("test_id", testId)
      .maybeSingle();

    if (existing?.submitted_at) {
      return NextResponse.json({ error: "Test already submitted" }, { status: 400 });
    }

    if (existing) {
      // Resume
      return NextResponse.json({ attempt: existing });
    }

    const { data, error } = await supabaseAdmin
      .from("test_attempts")
      .insert({ user_id: user.id, test_id: testId })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ attempt: data });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
