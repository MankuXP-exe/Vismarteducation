import { cookies } from "next/headers";
import { API_BASE_URL } from "@/lib/api/config";

export async function createServerClient(): Promise<any> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("vi_session")?.value;

  return {
    auth: {
      async getUser() {
        if (!sessionCookie) return { data: { user: null }, error: null };
        try {
          const res = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              Cookie: `vi_session=${sessionCookie}`,
              Authorization: `Bearer ${sessionCookie}`,
            },
          });
          if (res.ok) {
            const json = await res.json();
            if (json.user) {
              return { data: { user: json.user }, error: null };
            }
          }
        } catch {}
        return { data: { user: null }, error: null };
      },
    },
  };
}

export async function createRouteClient(): Promise<any> {
  return createServerClient();
}
