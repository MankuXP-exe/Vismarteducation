import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";
import { getUserXP } from "@/lib/xp";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createRouteClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await getUserXP(user.id);
    if (!data) return NextResponse.json({ error: "No XP data yet" }, { status: 404 });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
