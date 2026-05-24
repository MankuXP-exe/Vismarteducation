import Link from "next/link";
import { redirect } from "next/navigation";
import { Play, Tv } from "lucide-react";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

async function getRecentLearning() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/dashboard/study/recent");
  if (!isSupabaseAdminConfigured) return [];

  const { data: progressRows } = await supabaseAdmin
    .from("lecture_progress")
    .select("lecture_id,batch_id,completion_percent,last_watched_at")
    .eq("student_id", user.id)
    .order("last_watched_at", { ascending: false })
    .limit(20);

  const lectureIds = (progressRows ?? []).map((row) => row.lecture_id).filter(Boolean);
  if (lectureIds.length === 0) return [];

  const { data: lectures } = await supabaseAdmin
    .from("lectures")
    .select("id,title,batch_id,subject_id,chapter_id,cloudflare_thumbnail_url")
    .in("id", lectureIds);

  const lectureById = new Map((lectures ?? []).map((lecture) => [lecture.id, lecture]));

  return (progressRows ?? [])
    .map((progress: any) => {
      const lecture: any = lectureById.get(progress.lecture_id);
      return lecture ? { progress, lecture } : null;
    })
    .filter(Boolean);
}

export default async function RecentLearningPage() {
  const recentLectures = await getRecentLearning();

  return (
    <div>
      <Link href="/dashboard/study" className="mb-6 inline-flex text-sm font-medium text-gray-500 hover:text-gray-900">
        Back
      </Link>

      <h1 className="mb-6 text-xl font-bold text-gray-900">Recent Learning</h1>

      {recentLectures.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Tv size={56} className="mb-4 opacity-30" />
          <p className="mb-1 text-lg font-semibold text-gray-600">No recent activity yet</p>
          <p className="max-w-xs text-center text-sm">Start watching a lecture to see it here.</p>
          <Link
            href="/dashboard/batches"
            className="mt-6 rounded-xl bg-[#5c35d9] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#4a28b8]"
          >
            Go to Batches
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {recentLectures.map((item: any) => (
            <div key={item.progress.lecture_id} className="rounded-xl border border-gray-100 bg-white p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-purple-100">
                  {item.lecture.cloudflare_thumbnail_url ? (
                    <img src={item.lecture.cloudflare_thumbnail_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Play size={24} className="text-[#5c35d9]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-gray-900">{item.lecture.title}</h3>
                  <p className="mt-1 text-xs text-gray-400">
                    Last watched: {timeAgo(item.progress.last_watched_at)}
                  </p>
                  <Link
                    href={`/dashboard/batches/${item.lecture.batch_id}/${item.lecture.subject_id}/lecture/${item.lecture.id}`}
                    className="mt-3 inline-flex text-sm font-semibold text-[#5c35d9] hover:underline"
                  >
                    Continue Watching
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
