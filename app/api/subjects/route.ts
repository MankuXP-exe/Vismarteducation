import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { api } from "@/lib/api/client";
import { isVpsApiEnabled } from "@/lib/api/config";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const batchId = searchParams.get("batchId");

  if (!batchId) {
    return NextResponse.json({ error: "batchId is required" }, { status: 400 });
  }

  // Progressive Migration: If VPS API enabled, try it first
  if (isVpsApiEnabled()) {
    try {
      const { data, error } = await api.batches.getSubjects(batchId);
      if (!error && data?.subjects && data.subjects.length > 0) {
        return NextResponse.json({ subjects: data.subjects });
      }
    } catch {
      // Fall through to Supabase
    }
  }

  try {
      const { data: subjects } = await supabaseAdmin
      .from("subjects")
      .select("id, name, abbreviation, batch_id")
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

    let defaultSubjects: { id: string; name: string; abbreviation: string; batch_id: string }[] = [];
    if (batch?.subjects) {
      const names: string[] = Array.isArray(batch.subjects)
        ? batch.subjects
        : typeof batch.subjects === "string"
          ? (batch.subjects as string).split(",").map((s) => s.trim()).filter(Boolean)
          : [];
      defaultSubjects = names.map((name) => ({ id: "", name, abbreviation: "", batch_id: batchId }));
    }

    return NextResponse.json({ subjects: defaultSubjects });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
