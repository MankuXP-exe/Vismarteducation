import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST() {
  const { data, error } = await supabaseAdmin
    .from("tests")
    .update({ is_published: true })
    .is("is_published", null)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ updated: data?.length || 0, tests: data });
}
