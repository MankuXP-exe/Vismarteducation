import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isVpsApiEnabled } from "@/lib/api/config";
import { api } from "@/lib/api/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (isVpsApiEnabled()) {
      try {
        const cookieStore = await cookies();
        const token = cookieStore.get("vi_session")?.value;
        if (token) {
          const headers = { Cookie: `vi_session=${token}`, Authorization: `Bearer ${token}` };
          const { data, error } = await api.tests.create({
            batch_id: body.batchId || body.batch_id,
            subject_id: body.subjectId || body.subject_id || undefined,
            title: body.title,
            description: body.description,
            duration_minutes: body.durationMinutes || body.duration_minutes,
            total_marks: body.totalMarks || body.total_marks,
            negative_marking: body.negativeMarking || body.negative_marking,
            pass_percentage: body.passPercentage || body.pass_percentage,
            starts_at: body.startsAt || body.starts_at,
            ends_at: body.endsAt || body.ends_at,
          }, { headers });
          if (!error && data?.test) {
            return NextResponse.json({ test: data.test });
          }
        }
      } catch {
        // Fallback to Supabase
      }
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { batchId, subjectId, title, description, durationMinutes, totalMarks, negativeMarking, passPercentage, startsAt, endsAt } = body;
    if (!batchId || !title) return NextResponse.json({ error: "batchId and title required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("tests")
      .insert({
        batch_id: batchId,
        subject_id: subjectId || null,
        title,
        description: description || "",
        duration_minutes: durationMinutes || 60,
        total_marks: totalMarks || 0,
        negative_marking: negativeMarking || 0,
        pass_percentage: passPercentage || 40,
        is_published: true,
        starts_at: startsAt || null,
        ends_at: endsAt || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ test: data });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
