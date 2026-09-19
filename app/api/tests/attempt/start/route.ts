import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isVpsApiEnabled } from "@/lib/api/config";
import { api } from "@/lib/api/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const testId = body.testId;
    if (!testId) return NextResponse.json({ error: "testId required" }, { status: 400 });

    if (isVpsApiEnabled()) {
      try {
        const cookieStore = await cookies();
        const token = cookieStore.get("vi_session")?.value;
        if (token) {
          const { data, error } = await api.tests.start(testId, {
            headers: { Cookie: `vi_session=${token}`, Authorization: `Bearer ${token}` },
          });
          if (!error && data?.attempt) {
            return NextResponse.json({ attempt: data.attempt });
          }
        }
      } catch {
        // Fallback to Supabase
      }
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
