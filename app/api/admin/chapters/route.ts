import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";

async function checkAccess() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized", status: 401 };

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role || user?.app_metadata?.role || user?.user_metadata?.role;
  if (role !== "teacher" && role !== "admin") return { error: "Forbidden", status: 403 };

  return null;
}

export async function POST(req: Request) {
  const denied = await checkAccess();
  if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

  try {
    const { batchId, subjectId, title, chapterNumber } = await req.json();
    if (!batchId || !subjectId || !title) {
      return NextResponse.json({ error: "batchId, subjectId, and title required" }, { status: 400 });
    }

    const { data: maxChapter } = await supabaseAdmin
      .from("chapters")
      .select("chapter_number")
      .eq("batch_id", batchId)
      .eq("subject_id", subjectId)
      .order("chapter_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextNumber = chapterNumber || (maxChapter?.chapter_number ? String(Number(maxChapter.chapter_number) + 1) : "1");

    const { data, error } = await supabaseAdmin
      .from("chapters")
      .insert({
        batch_id: batchId,
        subject_id: subjectId,
        chapter_number: nextNumber,
        title: title.trim(),
        sort_order: 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, chapter: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const denied = await checkAccess();
  if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

  try {
    const { chapterId, title, chapterNumber } = await req.json();
    if (!chapterId) return NextResponse.json({ error: "chapterId required" }, { status: 400 });

    const updates: Record<string, any> = {};
    if (title !== undefined) updates.title = title.trim();
    if (chapterNumber !== undefined) updates.chapter_number = String(chapterNumber);

    const { data, error } = await supabaseAdmin
      .from("chapters")
      .update(updates)
      .eq("id", chapterId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, chapter: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const denied = await checkAccess();
  if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

  try {
    const { chapterId } = await req.json();
    if (!chapterId) return NextResponse.json({ error: "chapterId required" }, { status: 400 });

    const { error } = await supabaseAdmin
      .from("chapters")
      .update({ is_active: false })
      .eq("id", chapterId);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
