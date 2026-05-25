import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hasTeacherAccess } from "@/lib/auth/roles";
import { notifyBatchStudents } from "@/lib/notifications";
import { EgressClient, EncodedFileOutput, EncodingOptionsPreset } from "livekit-server-sdk";

function abbreviationFromName(name: string) {
  const letters = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 6)
    .toUpperCase();
  return letters || "GEN";
}

async function ensureSubject(batchId: string, subjectName: string | null) {
  const name = subjectName?.trim() || "General";
  const { data: existing } = await supabaseAdmin
    .from("subjects")
    .select("id")
    .eq("batch_id", batchId)
    .ilike("name", name)
    .maybeSingle();
  if (existing?.id) return existing.id;
  const { data, error } = await supabaseAdmin
    .from("subjects")
    .insert({
      batch_id: batchId,
      name,
      abbreviation: abbreviationFromName(name),
      sort_order: 0,
      is_active: true,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function POST(req: Request) {
  try {
    const supabase = await createRouteClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single();

    if (!hasTeacherAccess(user, profile)) {
      return NextResponse.json({ error: "Teacher access required" }, { status: 403 });
    }

    const body = await req.json();
    if (!body.batchId) {
      return NextResponse.json({ error: "batchId is required" }, { status: 400 });
    }

    const subjectId = await ensureSubject(body.batchId, body.subjectName || null);

    const roomName = `class-${crypto.randomUUID()}`;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.vismartlearningeducation.com";
    const apiSecret = process.env.VPS_API_SECRET || process.env.API_SECRET || "random_secret_key_123";

    const roomRes = await fetch(`${apiUrl}/live/create-room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-secret": apiSecret,
      },
      body: JSON.stringify({ roomName }),
    });

    if (!roomRes.ok) {
      const roomErr = await roomRes.json();
      throw new Error(roomErr.error ?? "Unable to create room on VPS");
    }

    const { data: liveClass, error } = await supabaseAdmin
      .from("live_classes")
      .insert({
        batch_id: body.batchId,
        subject_id: subjectId,
        teacher_id: user.id,
        title: body.title || "Instant Live Class",
        description: body.description || "",
        scheduled_at: new Date().toISOString(),
        duration_minutes: body.durationMinutes || 60,
        hms_room_id: roomName,
        status: "live",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Start LiveKit Egress recording
    const egressClient = new EgressClient("http://187.127.172.181:7880", "devkey", "secret");
    const fileName = `${roomName}-${Date.now()}.mp4`;
    const expectedUrl = `https://stream.vismartlearningeducation.com/recordings/${body.batchId}/${fileName}`;
    egressClient.startRoomCompositeEgress(
      roomName,
      new EncodedFileOutput({
        filepath: `recordings/${body.batchId}/${fileName}`,
        fileType: "MP4",
        output: {
          case: "s3",
          value: {
            accessKey: "egresskey",
            secret: "egresssecret",
            endpoint: "http://187.127.172.181:9000",
            bucket: "recordings",
            forcePathStyle: true,
          },
        },
      }),
      { preset: EncodingOptionsPreset.H264_720P_30, layout: "grid" }
    ).then(() => {
      supabaseAdmin.from("live_classes").update({ recording_url: expectedUrl }).eq("id", liveClass.id).catch(() => {});
    }).catch((err) => {
      console.error("Failed to start egress:", err);
    });

    notifyBatchStudents(
      body.batchId,
      profile?.full_name || "Teacher",
      body.title || "Instant Live Class",
      "live_class",
      `${process.env.NEXT_PUBLIC_APP_URL || "https://vismartlearningeducation.com"}/dashboard/live/${liveClass.id}`
    );

    return NextResponse.json({ liveClass });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
