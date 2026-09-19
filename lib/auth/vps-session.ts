import { cookies } from "next/headers";
import { API_BASE_URL } from "@/lib/api/config";

export type VpsUser = {
  id: string;
  email: string;
  role: "student" | "teacher" | "admin" | "super_admin";
  isActive: boolean;
};

export type VpsEnrollment = {
  batch_id: string;
  status: string;
  access_start_date?: string | null;
  access_end_date?: string | null;
  completion_percent?: number | null;
};

export type VpsSessionData = {
  authenticated: boolean;
  user: VpsUser;
  profile: any;
  enrollments: VpsEnrollment[];
};

export type VpsAccessResult = {
  allowed: boolean;
  role: string;
  reason?: string;
};

/**
 * Resolves current authenticated session from the Fastify VPS API
 * by forwarding the HTTP-only vi_session cookie.
 * Does NOT call or depend on Supabase.
 */
export async function getVpsSession(): Promise<VpsSessionData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("vi_session")?.value;
    if (!token) return null;

    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Cookie: `vi_session=${token}`,
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.authenticated ? (data as VpsSessionData) : null;
  } catch {
    return null;
  }
}

/**
 * Authorizes access to a batch using the VPS session identity and enrollments.
 * Does NOT call or depend on Supabase.
 */
export async function checkVpsBatchAccess(batchId: string): Promise<VpsAccessResult> {
  const session = await getVpsSession();
  if (!session || !session.authenticated) {
    return {
      allowed: false,
      role: "guest",
      reason: "Authentication required",
    };
  }

  const role = session.user.role;
  if (role === "teacher" || role === "admin" || role === "super_admin") {
    return { allowed: true, role };
  }

  const isEnrolled = session.enrollments?.some(
    (e) => e.batch_id === batchId && e.status === "active"
  );

  if (isEnrolled) {
    return { allowed: true, role };
  }

  return {
    allowed: false,
    role,
    reason: "You are not enrolled in this batch.",
  };
}
