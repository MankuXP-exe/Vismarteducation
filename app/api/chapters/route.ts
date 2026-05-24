import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get("subjectId");

  if (!subjectId) {
    return NextResponse.json({ error: "subjectId is required" }, { status: 400 });
  }

  const supabase = await createRouteClient();
  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, title, chapter_number")
    .eq("subject_id", subjectId)
    .eq("is_active", true)
    .order("sort_order");

  return NextResponse.json({ chapters: chapters || [] });
}
