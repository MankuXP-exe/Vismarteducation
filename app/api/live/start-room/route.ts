import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hasTeacherAccess } from "@/lib/auth/roles";
import { isVpsApiEnabled } from "@/lib/api/config";
import { api } from "@/lib/api/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const classId = body.classId || body.id;
    if (!classId) return NextResponse.json({ error: "classId is required" }, { status: 400 });

    if (isVpsApiEnabled()) {
      try {
        const cookieStore = await cookies();
        const token = cookieStore.get("vi_session")?.value;
        if (token) {
          const headers = { Cookie: `vi_session=${token}`, Authorization: `Bearer ${token}` };
          const { data, error } = await api.live.start(classId, { headers });
          if (!error && data) {
            const roomName = data.publishing?.roomName || data.liveClass?.hms_room_id;
            const hlsUrl = data.hlsUrl || `https://stream.vismartlearningeducation.com/live/live/${roomName}/index.m3u8`;
            return NextResponse.json({
              success: true,
              hlsUrl,
              liveClass: data.liveClass,
              publishing: data.publishing,
            });
          }
        }
      } catch {
        // Fallback to Supabase
      }
    }

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
