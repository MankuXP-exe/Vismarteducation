import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { userIds, title, message, type, actionUrl, targetRole, batchId } = await req.json();
    if (!title || !message) return NextResponse.json({ error: "title and message required" }, { status: 400 });

    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      const inserts = userIds.map((uid: string) => ({
        user_id: uid,
        title,
        message,
        type: type || "info",
        action_url: actionUrl || null,
        created_by: user.id,
        target_role: targetRole || null,
        batch_id: batchId || null,
      }));
      const { error } = await supabase.from("notifications").insert(inserts);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ count: inserts.length });
    }

    // Send to all users matching role
    if (targetRole === "all" || targetRole === "students" || targetRole === "teachers") {
      const roleFilter = targetRole === "all" ? undefined : targetRole;
      let q = supabase.from("profiles").select("id");
      if (roleFilter) q = q.eq("role", roleFilter);
      if (batchId) {
        const { data: enrollments } = await supabase.from("enrollments").select("student_id").eq("batch_id", batchId);
        const stuIds = enrollments?.map((e) => e.student_id) || [];
        q = q.in("id", stuIds);
      }
      const { data: profiles } = await q;
      if (!profiles?.length) return NextResponse.json({ error: "No recipients found" }, { status: 400 });

      const inserts = profiles.map((p) => ({
        user_id: p.id,
        title,
        message,
        type: type || "info",
        action_url: actionUrl || null,
        created_by: user.id,
        target_role: targetRole,
        batch_id: batchId || null,
      }));
      const { error } = await supabase.from("notifications").insert(inserts);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ count: inserts.length });
    }

    return NextResponse.json({ error: "Specify userIds or targetRole" }, { status: 400 });
  } catch (err) {
    console.error("Notification create error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
