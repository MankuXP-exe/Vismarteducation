import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isVpsApiEnabled } from "@/lib/api/config";
import { api } from "@/lib/api/client";

export async function GET(req: Request) {
  try {
    if (isVpsApiEnabled()) {
      try {
        const cookieStore = await cookies();
        const token = cookieStore.get("vi_session")?.value;
        if (token) {
          const headers = { Cookie: `vi_session=${token}`, Authorization: `Bearer ${token}` };
          const { data, error } = await apiFetch("/concessions/my-requests", { headers });
          if (!error && data?.requests) {
            return NextResponse.json(data.requests);
          }
        }
      } catch {
        // Fallback
      }
    }

    const supabase = await createRouteClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data, error } = await supabaseAdmin
      .from("concession_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const { API_BASE_URL } = await import("@/lib/api/config");
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...options.headers } });
  if (!res.ok) throw new Error("API Error");
  return { data: await res.json(), error: null };
}
