import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hasTeacherAccess } from "@/lib/auth/roles";

async function ensureChapterRecord(batchId: string, subjectId: string) {
  const { data: existing } = await supabaseAdmin
    .from("chapters")
    .select("id")
    .eq("batch_id", batchId)
    .eq("subject_id", subjectId)
    .eq("is_active", true)
    .order("chapter_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data: maxChapter } = await supabaseAdmin
    .from("chapters")
    .select("chapter_number")
    .eq("batch_id", batchId)
    .eq("subject_id", subjectId)
    .order("chapter_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextNumber = maxChapter?.chapter_number ? String(Number(maxChapter.chapter_number) + 1) : "1";

  const { data, error } = await supabaseAdmin
    .from("chapters")
    .insert({
      batch_id: batchId,
      subject_id: subjectId,
      chapter_number: nextNumber,
      title: `Chapter ${nextNumber}`,
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
      .select("id, hms_room_id, status, batch_id, subject_id, chapter_id, title, description, teacher_id")
      .eq("id", classId)
      .single();

    if (!liveClass) return NextResponse.json({ error: "Class not found" }, { status: 404 });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.vismartlearningeducation.com";
    const apiSecret = process.env.VPS_API_SECRET || process.env.API_SECRET || "random_secret_key_123";

    // Stop VPS recording and delete LiveKit room
    if (liveClass.hms_room_id) {
      await fetch(`${apiUrl}/record/stop`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-secret": apiSecret },
        body: JSON.stringify({ roomName: liveClass.hms_room_id }),
      }).catch(() => {});

      await fetch(`${apiUrl}/live/end-room`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-secret": apiSecret },
        body: JSON.stringify({ roomName: liveClass.hms_room_id }),
      }).catch(() => {});
    }

    // Wait briefly for recording to finalize
    await new Promise((r) => setTimeout(r, 1500));

    // Check if recording was saved
    let recordingUrl = "";
    let thumbnailUrl = "";
    if (liveClass.hms_room_id) {
      const statusRes = await fetch(`${apiUrl}/record/status/${liveClass.hms_room_id}`, {
        headers: { "x-api-secret": apiSecret },
      }).catch(() => null);
      if (statusRes && statusRes.ok) {
        const statusData = await statusRes.json();
        if (statusData.isRecording) {
          await fetch(`${apiUrl}/record/stop`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-api-secret": apiSecret },
            body: JSON.stringify({ roomName: liveClass.hms_room_id }),
          }).catch(() => {});
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
      // Check if file exists via list endpoint
      const listRes = await fetch(`${apiUrl}/record/list/${liveClass.batch_id}`, {
        headers: { "x-api-secret": apiSecret },
      }).catch(() => null);
      if (listRes && listRes.ok) {
        const listData = await listRes.json();
        const match = (listData.recordings || []).find((r: any) =>
          r.fileName && r.fileName.includes(liveClass.id.replace(/-/g, ""))
        );
        if (match) {
          recordingUrl = match.url;
        }
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

    await supabaseAdmin
      .from("live_classes")
      .update(updateData)
      .eq("id", classId);

    // Create lecture entry if subject exists
    if (liveClass.subject_id) {
      let chapterId = liveClass.chapter_id;
      if (!chapterId) {
        chapterId = await ensureChapterRecord(liveClass.batch_id, liveClass.subject_id);
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
        lectureData.video_url = recordingUrl;
      }

      await supabaseAdmin.from("lectures").insert(lectureData);
    }

    return NextResponse.json({ success: true, recordingUrl: recordingUrl || null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
