import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { api } from "@/lib/api/client";
import { isVpsApiEnabled } from "@/lib/api/config";

export async function GET(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    // Progressive Migration: If VPS API enabled, try it first
    if (isVpsApiEnabled()) {
      try {
        const { data, error } = await api.notes.list({ type: type || undefined });
        if (!error && data?.materials) {
          return NextResponse.json({ materials: data.materials });
        }
      } catch {
        // Fall through to Supabase
      }
    }

    let query = supabaseAdmin
      .from("study_materials")
      .select("*, batches(title), subjects(name), chapters(title)")
      .order("created_at", { ascending: false });

    if (type) query = query.eq("material_type", type);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ materials: data || [] });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
