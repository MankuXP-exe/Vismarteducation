import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hasTeacherAccess } from "@/lib/auth/roles";

function abbreviationFromName(name: string) {
  const letters = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 6)
    .toUpperCase();
  return letters || "GEN";
}

async function ensureSubject(batchId: string, subjectId: string | null, subjectName: string | null) {
  if (subjectId) return subjectId;

  const name = subjectName?.trim() || "General";
  const { data: existing } = await supabaseAdmin
    .from("subjects")
    .select("id")
    .eq("batch_id", batchId)
    .ilike("name", name)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data, error } = await supabaseAdmin
    .from("subjects")
    .insert({
      batch_id: batchId,
      name,
      abbreviation: abbreviationFromName(name),
      sort_order: 0,
      is_active: true,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

async function ensureChapter(
  batchId: string,
  subjectId: string,
  chapterId: string | null,
  chapterTitle: string | null
) {
  if (chapterId) return chapterId;

  const title = chapterTitle?.trim() || "General";
  const { data: existing } = await supabaseAdmin
    .from("chapters")
    .select("id")
    .eq("batch_id", batchId)
    .eq("subject_id", subjectId)
    .ilike("title", title)
    .order("created_at", { ascending: true })
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
      title,
      sort_order: 0,
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
      .select("role")
      .eq("id", user.id)
      .single();

    if (!hasTeacherAccess(user, profile)) {
      return NextResponse.json({ error: "Teacher access required" }, { status: 403 });
    }

    const formData = await req.formData();
    const batchId = String(formData.get("batchId") || "");
    const title = String(formData.get("title") || "").trim();

    if (!batchId || !title) {
      return NextResponse.json({ error: "Batch and title are required" }, { status: 400 });
    }

    const { data: batch } = await supabaseAdmin
      .from("batches")
      .select("id")
      .eq("id", batchId)
      .maybeSingle();

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    const subjectId = await ensureSubject(
      batchId,
      (formData.get("subjectId") as string | null) || null,
      (formData.get("subjectName") as string | null) || null
    );
    const chapterId = await ensureChapter(
      batchId,
      subjectId,
      (formData.get("chapterId") as string | null) || null,
      (formData.get("chapterTitle") as string | null) || null
    );

    formData.set("teacherId", user.id);
    formData.set("subjectId", subjectId);
    formData.set("chapterId", chapterId);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.vismartlearningeducation.com";
    const apiSecret = process.env.VPS_API_SECRET || process.env.API_SECRET || "random_secret_key_123";

    const res = await fetch(`${apiUrl}/upload/video`, {
      method: "POST",
      headers: { "x-api-secret": apiSecret },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });

  if (!data.lecture && data.videoUrl) {
    const { data: lecture, error } = await supabaseAdmin
      .from("lectures")
      .insert({
        title,
        description: String(formData.get("description") || ""),
        batch_id: batchId,
        subject_id: subjectId,
        chapter_id: chapterId,
        teacher_id: user.id,
        cloudflare_playback_url: data.videoUrl,
        cloudflare_thumbnail_url: data.thumbnailUrl || null,
        duration_seconds: data.durationSeconds || 0,
        duration_label: data.durationLabel || null,
        sort_order: Number(formData.get("sortOrder") || 0),
        is_active: true,
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    data.lecture = lecture;
  }

  return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
