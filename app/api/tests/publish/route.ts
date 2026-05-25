import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function PUT(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { testId, publish } = await req.json();
    if (!testId) return NextResponse.json({ error: "testId required" }, { status: 400 });

    const { data, error } = await supabase
      .from("tests")
      .update({ is_published: publish ?? true })
      .eq("id", testId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ test: data });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
