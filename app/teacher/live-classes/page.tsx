import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";
import LiveClassesClient from "./LiveClassesClient";

export const dynamic = "force-dynamic";

type RawLiveClass = {
  id: string;
  title: string;
  batch_id: string | null;
  teacher_id: string | null;
  status: string;
  scheduled_at: string | null;
  duration_minutes: number | null;
  recording_url: string | null;
  is_recording_available: boolean | null;
  total_attendees: number | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string | null;
  batches: { title: string }[] | null;
  profiles: { full_name: string | null }[] | null;
};

async function getLiveClasses() {
  if (!isSupabaseAdminConfigured) return [];

  const { data } = await supabaseAdmin
    .from("live_classes")
    .select("id, title, batch_id, teacher_id, status, scheduled_at, duration_minutes, recording_url, is_recording_available, total_attendees, started_at, ended_at, created_at, batches(title), profiles(full_name)")
    .order("scheduled_at", { ascending: false })
    .limit(100);

  return (data ?? []) as RawLiveClass[];
}

export default async function TeacherLiveClassesPage() {
  const classes = await getLiveClasses();

  const mapped = classes.map((c) => ({
    id: c.id,
    title: c.title,
    batch: (c.batches?.[0] as any)?.title || "-",
    teacher: (c.profiles?.[0] as any)?.full_name || "-",
    status: c.status,
    scheduledAt: c.scheduled_at,
    duration: c.duration_minutes,
    recordingUrl: c.recording_url,
    hasRecording: !!c.is_recording_available,
    attendees: c.total_attendees ?? 0,
    startedAt: c.started_at,
    endedAt: c.ended_at,
    createdAt: c.created_at,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Classes</h1>
          <p className="text-sm text-gray-500">Manage scheduled and past live classes.</p>
        </div>
      </div>
      <LiveClassesClient classes={mapped} />
    </div>
  );
}
