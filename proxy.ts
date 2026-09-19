import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isVpsApiEnabled, API_BASE_URL } from "@/lib/api/config";

export async function proxy(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const path = req.nextUrl.pathname;

  // Progressive Migration: If VPS API enabled, check VPS session
  if (isVpsApiEnabled()) {
    const vpsToken = req.cookies.get("vi_session")?.value;

    if (vpsToken) {
      if (path === "/login" || path === "/signup") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      if (path.startsWith("/teacher") || path.startsWith("/admin")) {
        try {
          const meRes = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              Cookie: `vi_session=${vpsToken}`,
              Authorization: `Bearer ${vpsToken}`,
            },
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            const role = meData.user?.role;
            if (path.startsWith("/teacher") && role !== "teacher" && role !== "admin" && role !== "super_admin") {
              return NextResponse.redirect(new URL("/dashboard", req.url));
            }
            if (path.startsWith("/admin") && role !== "admin" && role !== "super_admin") {
              return NextResponse.redirect(new URL("/dashboard", req.url));
            }
            return res;
          }
        } catch {
          // On API error, allow request or fallback
        }
      }

      // Valid VPS token for /dashboard
      if (path.startsWith("/dashboard")) {
        return res;
      }
    }
  }

  // Supabase fallback (production default)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (path.startsWith("/dashboard") && !session) {
    return NextResponse.redirect(new URL(`/login?redirect=${path}`, req.url));
  }

  if (path.startsWith("/teacher") || path.startsWith("/admin")) {
    if (!session) return NextResponse.redirect(new URL("/login", req.url));

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    const role =
      profile?.role ||
      session.user.app_metadata?.role ||
      session.user.user_metadata?.role;
    if (path.startsWith("/teacher") && role !== "teacher" && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (path.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if ((path === "/login" || path === "/signup") && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/teacher/:path*", "/login", "/signup"],
};
