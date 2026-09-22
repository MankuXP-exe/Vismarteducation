import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { createRouteClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hasTeacherAccess } from "@/lib/auth/roles";
import { isVpsApiEnabled } from "@/lib/api/config";
import { api } from "@/lib/api/client";

async function ensureChapterRecord(batchId: string, subjectId: string, title?: string) {
  const { data: maxChapter } = await supabaseAdmin
    ['from']("chapters")
    .select("chapter_number")
    .eq("batch_id", batchId)
    .eq("subject_id", subjectId)
    .order("chapter_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextNumber = maxChapter?.chapter_number ? String(Number(maxChapter.chapter_number) + 1) : "1";
  const chapterTitle = title || `Chapter ${nextNumber}`;

  const { data, error } = await supabaseAdmin
    ['from']("chapters")
    .insert({ batch_id: batchId, subject_id: subjectId, chapter_number: nextNumber, title: chapterTitle, is_active: true })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

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
          const { data, error } = await api.live.end(classId, { headers });
          if (!error && data) {
            return NextResponse.json({ success: true, liveClass: data.liveClass, status: data.status });
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
      ['from']("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!hasTeacherAccess(user, profile)) {
      return NextResponse.json({ error: "Teacher access required" }, { status: 403 });
    }

    const { data: liveClass } = await supabaseAdmin
      ['from']("live_classes")
      .select("id, hms_room_id, status, batch_id, subject_id, chapter_id, title, description, teacher_id, recording_url")
      .eq("id", classId)
      .single();

    if (!liveClass) return NextResponse.json({ error: "Class not found" }, { status: 404 });

    // If already completed/cancelled, return success (idempotent)
    if (liveClass.status === "completed" || liveClass.status === "cancelled") {
      return NextResponse.json({ success: true, status: liveClass.status });
    }

    if (liveClass.status !== "live") {
      return NextResponse.json({ error: "Class is not currently live" }, { status: 400 });
    }

    // Mark as completed immediately
    await supabaseAdmin
      ['from']("live_classes")
      .update({ status: "completed", ended_at: new Date().toISOString() })
      .eq("id", classId);

    const response = NextResponse.json({ success: true, processing: true });

    // Async: poll for recording URL set by MediaMTX webhook or local filesystem
    (async () => {
      const roomName = liveClass.hms_room_id || `class-${liveClass.id}`;
      let recordingUrl = liveClass.recording_url || "";
      let recordingPath = "";
      let fileSizeMb = 0;

      for (let i = 0; i < 30 && !recordingUrl; i++) {
        await new Promise((r) => setTimeout(r, 2000));

        // Check local filesystem first if running on VPS
        const candidateDirs = [
          `/opt/vi-smart/recordings/live/live/${roomName}`,
          `/opt/vi-smart/recordings/live/${roomName}`,
        ];
        for (const dir of candidateDirs) {
          try {
            if (fs.existsSync(dir)) {
              const files = fs.readdirSync(dir).filter((f) => f.includes(".mp4"));
              if (files.length > 0) {
                const sorted = files.map((f) => ({
                  file: f,
                  fullPath: path.join(dir, f),
                  stat: fs.statSync(path.join(dir, f)),
                })).filter(item => item.stat.size > 0).sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);

                if (sorted.length > 0) {
                  const latest = sorted[0];
                  recordingPath = latest.fullPath;
                  fileSizeMb = Math.round((latest.stat.size / (1024 * 1024)) * 100) / 100;
                  const relativePath = latest.fullPath.replace("/opt/vi-smart/recordings/", "");
                  recordingUrl = `https://stream.vismartlearningeducation.com/recordings/${relativePath}`;
                  break;
                }
              }
            }
          } catch {}
        }

        if (!recordingUrl) {
          const { data: updated } = await supabaseAdmin
            ['from']("live_classes")
            .select("recording_url, is_recording_available")
            .eq("id", classId)
            .single();
          if (updated?.recording_url) {
            recordingUrl = updated.recording_url;
            break;
          }
        }
      }

      if (recordingUrl) {
        await supabaseAdmin
          ['from']("live_classes")
          .update({ recording_url: recordingUrl, is_recording_available: true })
          .eq("id", classId);

        if (liveClass.subject_id) {
          let chapterId = liveClass.chapter_id;
          if (!chapterId) {
            chapterId = await ensureChapterRecord(liveClass.batch_id, liveClass.subject_id, liveClass.title);
          }

          await supabaseAdmin['from']("lectures").insert({
            batch_id: liveClass.batch_id,
            subject_id: liveClass.subject_id,
            chapter_id: chapterId,
            teacher_id: liveClass.teacher_id || user.id,
            title: liveClass.title,
            description: liveClass.description || "",
            lecture_type: "live_recording",
            is_active: true,
            published_at: new Date().toISOString(),
            cloudflare_playback_url: recordingUrl,
          });
        }
      }
    })();

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
