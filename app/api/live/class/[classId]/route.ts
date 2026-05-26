import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    if (!classId) {
      return NextResponse.json({ error: "classId is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("live_classes")
      .select("*, batch:batches(title)")
      .eq("id", classId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
