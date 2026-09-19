import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isVpsApiEnabled } from "@/lib/api/config";
import { api } from "@/lib/api/client";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const testId = body.testId || body.test_id;
    if (!testId) return NextResponse.json({ error: "testId required" }, { status: 400 });

    if (isVpsApiEnabled()) {
      try {
        const cookieStore = await cookies();
        const token = cookieStore.get("vi_session")?.value;
        if (token) {
          const headers = { Cookie: `vi_session=${token}`, Authorization: `Bearer ${token}` };
          const isPublished = body.publish !== undefined ? body.publish : body.is_published;
          const { data, error } = await api.tests.publish(testId, isPublished ?? true, { headers });
          if (!error && data?.test) {
            return NextResponse.json({ test: data.test });
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
      .from("tests")
      .update({ is_published: body.publish ?? true })
      .eq("id", testId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ test: data });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
