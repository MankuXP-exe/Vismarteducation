import { api } from "@/lib/api/client";

export async function notifyBatchStudents(
  batchId: string,
  teacherName: string,
  title: string,
  type: "live_class" | "new_lecture",
  actionUrl: string
) {
  try {
    const message =
      type === "live_class"
        ? `Teacher ${teacherName} started a live class "${title}". Join now!`
        : `Teacher ${teacherName} added a new lecture "${title}".`;

    await api.notifications.create({
      batchId,
      title,
      message,
      type,
      actionUrl,
      targetRole: "students",
    });
  } catch (err) {
    console.warn("Failed to dispatch batch notifications:", err);
  }
}
