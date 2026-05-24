import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const event = await req.json();
  const roomName = event.room?.name || event.roomName;

  if (event.event === "room_started" && roomName) {
    await supabaseAdmin.from("live_classes").update({ status: "live" }).eq("hms_room_id", roomName);
  }

  if (event.event === "room_finished" && roomName) {
    await supabaseAdmin.from("live_classes").update({ status: "completed" }).eq("hms_room_id", roomName);
  }

  return NextResponse.json({ received: true });
}
