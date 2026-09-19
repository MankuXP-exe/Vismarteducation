import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";
import { isVpsApiEnabled } from "@/lib/api/config";
import { getVpsSession } from "@/lib/auth/vps-session";

export async function GET() {
  if (isVpsApiEnabled()) {
    try {
      const vpsSession = await getVpsSession();
      if (vpsSession?.authenticated && vpsSession.profile) {
        return NextResponse.json({ profile: vpsSession.profile });
      }
    } catch {
      // Fall through to Supabase
    }
  }

  const supabase = await createRouteClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ profile: data });
}

export async function PATCH(req: Request) {
  const supabase = await createRouteClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const updates = await req.json();
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ profile: data });
}
