import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hasTeacherAccess } from "@/lib/auth/roles";
import { RoomServiceClient } from "livekit-server-sdk";

async function ensureChapterRecord(batchId: string, subjectId: string, title?: string) {
  const { data: maxChapter } = await supabaseAdmin
    .from("chapters")
    .select("chapter_number")
    .eq("batch_id", batchId)
    .eq("subject_id", subjectId)
    .order("chapter_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextNumber = maxChapter?.chapter_number ? String(Number(maxChapter.chapter_number) + 1) : "1";
  const chapterTitle = title || `Chapter ${nextNumber}`;

  const { data, error } = await supabaseAdmin
    .from("chapters")
    .insert({
      batch_id: batchId,
      subject_id: subjectId,
      chapter_number: nextNumber,
      title: chapterTitle,
      is_active: true,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

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
      .select("id, hms_room_id, status, batch_id, subject_id, chapter_id, title, description, teacher_id, recording_url")
      .eq("id", classId)
      .single();

    if (!liveClass) return NextResponse.json({ error: "Class not found" }, { status: 404 });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.vismartlearningeducation.com";
    const apiSecret = process.env.VPS_API_SECRET || process.env.API_SECRET || "random_secret_key_123";

    let recordingUrl = liveClass.recording_url || "";
    let thumbnailUrl = "";

    // Stop the VPS ffmpeg recording
    if (liveClass.hms_room_id) {
      const roomName = liveClass.hms_room_id;

      await fetch(`${apiUrl}/record/stop`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-secret": apiSecret },
        body: JSON.stringify({ roomName }),
      }).catch(() => {});

      // Delete LiveKit room
      try {
        const roomService = new RoomServiceClient("http://187.127.172.181:7880", "devkey", "secret");
        await roomService.deleteRoom(roomName).catch(() => {});
      } catch {}
    }

    // Poll Supabase for the recording_url (VPS ffmpeg close handler updates it)
    for (let i = 0; i < 30; i++) {
      if (recordingUrl) break;
      await new Promise((r) => setTimeout(r, 2000));
      const { data: updated } = await supabaseAdmin
        .from("live_classes")
        .select("recording_url, is_recording_available, thumbnail_url, recording_path")
        .eq("id", classId)
        .single();
      if (updated?.recording_url) {
        recordingUrl = updated.recording_url;
        thumbnailUrl = updated.thumbnail_url || "";
        break;
      }
    }

    // Update live class status
    const updateData: any = {
      status: "completed",
      ended_at: new Date().toISOString(),
    };
    if (recordingUrl) {
      updateData.recording_url = recordingUrl;
      updateData.is_recording_available = true;
    }
    if (thumbnailUrl) {
      updateData.thumbnail_url = thumbnailUrl;
    }

    await supabaseAdmin
      .from("live_classes")
      .update(updateData)
      .eq("id", classId);

    // Create lecture entry if subject exists
    if (liveClass.subject_id) {
      let chapterId = liveClass.chapter_id;
      if (!chapterId) {
        chapterId = await ensureChapterRecord(liveClass.batch_id, liveClass.subject_id, liveClass.title);
      }

      const lectureData: any = {
        batch_id: liveClass.batch_id,
        subject_id: liveClass.subject_id,
        chapter_id: chapterId,
        teacher_id: liveClass.teacher_id || user.id,
        title: liveClass.title,
        description: liveClass.description || "",
        lecture_type: "live_recording",
        is_active: true,
        published_at: new Date().toISOString(),
      };

      if (recordingUrl) {
        lectureData.cloudflare_playback_url = recordingUrl;
      }
      if (thumbnailUrl) {
        lectureData.thumbnail_url = thumbnailUrl;
      }

      await supabaseAdmin.from("lectures").insert(lectureData);
    }

    return NextResponse.json({ success: true, recordingUrl: recordingUrl || null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
