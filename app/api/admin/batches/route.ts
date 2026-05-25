import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, slug, category, price, description, thumbnail_url, subjects, stream, class_level, duration_months } = body;
    if (!title || !slug || !category || !price) {
      return NextResponse.json({ error: "title, slug, category, price are required" }, { status: 400 });
    }
    const { data, error } = await supabaseAdmin
      .from("batches")
      .insert({
        title, slug, category, price: Number(price),
        description, thumbnail_url, stream, class_level,
        duration_months: Number(duration_months || 12),
        subjects: subjects || [],
        is_active: true,
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, batch: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(updates)) {
      if (v !== undefined) clean[k] = v;
    }
    const { data, error } = await supabaseAdmin
      .from("batches")
      .update(clean)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, batch: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
