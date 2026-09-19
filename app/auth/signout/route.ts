import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";
import { api } from "@/lib/api/client";
import { isVpsApiEnabled } from "@/lib/api/config";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  if (isVpsApiEnabled()) {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("vi_session")?.value;
      await api.auth.logout(token);
    } catch {}
  }

  try {
    const supabase = await createRouteClient();
    await supabase.auth.signOut();
  } catch {}

  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.delete("vi_session");
  return res;
}
