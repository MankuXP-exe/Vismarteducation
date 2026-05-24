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
      .select("role, full_name")
      .eq("id", user.id)
      .single();

    if (!hasTeacherAccess(user, profile)) {
      return NextResponse.json({ error: "Teacher access required" }, { status: 403 });
    }

    const body = await req.json();
    if (!body.batchId) {
      return NextResponse.json({ error: "batchId is required" }, { status: 400 });
    }

    const roomName = `class-${crypto.randomUUID()}`;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.vismartlearningeducation.com";
    const apiSecret = process.env.VPS_API_SECRET || process.env.API_SECRET || "random_secret_key_123";

    const roomRes = await fetch(`${apiUrl}/live/create-room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-secret": apiSecret,
      },
      body: JSON.stringify({ roomName }),
    });

    if (!roomRes.ok) {
      const roomErr = await roomRes.json();
      throw new Error(roomErr.error ?? "Unable to create room on VPS");
    }

    const { data: liveClass, error } = await supabaseAdmin
      .from("live_classes")
      .insert({
        batch_id: body.batchId,
        teacher_id: user.id,
        title: body.title || "Instant Live Class",
        description: body.description || "",
        scheduled_at: new Date().toISOString(),
        duration_minutes: body.durationMinutes || 60,
        hms_room_id: roomName,
        status: "live",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ liveClass });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
