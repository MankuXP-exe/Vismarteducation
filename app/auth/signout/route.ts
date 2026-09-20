import { NextResponse } from "next/server";
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

  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.delete("vi_session");
  return res;
}
