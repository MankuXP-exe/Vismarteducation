import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [weekly, alltime] = await Promise.all([
      supabaseAdmin
        .from("weekly_leaderboard")
        .select("*")
        .limit(50),
      supabaseAdmin
        .from("alltime_leaderboard")
        .select("*")
        .limit(50),
    ]);

    return NextResponse.json({
      weekly: weekly.data || [],
      alltime: alltime.data || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
