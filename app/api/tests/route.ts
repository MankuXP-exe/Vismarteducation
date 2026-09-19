import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isVpsApiEnabled } from "@/lib/api/config";
import { api } from "@/lib/api/client";

export async function GET(req: Request) {
  try {
    if (isVpsApiEnabled()) {
      try {
        const cookieStore = await cookies();
        const token = cookieStore.get("vi_session")?.value;
        if (token) {
          const { searchParams } = new URL(req.url);
          const batchId = searchParams.get("batchId") || undefined;
          const { data, error } = await api.tests.list(batchId, {
            headers: { Cookie: `vi_session=${token}`, Authorization: `Bearer ${token}` },
          });
          if (!error && data?.tests) {
            return NextResponse.json({ tests: data.tests });
          }
        }
      } catch {
        // Fallback to Supabase on VPS failure
      }
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get("batchId");
    const subjectId = searchParams.get("subjectId");

    let query = supabaseAdmin
      .from("tests")
      .select(`*, subjects(name)`)
      .or("is_published.eq.true,is_published.is.null")
      .order("created_at", { ascending: false });

    if (batchId) query = query.eq("batch_id", batchId);
    if (subjectId) query = query.eq("subject_id", subjectId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ tests: data || [] });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
