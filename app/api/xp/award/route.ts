import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";
import { awardXP, getUserXP, type XPAction } from "@/lib/xp";

export async function POST(req: Request) {
  try {
    const supabase = await createRouteClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action, metadata } = await req.json();
    if (!action) return NextResponse.json({ error: "Action required" }, { status: 400 });

    const result = await awardXP(user.id, action as XPAction, metadata || {});
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
