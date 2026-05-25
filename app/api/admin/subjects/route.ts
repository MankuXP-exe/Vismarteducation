import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("batches")
      .select("id, title, slug, category, subjects")
      .order("title");

    if (error) throw error;

    const grouped: Record<string, { id: string; title: string; subjects: string[] }> = {};
    for (const batch of data ?? []) {
      grouped[batch.id] = {
        id: batch.id,
        title: batch.title,
        subjects: batch.subjects || [],
      };
    }

    return NextResponse.json({ success: true, batches: data, grouped });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { batchId, name } = await req.json();
    if (!batchId || !name) {
      return NextResponse.json({ error: "batchId and name are required" }, { status: 400 });
    }

    const { data: batch, error: fetchError } = await supabaseAdmin
      .from("batches")
      .select("subjects")
      .eq("id", batchId)
      .single();

    if (fetchError) throw fetchError;

    const current: string[] = batch?.subjects || [];
    if (current.includes(name.trim())) {
      return NextResponse.json({ error: "Subject already exists in this batch" }, { status: 409 });
    }

    const { error: updateError } = await supabaseAdmin
      .from("batches")
      .update({ subjects: [...current, name.trim()] })
      .eq("id", batchId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, subjects: [...current, name.trim()] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { batchId, name } = await req.json();
    if (!batchId || !name) {
      return NextResponse.json({ error: "batchId and name are required" }, { status: 400 });
    }

    const { data: batch, error: fetchError } = await supabaseAdmin
      .from("batches")
      .select("subjects")
      .eq("id", batchId)
      .single();

    if (fetchError) throw fetchError;

    const current: string[] = batch?.subjects || [];
    const updated = current.filter((s) => s !== name.trim());

    const { error: updateError } = await supabaseAdmin
      .from("batches")
      .update({ subjects: updated })
      .eq("id", batchId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, subjects: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
