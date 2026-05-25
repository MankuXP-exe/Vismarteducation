import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data: badges } = await supabaseAdmin
      .from("badges")
      .select("*")
      .order("requirement_value");

    return NextResponse.json({ badges: badges || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
