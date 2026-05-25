import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function DELETE(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { testId } = await req.json();
    if (!testId) return NextResponse.json({ error: "testId required" }, { status: 400 });

    const { error } = await supabase.from("tests").delete().eq("id", testId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
