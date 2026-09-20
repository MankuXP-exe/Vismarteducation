import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { createRouteClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isVpsApiEnabled } from "@/lib/api/config";
import { api } from "@/lib/api/client";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const classId = url.searchParams.get("classId") || url.searchParams.get("id");

    if (!classId) {
      return NextResponse.json({ error: "classId is required" }, { status: 400 });
    }

    // 1. Authenticate user
    const supabase = await createRouteClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // 2. Fetch live class
    const { data: liveClass, error: classError } = await supabaseAdmin
      .from("live_classes")
      .select("*")
      .eq("id", classId)
      .single();

    if (classError || !liveClass) {
      return NextResponse.json({ error: "Live class not found" }, { status: 404 });
    }

    // 3. Fetch user profile role
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role || "student";

    // 4. Enrollment check for students
    if (role === "student") {
      const { data: enrollment } = await supabaseAdmin
        .from("enrollments")
        .select("id")
        .eq("student_id", user.id)
        .eq("batch_id", liveClass.batch_id)
        .eq("status", "active")
        .maybeSingle();

      if (!enrollment) {
        return NextResponse.json(
          { error: "Forbidden: Active batch enrollment required for recording access" },
          { status: 403 }
        );
      }
    }

    // 5. Resolve recording path on disk
    let filePath = liveClass.recording_path;
    if (!filePath || !fs.existsSync(filePath)) {
      const roomName = liveClass.hms_room_id || `class-${liveClass.id}`;
      const candidateDirs = [
        `/opt/vi-smart/recordings/live/live/${roomName}`,
        `/opt/vi-smart/recordings/live/${roomName}`,
      ];
      for (const dir of candidateDirs) {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir).filter((f) => f.includes(".mp4"));
          if (files.length > 0) {
            filePath = path.join(dir, files[0]);
            break;
          }
        }
      }
    }

    if (!filePath || !fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Recording file not found" }, { status: 404 });
    }

    // 6. Return response with X-Accel-Redirect for Nginx, or byte-range stream fallback
    const relativePath = filePath.replace("/opt/vi-smart/recordings/", "");
    const headers = new Headers();
    headers.set("X-Accel-Redirect", `/internal-recordings/${relativePath}`);
    headers.set("Access-Control-Allow-Origin", "https://vismartlearningeducation.com");
    headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Range, Authorization, Content-Type");
    headers.set("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");
    headers.set("Accept-Ranges", "bytes");

    return new NextResponse(null, { status: 200, headers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
