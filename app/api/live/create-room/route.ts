import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const supabase = await createRouteClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "teacher" && profile?.role !== "admin") {
      return NextResponse.json({ error: "Teacher access required" }, { status: 403 });
    }

    const body = await req.json();
    const roomName = body.roomName || `class-${crypto.randomUUID()}`;

    const roomRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/live/create-room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-secret": process.env.VPS_API_SECRET!,
      },
      body: JSON.stringify({ roomName }),
    });

    const room = await roomRes.json();
    if (!roomRes.ok) throw new Error(room.error ?? "Unable to create room on VPS");

    const { data: liveClass, error } = await supabaseAdmin
      .from("live_classes")
      .insert({
        batch_id: body.batchId,
        subject_id: body.subjectId || null,
        chapter_id: body.chapterId || null,
        teacher_id: user.id,
        title: body.title,
        description: body.description,
        scheduled_at: body.scheduledAt,
        duration_minutes: body.durationMinutes || 60,
        hms_room_id: roomName,
        status: "scheduled",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ liveClass, room });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
