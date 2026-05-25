import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronRight, FileText, Video } from "lucide-react";
import { getEffectiveRole } from "@/lib/auth/roles";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SubjectRow = {
  id: string;
  name: string;
  abbreviation?: string | null;
  color?: string | null;
  sort_order?: number | null;
};

function normalizeSubjectName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function subjectColor(subject: SubjectRow) {
  if (subject.color) return subject.color;
  const colors = ["#dbeafe", "#fce7f3", "#d1fae5", "#ede9fe", "#fef3c7", "#e0f2fe"];
  const index = Math.abs(subject.name.charCodeAt(0) || 0) % colors.length;
  return colors[index];
}

function abbreviation(subject: SubjectRow) {
  return (
    subject.abbreviation ||
    subject.name
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 3)
      .toUpperCase()
  );
}

async function getBatchPageData(batchId: string) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?redirect=/dashboard/batches/${batchId}`);
  if (!isSupabaseAdminConfigured) return null;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = getEffectiveRole(user, profile);
  const canManage = role === "teacher" || role === "admin";

  if (!canManage) {
    const { data: enrollment } = await supabaseAdmin
      .from("enrollments")
      .select("id")
      .eq("student_id", user.id)
      .eq("batch_id", batchId)
      .eq("status", "active")
      .maybeSingle();

    if (!enrollment) redirect("/dashboard/batches");
  }

  const batchResult = await supabaseAdmin
    .from("batches")
    .select("id,title,subtitle,description,subjects")
    .eq("id", batchId)
    .maybeSingle();

  if (!batchResult.data) return null;

  const officialSubjects = ((batchResult.data.subjects as string[] | null) ?? []).filter(Boolean);
  const existingSubjectsResult = await supabaseAdmin
    .from("subjects")
    .select("id,name,abbreviation,color,sort_order")
    .eq("batch_id", batchId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const existingNames = new Set(
    (existingSubjectsResult.data ?? []).map((subject) => normalizeSubjectName(subject.name))
  );
  const missingSubjects = officialSubjects.filter(
    (subject) => !existingNames.has(normalizeSubjectName(subject))
  );

  if (missingSubjects.length > 0) {
    await supabaseAdmin.from("subjects").insert(
      missingSubjects.map((name, index) => ({
        batch_id: batchId,
        name,
        abbreviation: abbreviation({ id: "", name }),
        sort_order: 100 + index,
        is_active: true,
      }))
    );
  }

  const [subjectsResult, lecturesResult, materialsResult, liveClassesResult] = await Promise.all([
    supabaseAdmin
      .from("subjects")
      .select("id,name,abbreviation,color,sort_order")
      .eq("batch_id", batchId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabaseAdmin
      .from("lectures")
      .select("subject_id")
      .eq("batch_id", batchId)
      .eq("is_active", true),
    supabaseAdmin
      .from("study_materials")
      .select("id,title,file_url,file_name,material_type,published_at,subject_id")
      .eq("batch_id", batchId)
      .order("published_at", { ascending: false })
      .limit(20),
    supabaseAdmin
      .from("live_classes")
      .select("id,title,description,scheduled_at,status,started_at")
      .eq("batch_id", batchId)
      .order("scheduled_at", { ascending: false })
      .limit(10),
  ]);

  const officialNames = new Set(officialSubjects.map(normalizeSubjectName));
  const contentSubjectIds = new Set<string>();
  (lecturesResult.data ?? []).forEach((lecture: any) => {
    if (lecture.subject_id) contentSubjectIds.add(lecture.subject_id);
  });
  (materialsResult.data ?? []).forEach((material: any) => {
    if (material.subject_id) contentSubjectIds.add(material.subject_id);
  });

  const subjectsByName = new Map<string, SubjectRow>();
  for (const subject of (subjectsResult.data ?? []) as SubjectRow[]) {
    const key = normalizeSubjectName(subject.name);
    const hasContent = contentSubjectIds.has(subject.id);
    const isOfficial = officialNames.has(key);

    if (!hasContent && !isOfficial) continue;

    const current = subjectsByName.get(key);
    if (!current || (hasContent && !contentSubjectIds.has(current.id))) {
      subjectsByName.set(key, subject);
    }
  }

  return {
    batch: batchResult.data,
    subjects: Array.from(subjectsByName.values()),
    materials: materialsResult.data ?? [],
    liveClasses: liveClassesResult.data ?? [],
  };
}

export default async function BatchDetailPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;
  const data = await getBatchPageData(batchId);

  if (!data) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/batches" className="text-sm font-medium text-gray-500 hover:text-gray-900">
          Back to batches
        </Link>
        <h1 className="mt-3 text-xl font-bold text-gray-900">{data.batch.title}</h1>
        {data.batch.subtitle && <p className="mt-1 text-sm text-gray-500">{data.batch.subtitle}</p>}
      </div>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Subjects</h2>
        {data.subjects.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
            No subjects found for this batch yet. Upload a lecture from the teacher panel to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.subjects.map((subject) => (
              <Link
                key={subject.id}
                href={`/dashboard/batches/${batchId}/${subject.id}`}
                className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-gray-200 bg-white px-4 py-4 hover:border-purple-300 hover:bg-purple-50"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-gray-900"
                  style={{ background: subjectColor(subject) }}
                >
                  {abbreviation(subject)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">{subject.name}</p>
                  <p className="mt-0.5 text-xs text-gray-400">Open chapters and lectures</p>
                </div>
                <ChevronRight size={16} className="shrink-0 text-gray-300 group-hover:text-[#5c35d9]" />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Live Classes</h2>
        {(() => {
          const upcoming = data.liveClasses.filter(
            (lc: any) => lc.status === "live" || lc.status === "scheduled"
          );
          if (upcoming.length === 0) {
            return (
              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
                No upcoming live classes for this batch yet.
              </div>
            );
          }
          return (
            <div className="space-y-3">
              {upcoming.map((lc: any) => {
                const isLive = lc.status === "live";
                return (
                  <Link
                    key={lc.id}
                    href={`/dashboard/live/${lc.id}`}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 hover:border-purple-200"
                  >
                    <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${isLive ? "bg-red-50" : "bg-purple-50"}`}>
                      <Video size={18} className={isLive ? "text-red-500" : "text-purple-500"} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="block truncate text-sm font-medium text-gray-800">{lc.title}</span>
                        {isLive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                            LIVE
                          </span>
                        ) : (
                          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-600">
                            UPCOMING
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-gray-400">
                        {isLive ? "Started " : "Scheduled "}
                        {new Date(lc.scheduled_at).toLocaleString("en-IN")}
                      </span>
                    </span>
                    <ChevronRight size={16} className="shrink-0 text-gray-300 group-hover:text-[#5c35d9]" />
                  </Link>
                );
              })}
            </div>
          );
        })()}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Study Materials</h2>
        {data.materials.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
            No notes or PDFs uploaded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {data.materials.map((material: any) => (
              <a
                key={material.id}
                href={material.file_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 hover:border-purple-200"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <FileText size={18} className="text-blue-500" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-gray-800">{material.title}</span>
                  <span className="text-xs capitalize text-gray-400">{material.material_type || "notes"}</span>
                </span>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
