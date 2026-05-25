import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronRight, FileText, Play, Video } from "lucide-react";
import { getEffectiveRole } from "@/lib/auth/roles";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ChapterRow = {
  id: string;
  chapter_number?: string | null;
  title: string;
  sort_order?: number | null;
};

type LectureRow = {
  id: string;
  chapter_id: string;
  title: string;
  description?: string | null;
  cloudflare_playback_url?: string | null;
  cloudflare_thumbnail_url?: string | null;
  duration_label?: string | null;
  duration_seconds?: number | null;
  published_at?: string | null;
  sort_order?: number | null;
};

function formatDate(value?: string | null) {
  if (!value) return "Not published";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function durationLabel(lecture: LectureRow) {
  if (lecture.duration_label) return lecture.duration_label;
  if (!lecture.duration_seconds) return "";
  const minutes = Math.max(1, Math.round(lecture.duration_seconds / 60));
  return `${minutes} min`;
}

function normalizeChapterTitle(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "").replace(/^chapter/, "ch");
}

async function assertAccess(userId: string, batchId: string, user: any) {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  const role = getEffectiveRole(user, profile);
  const canManage = role === "teacher" || role === "admin";

  if (canManage) return;

  const { data: enrollment } = await supabaseAdmin
    .from("enrollments")
    .select("id")
    .eq("student_id", userId)
    .eq("batch_id", batchId)
    .eq("status", "active")
    .maybeSingle();

  if (!enrollment) redirect("/dashboard/batches");
}

