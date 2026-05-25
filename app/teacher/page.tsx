import Link from "next/link";
import { CalendarPlus, Upload, Users, Video, Zap, BookOpen, Radio } from "lucide-react";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function getTeacherDashboardData() {
  if (!isSupabaseAdminConfigured) {
    return {
      batchCount: 0, studentCount: 0, upcomingCount: 0, lectureCount: 0,
      recentRecordings: [], upcomingClasses: [], batches: [],
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [batches, students, upcoming, lectures, upcomingList, recentRecs, batchList] = await Promise.all([
    supabaseAdmin.from("batches").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    supabaseAdmin.from("live_classes").select("id", { count: "exact", head: true }).in("status", ["scheduled", "live"]).gte("scheduled_at", today.toISOString()),
    supabaseAdmin.from("lectures").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabaseAdmin.from("live_classes").select("id,title,scheduled_at,status,batches(title)").in("status", ["scheduled", "live"]).gte("scheduled_at", today.toISOString()).order("scheduled_at", { ascending: true }).limit(5),
    supabaseAdmin.from("lectures").select("id,title,cloudflare_playback_url,cloudflare_thumbnail_url,duration_label,lecture_type,published_at,batches(title),subjects(name)").eq("is_active", true).order("published_at", { ascending: false }).limit(6),
    supabaseAdmin.from("batches").select("id,title,slug,thumbnail_url,total_students,total_lectures,is_active").eq("is_active", true).order("created_at", { ascending: false }).limit(10),
  ]);

  return {
    batchCount: batches.count ?? 0,
    studentCount: students.count ?? 0,
    upcomingCount: upcoming.count ?? 0,
    lectureCount: lectures.count ?? 0,
    upcomingClasses: upcomingList.data ?? [],
    recentRecordings: recentRecs.data ?? [],
    batches: batchList.data ?? [],
  };
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    scheduled: "bg-yellow-100 text-yellow-700",
    live: "bg-green-100 text-green-700 animate-pulse",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-gray-100 text-gray-500",
  };
  return styles[status] || "bg-gray-100 text-gray-600";
}

export default async function TeacherDashboardPage() {
  const data = await getTeacherDashboardData();

  const stats = [
    { label: "My Batches", value: data.batchCount, icon: BookOpen, color: "text-purple-600 bg-purple-100" },
    { label: "Total Students", value: data.studentCount, icon: Users, color: "text-blue-600 bg-blue-100" },
    { label: "Upcoming Live", value: data.upcomingCount, icon: Radio, color: "text-green-600 bg-green-100" },
    { label: "Lectures", value: data.lectureCount, icon: Video, color: "text-orange-600 bg-orange-100" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-sm text-gray-500">Manage live classes, recordings, notes, and batches.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className={`mb-3 inline-flex rounded-lg p-2.5 ${s.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/teacher/live/start" className="group rounded-xl border border-green-200 bg-green-50 p-5 transition hover:border-green-400 hover:shadow-sm">
          <Zap className="mb-3 h-6 w-6 text-green-600" />
          <h2 className="font-bold text-gray-900 group-hover:text-green-700">Start Live</h2>
          <p className="mt-1 text-sm text-gray-500">Go live instantly with any batch.</p>
        </Link>
        <Link href="/teacher/batches" className="group rounded-xl border border-purple-200 bg-purple-50 p-5 transition hover:border-purple-400 hover:shadow-sm">
          <CalendarPlus className="mb-3 h-6 w-6 text-purple-600" />
          <h2 className="font-bold text-gray-900 group-hover:text-purple-700">Schedule Class</h2>
          <p className="mt-1 text-sm text-gray-500">Schedule a future live class.</p>
        </Link>
        <Link href="/teacher/batches" className="group rounded-xl border border-blue-200 bg-blue-50 p-5 transition hover:border-blue-400 hover:shadow-sm">
          <Upload className="mb-3 h-6 w-6 text-blue-600" />
          <h2 className="font-bold text-gray-900 group-hover:text-blue-700">Upload Lecture</h2>
          <p className="mt-1 text-sm text-gray-500">Upload recordings to any batch.</p>
        </Link>
        <Link href="/teacher/batches" className="group rounded-xl border border-orange-200 bg-orange-50 p-5 transition hover:border-orange-400 hover:shadow-sm">
          <BookOpen className="mb-3 h-6 w-6 text-orange-600" />
          <h2 className="font-bold text-gray-900 group-hover:text-orange-700">My Batches</h2>
          <p className="mt-1 text-sm text-gray-500">View all your batches and content.</p>
        </Link>
      </div>

      {/* My Batches */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">My Batches</h2>
          <Link href="/teacher/batches" className="text-sm font-medium text-purple-600 hover:text-purple-700">View all</Link>
        </div>
        {data.batches.length === 0 ? (
          <p className="border-t border-gray-100 py-4 text-sm text-gray-500">No batches yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {data.batches.map((b) => (
              <Link key={b.id} href={`/teacher/batches/${b.id}`} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold text-white ${b.thumbnail_url ? "" : "bg-purple-500"}`}>
                  {b.thumbnail_url ? <img src={b.thumbnail_url} alt="" className="h-10 w-10 rounded-lg object-cover" /> : b.title?.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{b.title}</p>
                  <p className="text-xs text-gray-400">{b.total_students ?? 0} students · {b.total_lectures ?? 0} lectures</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Two column: Upcoming + Recent */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Upcoming classes */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 font-bold text-gray-900">Upcoming Classes</h2>
          {data.upcomingClasses.length === 0 ? (
            <p className="border-t border-gray-100 py-4 text-sm text-gray-500">No live classes scheduled.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.upcomingClasses.map((item: any) => (
                <Link key={item.id} href={`/teacher/live/${item.id}`} className="flex items-center justify-between py-3 text-sm hover:text-purple-600">
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.batches?.title || ""}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(item.status)}`}>{item.status}</span>
                    <span className="text-xs text-gray-400">{new Date(item.scheduled_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent recordings */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 font-bold text-gray-900">Recent Recordings</h2>
          {data.recentRecordings.length === 0 ? (
            <p className="border-t border-gray-100 py-4 text-sm text-gray-500">No recordings uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {data.recentRecordings.map((r: any) => (
                <Link key={r.id} href={`/teacher/batches`} className="group rounded-lg border border-gray-100 p-3 hover:bg-gray-50">
                  <div className={`mb-2 aspect-video rounded-lg bg-gradient-to-br ${r.cloudflare_thumbnail_url ? "" : "from-purple-400 to-purple-600"} flex items-center justify-center overflow-hidden`}>
                    {r.cloudflare_thumbnail_url ? (
                      <img src={r.cloudflare_thumbnail_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Video className="h-8 w-8 text-white/60" />
                    )}
                  </div>
                  <p className="truncate text-sm font-medium text-gray-900 group-hover:text-purple-600">{r.title}</p>
                  <p className="text-xs text-gray-400">{r.batches?.title || ""} · {r.duration_label || "-"}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
