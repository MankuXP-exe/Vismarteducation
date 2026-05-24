import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  let res = NextResponse.next({ request: req });

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

  const path = req.nextUrl.pathname;

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

    const role = profile?.role;
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
  matcher: ["/dashboard/:path*", "/teacher/:path*", "/admin/:path*", "/login", "/signup"],
};
