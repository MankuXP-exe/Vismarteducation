import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hasTeacherAccess } from "@/lib/auth/roles";

export async function POST(req: Request) {
  try {
    const supabase = await createRouteClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!hasTeacherAccess(user, profile)) {
      return NextResponse.json({ error: "Teacher access required" }, { status: 403 });
    }

    const { classId } = await req.json();
    if (!classId) return NextResponse.json({ error: "classId is required" }, { status: 400 });

    const { data: liveClass } = await supabaseAdmin
      .from("live_classes")
      .select("id, hms_room_id, status")
      .eq("id", classId)
      .single();

    if (!liveClass) return NextResponse.json({ error: "Class not found" }, { status: 404 });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.vismartlearningeducation.com";
    const apiSecret = process.env.VPS_API_SECRET || process.env.API_SECRET || "random_secret_key_123";

    if (liveClass.hms_room_id) {
      await fetch(`${apiUrl}/live/end-room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-secret": apiSecret,
        },
        body: JSON.stringify({ roomName: liveClass.hms_room_id }),
      }).catch(() => {});
    }

    const { error } = await supabaseAdmin
      .from("live_classes")
      .update({
        status: "completed",
        ended_at: new Date().toISOString(),
      })
      .eq("id", classId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
