import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title, slug, category, price, original_price, description,
      thumbnail_url, banner_url, subjects, stream, class_level,
      duration_months, badge, is_featured, teacher_name,
      has_live_classes, has_recorded_lectures, has_notes, has_doubt_support, has_tests,
      army_discount_percent, disabled_discount_percent, single_parent_flat_price,
    } = body;
    if (!title || !slug || !category || !price) {
      return NextResponse.json({ error: "title, slug, category, price are required" }, { status: 400 });
    }
    const { data, error } = await supabaseAdmin
      .from("batches")
      .insert({
        title, slug, category, price: Number(price),
        original_price: original_price ? Number(original_price) : undefined,
        description, thumbnail_url, banner_url, stream, class_level,
        duration_months: Number(duration_months || 12),
        subjects: subjects || [],
        badge, is_featured: is_featured ?? false,
        teacher_name,
        has_live_classes: has_live_classes ?? true,
        has_recorded_lectures: has_recorded_lectures ?? true,
        has_notes: has_notes ?? true,
        has_doubt_support: has_doubt_support ?? true,
        has_tests: has_tests ?? false,
        army_discount_percent: army_discount_percent ?? 50,
        disabled_discount_percent: disabled_discount_percent ?? 50,
        single_parent_flat_price: single_parent_flat_price ? Number(single_parent_flat_price) : 5000,
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
