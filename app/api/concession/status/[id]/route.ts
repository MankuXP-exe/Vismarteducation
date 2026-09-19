import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteClient } from "@/lib/supabase/server";
import { isVpsApiEnabled } from "@/lib/api/config";
import { api } from "@/lib/api/client";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (isVpsApiEnabled()) {
      try {
        const cookieStore = await cookies();
        const token = cookieStore.get("vi_session")?.value;
        if (token) {
          const headers = { Cookie: `vi_session=${token}`, Authorization: `Bearer ${token}` };
          const { data, error } = await apiFetch("/concessions/my-requests", { headers });
          if (!error && data?.requests) {
            const req = data.requests.find((r: any) => r.id === id);
            return NextResponse.json(req || { error: "Not found" });
          }
        }
      } catch {
        // Fallback
      }
    }

    const supabase = await createRouteClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data, error } = await supabase
      .from("concession_requests")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || { error: "Not found" });
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
