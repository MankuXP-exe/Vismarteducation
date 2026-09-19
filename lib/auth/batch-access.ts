import { getEffectiveRole } from "./roles";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { User } from "@supabase/supabase-js";
import { isVpsApiEnabled } from "@/lib/api/config";
import { checkVpsBatchAccess } from "./vps-session";

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
  if (isVpsApiEnabled()) {
    try {
      const vpsAccess = await checkVpsBatchAccess(batchId);
      return vpsAccess;
    } catch {
      // Fall through to Supabase on exception
    }
  }
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
