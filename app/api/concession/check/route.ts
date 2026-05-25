import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const supabase = await createRouteClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabaseAdmin
      .from("concession_requests")
      .select("id, concession_type, status, discount_percent, discount_amount, is_active")
      .eq("user_id", user.id)
      .eq("status", "approved")
      .eq("is_active", true)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      hasConcession: !!data,
      concession: data || null,
    });
  } catch (err: any) {
    return NextResponse.json({ hasConcession: false, concession: null });
  }
}
