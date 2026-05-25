import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, classId } = body;

    if (!action || !classId) {
      return NextResponse.json({ error: "action and classId are required" }, { status: 400 });
    }

    if (action === "delete") {
      const { error } = await supabaseAdmin
        .from("live_classes")
        .delete()
        .eq("id", classId);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
