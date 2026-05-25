import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, recordingId } = body;

    if (!action || !recordingId) {
      return NextResponse.json({ error: "action and recordingId are required" }, { status: 400 });
    }

    switch (action) {
      case "delete": {
        const { error } = await supabaseAdmin
          .from("lectures")
          .delete()
          .eq("id", recordingId);

        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      case "activate": {
        const { error } = await supabaseAdmin
          .from("lectures")
          .update({ is_active: true })
          .eq("id", recordingId);

        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      case "deactivate": {
        const { error } = await supabaseAdmin
          .from("lectures")
          .update({ is_active: false })
          .eq("id", recordingId);

        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
