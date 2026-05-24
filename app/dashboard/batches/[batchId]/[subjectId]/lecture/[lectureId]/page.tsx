import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CheckCircle, FileText, Play } from "lucide-react";
import { getEffectiveRole } from "@/lib/auth/roles";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Watch Lecture | Vi Smart Learning Education",
  robots: { index: false, follow: false },
};

type LectureRow = {
  id: string;
  batch_id: string;
  subject_id: string;
  chapter_id: string;
  title: string;
  description?: string | null;
  cloudflare_playback_url?: string | null;
  cloudflare_thumbnail_url?: string | null;
  duration_label?: string | null;
  duration_seconds?: number | null;
  published_at?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "Not published";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function assertAccess(userId: string, batchId: string, user: any) {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  const role = getEffectiveRole(user, profile);

  if (role === "teacher" || role === "admin") return;

  const { data: enrollment } = await supabaseAdmin
    .from("enrollments")
    .select("id")
    .eq("student_id", userId)
    .eq("batch_id", batchId)
    .eq("status", "active")
    .maybeSingle();

  if (!enrollment) redirect("/dashboard/batches");
}

async function getLecturePageData(batchId: string, subjectId: string, lectureId: string) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/dashboard/batches/${batchId}/${subjectId}/lecture/${lectureId}`);
  }
  if (!isSupabaseAdminConfigured) return null;

  await assertAccess(user.id, batchId, user);

  const [lectureResult, lecturesResult, materialsResult] = await Promise.all([
    supabaseAdmin
      .from("lectures")
      .select(
        "id,batch_id,subject_id,chapter_id,title,description,cloudflare_playback_url,cloudflare_thumbnail_url,duration_label,duration_seconds,published_at"
      )
      .eq("id", lectureId)
      .eq("batch_id", batchId)
      .eq("subject_id", subjectId)
      .maybeSingle(),
    supabaseAdmin
      .from("lectures")
      .select("id,title,chapter_id,cloudflare_thumbnail_url,duration_label,duration_seconds")
      .eq("batch_id", batchId)
      .eq("subject_id", subjectId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabaseAdmin
      .from("study_materials")
      .select("id,title,file_url,material_type")
      .eq("batch_id", batchId)
      .eq("subject_id", subjectId)
      .or(`lecture_id.eq.${lectureId},lecture_id.is.null`)
      .order("published_at", { ascending: false }),
  ]);

  const lecture = lectureResult.data as LectureRow | null;
  if (!lecture) return null;

  return {
    lecture,
    lectures: (lecturesResult.data ?? []) as LectureRow[],
    materials: materialsResult.data ?? [],
  };
}

export default async function LecturePage({
  params,
}: {
  params: Promise<{ batchId: string; subjectId: string; lectureId: string }>;
}) {
  const { batchId, subjectId, lectureId } = await params;
  const data = await getLecturePageData(batchId, subjectId, lectureId);

  if (!data) notFound();

  const videoUrl = data.lecture.cloudflare_playback_url;

  return (
    <div className="-m-8 flex h-[calc(100vh-56px)] overflow-hidden bg-[#f7f8fc]">
      <main className="flex-1 overflow-y-auto">
        <div className="px-6 pb-10 pt-5">
          <Link
            href={`/dashboard/batches/${batchId}/${subjectId}?chapter=${data.lecture.chapter_id}`}
            className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Back to lectures
          </Link>

          <div className="aspect-video overflow-hidden rounded-xl bg-gray-900 shadow-lg">
            {videoUrl ? (
              <video
                src={videoUrl}
                poster={data.lecture.cloudflare_thumbnail_url || undefined}
                controls
                preload="metadata"
                playsInline
                controlsList="nodownload"
                className="h-full w-full"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-white/60">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                  <Play size={36} className="ml-1 text-white" />
                </div>
                <p className="text-lg font-semibold text-white/80">{data.lecture.title}</p>
                <p className="mt-2 text-sm text-white/40">Video URL is missing for this lecture.</p>
              </div>
            )}
          </div>

          <div className="mt-5">
            <h1 className="text-xl font-bold text-gray-900">{data.lecture.title}</h1>
            <p className="mt-1 text-sm text-gray-400">
              {formatDate(data.lecture.published_at)}
              {data.lecture.duration_label ? ` - ${data.lecture.duration_label}` : ""}
            </p>
            {data.lecture.description && (
              <div className="mt-5 rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="mb-2 font-semibold text-gray-900">About this lecture</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
                  {data.lecture.description}
                </p>
              </div>
            )}

            <div className="mt-5 rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="mb-3 font-semibold text-gray-900">Notes and PDFs</h2>
              {data.materials.length === 0 ? (
                <p className="text-sm text-gray-400">No notes uploaded for this lecture yet.</p>
              ) : (
                <div className="space-y-2">
                  {data.materials.map((material: any) => (
                    <a
                      key={material.id}
                      href={material.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 hover:border-purple-200"
                    >
                      <FileText size={18} className="text-blue-500" />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">
                        {material.title}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <aside className="w-[340px] shrink-0 overflow-hidden border-l border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-4">
          <h2 className="text-sm font-bold text-gray-900">All Lectures</h2>
        </div>
        <div className="h-full overflow-y-auto pb-20">
          {data.lectures.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">No lectures in this subject yet.</div>
          ) : (
            data.lectures.map((lecture) => {
              const isCurrent = lecture.id === lectureId;
              return (
                <Link
                  key={lecture.id}
                  href={`/dashboard/batches/${batchId}/${subjectId}/lecture/${lecture.id}`}
                  className={`flex items-center gap-3 border-b border-gray-50 px-4 py-3.5 ${
                    isCurrent ? "border-l-4 border-l-[#5c35d9] bg-purple-50" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex h-11 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                    {lecture.cloudflare_thumbnail_url ? (
                      <img src={lecture.cloudflare_thumbnail_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Play size={14} className={isCurrent ? "text-[#5c35d9]" : "text-gray-400"} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-xs font-medium ${isCurrent ? "text-[#5c35d9]" : "text-gray-800"}`}>
                      {lecture.title}
                    </p>
                    {lecture.duration_label && (
                      <p className="mt-1 text-[10px] text-gray-400">{lecture.duration_label}</p>
                    )}
                  </div>
                  {isCurrent && <CheckCircle size={14} className="shrink-0 text-green-500" />}
                </Link>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}
