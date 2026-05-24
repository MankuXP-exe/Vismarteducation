import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createRouteClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "teacher" && profile?.role !== "admin") {
    return NextResponse.json({ error: "Teacher access required" }, { status: 403 });
  }

  const formData = await req.formData();
  formData.set("teacherId", user.id);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/video`, {
    method: "POST",
    headers: {
      "x-api-secret": process.env.VPS_API_SECRET!,
    },
    body: formData,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
