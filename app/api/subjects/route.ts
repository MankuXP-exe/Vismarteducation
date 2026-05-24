import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const batchId = searchParams.get("batchId");

  if (!batchId) {
    return NextResponse.json({ error: "batchId is required" }, { status: 400 });
  }

  try {
    const { data: subjects } = await supabaseAdmin
      .from("subjects")
      .select("id, name, abbreviation")
      .eq("batch_id", batchId)
      .eq("is_active", true)
      .order("sort_order");

    if (subjects && subjects.length > 0) {
      return NextResponse.json({ subjects });
    }

    const { data: batch } = await supabaseAdmin
      .from("batches")
      .select("subjects")
      .eq("id", batchId)
      .single();

    let defaultSubjects: string[] = [];
    if (batch?.subjects) {
      if (Array.isArray(batch.subjects)) {
        defaultSubjects = batch.subjects;
      } else if (typeof batch.subjects === "string") {
        defaultSubjects = (batch.subjects as string).split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    return NextResponse.json({
      subjects: defaultSubjects.map((name) => ({ id: "", name, abbreviation: "" })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
