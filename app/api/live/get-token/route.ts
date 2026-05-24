import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createRouteClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { classId, role } = await req.json();
    const { data: liveClass } = await supabase
      .from("live_classes")
      .select("*, batch:batches(title)")
      .eq("id", classId)
      .single();

    if (!liveClass) return NextResponse.json({ error: "Class not found" }, { status: 404 });

    if (role === "student") {
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id, status")
        .eq("student_id", user.id)
        .eq("batch_id", liveClass.batch_id)
        .eq("status", "active")
        .single();

      if (!enrollment) {
        return NextResponse.json({ error: "Not enrolled in this batch" }, { status: 403 });
      }
    }

    if (role === "teacher") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role !== "teacher" && profile?.role !== "admin") {
        return NextResponse.json({ error: "Teacher access required" }, { status: 403 });
      }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const tokenRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/live/${role === "teacher" ? "teacher-token" : "student-token"}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-secret": process.env.VPS_API_SECRET!,
        },
        body: JSON.stringify({
          roomName: liveClass.hms_room_id || classId,
          [`${role}Name`]: profile?.full_name || user.email,
          [`${role}Id`]: user.id,
        }),
      }
    );

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      return NextResponse.json(
        { error: tokenData.error ?? "Unable to create LiveKit token" },
        { status: tokenRes.status }
      );
    }

    return NextResponse.json({
      token: tokenData.token,
      roomName: liveClass.hms_room_id || classId,
      classTitle: liveClass.title,
      livekitUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
