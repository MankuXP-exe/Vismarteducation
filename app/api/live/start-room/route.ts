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
    if (liveClass.status !== "scheduled") {
      return NextResponse.json({ error: "Class has already started or ended" }, { status: 400 });
    }

    const roomName = liveClass.hms_room_id;
    const hlsUrl = `https://stream.vismartlearningeducation.com/live/live/${roomName}/index.m3u8`;

    await supabaseAdmin
      .from("live_classes")
      .update({
        status: "live",
        started_at: new Date().toISOString(),
        hls_url: hlsUrl,
      })
      .eq("id", classId);

    return NextResponse.json({ success: true, hlsUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
