import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hasTeacherAccess } from "@/lib/auth/roles";

function abbreviationFromName(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 6)
    .toUpperCase() || "GEN";
}

async function ensureSubject(batchId: string, subjectId?: string, subjectName?: string) {
  if (subjectId) return subjectId;
  const name = subjectName?.trim();
  if (!name) return null;

  const { data: existing } = await supabaseAdmin
    .from("subjects")
    .select("id")
    .eq("batch_id", batchId)
    .ilike("name", name)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data, error } = await supabaseAdmin
    .from("subjects")
    .insert({
      batch_id: batchId,
      name,
      abbreviation: abbreviationFromName(name),
      is_active: true,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

async function ensureChapter(batchId: string, subjectId: string | null, chapterId?: string, chapterTitle?: string) {
  if (chapterId) return chapterId;
  const title = chapterTitle?.trim();
  if (!title || !subjectId) return null;

  const { data: existing } = await supabaseAdmin
    .from("chapters")
    .select("id")
    .eq("batch_id", batchId)
    .eq("subject_id", subjectId)
    .ilike("title", title)
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
      title,
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
    const {
      data: { user },
    } = await supabase.auth.getUser();

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
    if (!body.batchId || !body.title || !body.scheduledAt) {
      return NextResponse.json({ error: "Batch, title, and schedule time are required" }, { status: 400 });
    }

    const subjectId = await ensureSubject(body.batchId, body.subjectId, body.subjectName);
    const chapterId = await ensureChapter(body.batchId, subjectId, body.chapterId, body.chapterTitle);
    const roomName = body.roomName || `class-${crypto.randomUUID()}`;

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

    const room = await roomRes.json();
    if (!roomRes.ok) throw new Error(room.error ?? "Unable to create room on VPS");

    const { data: liveClass, error } = await supabaseAdmin
      .from("live_classes")
      .insert({
        batch_id: body.batchId,
        subject_id: subjectId,
        chapter_id: chapterId,
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
