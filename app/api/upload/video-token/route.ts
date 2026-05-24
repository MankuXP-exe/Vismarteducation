import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hasTeacherAccess } from "@/lib/auth/roles";
import { ensureChapter, ensureSubject } from "@/lib/teacher-content";
import { createUploadToken } from "@/lib/upload-token";

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

    const body = await req.json();
    const batchId = String(body.batchId || "");
    const title = String(body.title || "").trim();
    const subjectName = String(body.subjectName || "").trim();
    const chapterTitle = String(body.chapterTitle || "").trim();

    if (!batchId || !title || !subjectName || !chapterTitle) {
      return NextResponse.json(
        { error: "Batch, subject, chapter, and title are required" },
        { status: 400 }
      );
    }

    const { data: batch } = await supabaseAdmin
      .from("batches")
      .select("id")
      .eq("id", batchId)
      .maybeSingle();

    if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });

    const subjectId = await ensureSubject(batchId, null, subjectName);
    const chapterId = await ensureChapter(batchId, subjectId, null, chapterTitle);
    const exp = Math.floor(Date.now() / 1000) + 15 * 60;

    return NextResponse.json({
      uploadUrl: `${process.env.NEXT_PUBLIC_API_URL}/upload/video`,
      subjectId,
      chapterId,
      token: createUploadToken({
        exp,
        teacherId: user.id,
        batchId,
        subjectId,
        chapterId,
      }),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
