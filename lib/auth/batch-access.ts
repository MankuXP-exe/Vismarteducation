import { getEffectiveRole, type User } from "./roles";
import { checkVpsBatchAccess } from "./vps-session";

export type BatchAccessResult = {
  allowed: boolean;
  role: string;
  reason?: string;
};

export async function checkBatchAccess(
  _userId: string,
  batchId: string,
  _user: User | null
): Promise<BatchAccessResult> {
  try {
    const vpsAccess = await checkVpsBatchAccess(batchId);
    return vpsAccess;
  } catch (err: any) {
    return {
      allowed: false,
      role: "student",
      reason: err.message || "Failed to verify batch access",
    };
  }
}
