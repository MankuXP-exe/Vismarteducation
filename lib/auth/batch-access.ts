import { getEffectiveRole } from "./roles";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { User } from "@supabase/supabase-js";

export type BatchAccessResult = {
  allowed: boolean;
  role: string;
  reason?: string;
};

export async function checkBatchAccess(
  userId: string,
  batchId: string,
  user: User | null
): Promise<BatchAccessResult> {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  const role = getEffectiveRole(user, profile);
  const canManage = role === "teacher" || role === "admin";

  if (canManage) return { allowed: true, role };

  const { data: enrollment } = await supabaseAdmin
    .from("enrollments")
    .select("id")
    .eq("student_id", userId)
    .eq("batch_id", batchId)
    .eq("status", "active")
    .maybeSingle();

  if (!enrollment) {
    return {
      allowed: false,
      role,
      reason: "You don't have access to this batch.",
    };
  }

  return { allowed: true, role };
}
