import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { api } from "@/lib/api/client";
import { isVpsApiEnabled } from "@/lib/api/config";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get("subjectId");
  const batchId = searchParams.get("batchId");

  if (!subjectId) {
    return NextResponse.json({ error: "subjectId is required" }, { status: 400 });
  }

  // Progressive Migration: If VPS API enabled, try it first
  if (isVpsApiEnabled()) {
    try {
      const { data, error } = await api.batches.getChapters(subjectId);
      if (!error && data?.chapters) {
        return NextResponse.json({ chapters: data.chapters });
      }
    } catch {
      // Fall through to Supabase
    }
  }

  const query = supabaseAdmin
    .from("chapters")
    .select("id, title, chapter_number, is_active")
    .eq("subject_id", subjectId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (batchId) query.eq("batch_id", batchId);

  const { data: chapters } = await query;

  return NextResponse.json({ chapters: chapters || [] });
}
