import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";
import RecordingsClient from "./RecordingsClient";

export const dynamic = "force-dynamic";

type RawRecording = {
  id: string;
  title: string;
  batch_id: string | null;
  subject_id: string | null;
  chapter_id: string | null;
  cloudflare_playback_url: string | null;
  cloudflare_thumbnail_url: string | null;
  duration_label: string | null;
  duration_seconds: number | null;
  lecture_type: string | null;
  published_at: string | null;
  is_active: boolean | null;
  batches: { title: string }[] | null;
  subjects: { name: string }[] | null;
};

async function getRecordings() {
  if (!isSupabaseAdminConfigured) return [];

  const { data } = await supabaseAdmin
    .from("lectures")
    .select("id, title, batch_id, subject_id, chapter_id, cloudflare_playback_url, cloudflare_thumbnail_url, duration_label, duration_seconds, lecture_type, published_at, is_active, batches(title), subjects(name)")
    .order("published_at", { ascending: false })
    .limit(200);

  return (data ?? []) as RawRecording[];
}

export default async function TeacherRecordingsPage() {
  const recordings = await getRecordings();

  const mapped = recordings.map((r) => ({
    id: r.id,
    title: r.title,
    batch: (r.batches?.[0] as any)?.title || "-",
    subject: (r.subjects?.[0] as any)?.name || "-",
    thumbnailUrl: r.cloudflare_thumbnail_url,
    playbackUrl: r.cloudflare_playback_url,
    durationLabel: r.duration_label || (r.duration_seconds ? `${Math.floor(r.duration_seconds / 60)}m` : "-"),
    durationSeconds: r.duration_seconds,
    type: r.lecture_type || "recorded",
    publishedAt: r.published_at,
    isActive: r.is_active !== false,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recordings</h1>
          <p className="text-sm text-gray-500">All lecture recordings and published videos.</p>
        </div>
      </div>
      <RecordingsClient recordings={mapped} />
    </div>
  );
}
