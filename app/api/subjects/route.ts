import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const batchId = searchParams.get("batchId");

  if (!batchId) {
    return NextResponse.json({ error: "batchId is required" }, { status: 400 });
  }

  const supabase = await createRouteClient();

  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name, abbreviation")
    .eq("batch_id", batchId)
    .eq("is_active", true)
    .order("sort_order");

  if (subjects && subjects.length > 0) {
    return NextResponse.json({ subjects });
  }

  const { data: batch } = await supabase
    .from("batches")
    .select("subjects")
    .eq("id", batchId)
    .single();

  const defaultSubjects = (batch?.subjects as string[]) || [];
  return NextResponse.json({
    subjects: defaultSubjects.map((name) => ({ id: "", name, abbreviation: "" })),
  });
}
