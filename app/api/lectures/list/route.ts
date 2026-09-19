import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { api } from "@/lib/api/client";
import { isVpsApiEnabled } from "@/lib/api/config";

export async function GET(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get("batchId");
    const subjectId = searchParams.get("subjectId");

    // Progressive Migration: If VPS API enabled, try it first
    if (isVpsApiEnabled()) {
      try {
        const { data, error } = await api.lectures.list({
          batchId: batchId || undefined,
          subjectId: subjectId || undefined,
        });
        if (!error && data?.lectures) {
          return NextResponse.json({ lectures: data.lectures });
        }
      } catch {
        // Fall through to Supabase
      }
    }

    let query = supabase
      .from("lectures")
      .select(`*, chapters(title), subjects(name)`)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (batchId) query = query.eq("batch_id", batchId);
    if (subjectId) query = query.eq("subject_id", subjectId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ lectures: data || [] });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