async function getSubjectPageData(batchId: string, subjectId: string, chapterParam?: string) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?redirect=/dashboard/batches/${batchId}/${subjectId}`);
  if (!isSupabaseAdminConfigured) return null;

  await assertAccess(user.id, batchId, user);

  const [batchResult, subjectResult, chaptersResult, lecturesResult, materialsResult, liveClassesResult] =
    await Promise.all([
      supabaseAdmin.from("batches").select("id,title").eq("id", batchId).maybeSingle(),
      supabaseAdmin
        .from("subjects")
        .select("id,name,abbreviation")
        .eq("id", subjectId)
        .eq("batch_id", batchId)
        .maybeSingle(),
      supabaseAdmin
        .from("chapters")
        .select("id,chapter_number,title,sort_order")
        .eq("batch_id", batchId)
        .eq("subject_id", subjectId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabaseAdmin
        .from("lectures")
        .select(
          "id,chapter_id,title,description,cloudflare_playback_url,cloudflare_thumbnail_url,duration_label,duration_seconds,published_at,sort_order"
        )
        .eq("batch_id", batchId)
        .eq("subject_id", subjectId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabaseAdmin
        .from("study_materials")
        .select("id,chapter_id,lecture_id,title,file_url,file_name,material_type,published_at")
        .eq("batch_id", batchId)
        .eq("subject_id", subjectId)
        .order("published_at", { ascending: false }),
      supabaseAdmin
        .from("live_classes")
        .select("id,title,description,scheduled_at,status,started_at")
        .eq("batch_id", batchId)
        .eq("subject_id", subjectId)
        .order("scheduled_at", { ascending: false })
        .limit(10),
    ]);

  if (!batchResult.data || !subjectResult.data) return null;

  const allChapters = (chaptersResult.data ?? []) as ChapterRow[];
  const lectureCounts = new Map<string, number>();
  ((lecturesResult.data ?? []) as LectureRow[]).forEach((lecture) => {
    lectureCounts.set(lecture.chapter_id, (lectureCounts.get(lecture.chapter_id) ?? 0) + 1);
  });

  const chaptersByTitle = new Map<string, ChapterRow>();
  for (const chapter of allChapters) {
    const key = normalizeChapterTitle(chapter.title);
    const current = chaptersByTitle.get(key);
    if (!current || (lectureCounts.get(chapter.id) ?? 0) > (lectureCounts.get(current.id) ?? 0)) {
      chaptersByTitle.set(key, chapter);
    }
  }

  const chapters = Array.from(chaptersByTitle.values()).sort((a, b) => {
    const lectureDelta = (lectureCounts.get(b.id) ?? 0) - (lectureCounts.get(a.id) ?? 0);
    if (lectureDelta !== 0) return lectureDelta;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });
  const selectedChapterId =
    chapters.find((chapter) => chapter.id === chapterParam)?.id ||
    chapters.find((chapter) => (lectureCounts.get(chapter.id) ?? 0) > 0)?.id ||
    chapters[0]?.id ||
    "";

  return {
    batch: batchResult.data,
    subject: subjectResult.data,
    chapters,
    selectedChapterId,
    lectures: ((lecturesResult.data ?? []) as LectureRow[]).filter(
      (lecture) => !selectedChapterId || lecture.chapter_id === selectedChapterId
    ),
    materials: (materialsResult.data ?? []).filter(
      (material: any) => !selectedChapterId || material.chapter_id === selectedChapterId
    ),
    liveClasses: liveClassesResult.data ?? [],
  };
}

export default async function SubjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ batchId: string; subjectId: string }>;
  searchParams: Promise<{ chapter?: string }>;
}) {
  const { batchId, subjectId } = await params;
  const { chapter } = await searchParams;
  const data = await getSubjectPageData(batchId, subjectId, chapter);

  if (!data) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/dashboard/batches/${batchId}`} className="text-sm font-medium text-gray-500 hover:text-gray-900">
          Back to subjects
        </Link>
        <h1 className="mt-3 text-xl font-bold text-gray-900">{data.subject.name}</h1>
        <p className="mt-1 text-sm text-gray-500">{data.batch.title}</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-[260px]">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            All Chapters
          </p>
          {data.chapters.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-400">
              No chapters found.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {data.chapters.map((chapterItem) => {
                const isActive = data.selectedChapterId === chapterItem.id;
                return (
                  <Link
                    key={chapterItem.id}
                    href={`/dashboard/batches/${batchId}/${subjectId}?chapter=${chapterItem.id}`}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-4 text-left ${
                      isActive
                        ? "border-l-4 border-purple-200 border-l-[#5c35d9] bg-purple-50"
                        : "border-gray-200 bg-white hover:border-purple-300"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold text-[#5c35d9]">
                        {chapterItem.chapter_number ? `CH-${chapterItem.chapter_number}` : "CH"}
                      </span>
                      <span className="block text-sm font-medium leading-tight text-gray-800">
                        {chapterItem.title}
                      </span>
                    </span>
                    <ChevronRight
                      size={14}
                      className={isActive ? "text-[#5c35d9]" : "text-gray-300"}
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </aside>

        <main className="min-w-0 flex-1">
          <section className="mb-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">
              Live Classes
            </h2>
            {data.liveClasses.length === 0 ? (
              <div className="rounded-xl border border-gray-100 bg-white p-8 text-center text-gray-400">
                <Video size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No live classes yet for this subject.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {data.liveClasses.map((lc: any) => {
                  const isLive = lc.status === "live";
                  const isScheduled = lc.status === "scheduled";
                  return (
                    <Link
                      key={lc.id}
                      href={`/dashboard/live/${lc.id}`}
                      className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 hover:border-purple-200"
                    >
                      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${isLive ? "bg-red-50" : "bg-purple-50"}`}>
                        <Video size={20} className={isLive ? "text-red-500" : "text-purple-500"} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="block truncate text-sm font-medium text-gray-800">{lc.title}</span>
                          {isLive && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                              LIVE
                            </span>
                          )}
                          {isScheduled && (
                            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-600">
                              UPCOMING
                            </span>
                          )}
                        </span>
                        <p className="mt-0.5 text-xs text-gray-400">
                          {isLive ? "Started " : "Scheduled "}
                          {new Date(lc.scheduled_at).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <ChevronRight size={16} className="shrink-0 text-gray-300" />
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          <section className="mb-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">
              Lectures
            </h2>
            {data.lectures.length === 0 ? (
              <div className="rounded-xl border border-gray-100 bg-white p-8 text-center text-gray-400">
                <Play size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No lectures uploaded yet for this chapter.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {data.lectures.map((lecture) => (
                  <div
                    key={lecture.id}
                    className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 hover:border-purple-200"
                  >
                    <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-purple-100">
                      {lecture.cloudflare_thumbnail_url ? (
                        <img
                          src={lecture.cloudflare_thumbnail_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Play size={20} className="text-[#5c35d9]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800">{lecture.title}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        {formatDate(lecture.published_at)}
                        {durationLabel(lecture) ? ` - ${durationLabel(lecture)}` : ""}
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/batches/${batchId}/${subjectId}/lecture/${lecture.id}`}
                      className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#5c35d9] hover:underline"
                    >
                      <Play size={14} />
                      Watch Now
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">
              Notes and PDFs
            </h2>
            {data.materials.length === 0 ? (
              <div className="rounded-xl border border-gray-100 bg-white p-8 text-center text-gray-400">
                <FileText size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No notes uploaded yet for this chapter.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {data.materials.map((material: any) => (
                  <a
                    key={material.id}
                    href={material.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 hover:border-purple-200"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                      <FileText size={20} className="text-blue-500" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-gray-800">
                        {material.title}
                      </span>
                      <span className="text-xs capitalize text-gray-400">
                        {material.material_type || "notes"}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
