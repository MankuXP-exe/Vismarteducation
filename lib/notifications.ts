import { supabaseAdmin } from "@/lib/supabase/admin";

export async function notifyBatchStudents(
  batchId: string,
  teacherName: string,
  title: string,
  type: "live_class" | "new_lecture",
  actionUrl: string
) {
  const { data: enrollments } = await supabaseAdmin
    .from("enrollments")
    .select("student_id")
    .eq("batch_id", batchId)
    .eq("status", "active");

  if (!enrollments || enrollments.length === 0) return;

  const message = type === "live_class"
    ? `Teacher ${teacherName} started a live class "${title}". Join now!`
    : `Teacher ${teacherName} added a new lecture "${title}".`;

  const notifications = enrollments.map((e) => ({
    user_id: e.student_id,
    title,
    message,
    type,
    action_url: actionUrl,
  }));

  await supabaseAdmin.from("notifications").insert(notifications);
}
