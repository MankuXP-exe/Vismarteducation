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

    const formData = await req.formData();
    const lectureId = String(formData.get("lectureId") || "");
    const batchId = String(formData.get("batchId") || "");
    const file = formData.get("file") as File | null;

    if (!lectureId || !file) {
      return NextResponse.json({ error: "lectureId and file are required" }, { status: 400 });
    }

    // Get existing lecture info
    const { data: lecture } = await supabaseAdmin
      .from("lectures")
      .select("id, batch_id, subject_id, chapter_id, title, teacher_id")
      .eq("id", lectureId)
      .single();

    if (!lecture) return NextResponse.json({ error: "Lecture not found" }, { status: 404 });

    // Upload file to VPS
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.vismartlearningeducation.com";
    const apiSecret = process.env.VPS_API_SECRET || process.env.API_SECRET || "random_secret_key_123";

    const vpsForm = new FormData();
    vpsForm.append("file", file);
    vpsForm.append("batchId", lecture.batch_id);
    vpsForm.append("subjectId", lecture.subject_id);
    vpsForm.append("chapterId", lecture.chapter_id);
    vpsForm.append("title", lecture.title);
    vpsForm.append("teacherId", lecture.teacher_id || user.id);
    vpsForm.append("description", formData.get("description") as string || "");

    const res = await fetch(`${apiUrl}/upload/video`, {
      method: "POST",
      headers: { "x-api-secret": apiSecret },
      body: vpsForm,
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.error || "Upload to VPS failed" }, { status: res.status });
    }

    // Update existing lecture with video URL
    const videoUrl = data.videoUrl || data.cloudflare_playback_url;
    if (videoUrl) {
      await supabaseAdmin
        .from("lectures")
        .update({
          cloudflare_playback_url: videoUrl,
          cloudflare_thumbnail_url: data.thumbnailUrl || data.cloudflare_thumbnail_url || null,
          duration_seconds: data.durationSeconds || 0,
          duration_label: data.durationLabel || null,
          published_at: new Date().toISOString(),
        })
        .eq("id", lectureId);
    }

    return NextResponse.json({ success: true, videoUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
