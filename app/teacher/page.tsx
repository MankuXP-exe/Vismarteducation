import Link from "next/link";
import {
  CalendarPlus, Upload, Users, Video, Zap, BookOpen, Radio,
  IndianRupee, ArrowRight,
} from "lucide-react";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";
import StatsCards from "@/components/teacher/StatsCards";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  if (!isSupabaseAdminConfigured) {
    return {
      students: 0, teachers: 0, batches: 0, activeEnrollments: 0,
      revenue: 0, liveToday: 0, pendingConcessions: 0, lectureCount: 0,
      recentPayments: [], recentLiveClasses: [],
      myBatches: [], recentRecordings: [],
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    studentsRes, teachersRes, batchesRes, enrollmentsRes,
    paymentsRes, liveTodayRes, concessionsRes, lecturesRes,
    recentPaymentsRes, recentLiveClassesRes,
    myBatchesRes, recentRecsRes,
  ] = await Promise.all([
    supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "teacher"),
    supabaseAdmin.from("batches").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabaseAdmin.from("enrollments").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabaseAdmin.from("payments").select("amount,status").eq("status", "success"),
    supabaseAdmin.from("live_classes").select("id", { count: "exact", head: true }).in("status", ["scheduled", "live"]).gte("scheduled_at", today.toISOString()),
    supabaseAdmin.from("concession_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabaseAdmin.from("lectures").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabaseAdmin.from("payments").select("id,amount,discount_type,razorpay_payment_id,status,created_at,student:profiles!student_id(full_name),batch:batches(title)").order("created_at", { ascending: false }).limit(10),
    supabaseAdmin.from("live_classes").select("id,title,scheduled_at,status,teacher:profiles!teacher_id(full_name)").order("scheduled_at", { ascending: true }).gte("scheduled_at", today.toISOString()).limit(5),
    supabaseAdmin.from("batches").select("id,title,slug,thumbnail_url,total_students,total_lectures,is_active").eq("is_active", true).order("created_at", { ascending: false }).limit(10),
    supabaseAdmin.from("lectures").select("id,title,cloudflare_playback_url,cloudflare_thumbnail_url,duration_label,lecture_type,published_at,batches(title),subjects(name)").eq("is_active", true).order("published_at", { ascending: false }).limit(6),
  ]);

  return {
    students: studentsRes.count ?? 0,
    teachers: teachersRes.count ?? 0,
    batches: batchesRes.count ?? 0,
    activeEnrollments: enrollmentsRes.count ?? 0,
    revenue: (paymentsRes.data ?? []).reduce((sum, p) => sum + Number(p.amount || 0), 0),
    liveToday: liveTodayRes.count ?? 0,
    pendingConcessions: concessionsRes.count ?? 0,
    lectureCount: lecturesRes.count ?? 0,
    recentPayments: (recentPaymentsRes.data ?? []).map((p: any) => ({
      id: p.id, student: p.student?.full_name || "—", batch: p.batch?.title || "—",
      amount: Number(p.amount || 0), discount: p.discount_type || null,
      razorpayId: p.razorpay_payment_id, status: p.status, createdAt: p.created_at,
    })),
    recentLiveClasses: (recentLiveClassesRes.data ?? []).map((lc: any) => ({
      id: lc.id, title: lc.title, scheduledAt: lc.scheduled_at,
      status: lc.status, teacher: lc.teacher?.full_name || "—",
    })),
    myBatches: myBatchesRes.data ?? [],
    recentRecordings: recentRecsRes.data ?? [],
  };
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
    pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
    failed: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
    refunded: "bg-purple-50 text-purple-700 ring-1 ring-purple-600/20",
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || "bg-gray-50 text-gray-700 ring-1 ring-gray-300"}`}>{status}</span>
  );
}

function LiveStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    live: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
    scheduled: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
    completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
    cancelled: "bg-gray-50 text-gray-600 ring-1 ring-gray-300",
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || "bg-gray-50 text-gray-700"}`}>{status}</span>
  );
}

export default async function TeacherDashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6 p-4 md:p-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Manage batches, live classes, recordings, and more.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Link href="/teacher/live/start" className="rounded-xl border border-green-200 bg-green-50 p-4 transition hover:border-green-400 hover:shadow-sm">
          <Zap className="mb-2 h-5 w-5 text-green-600" />
          <p className="font-semibold text-gray-900">Go Live</p>
          <p className="text-xs text-gray-500">Instant live class</p>
        </Link>
        <Link href="/teacher/batches" className="rounded-xl border border-purple-200 bg-purple-50 p-4 transition hover:border-purple-400 hover:shadow-sm">
          <CalendarPlus className="mb-2 h-5 w-5 text-purple-600" />
          <p className="font-semibold text-gray-900">Schedule</p>
          <p className="text-xs text-gray-500">Schedule a class</p>
        </Link>
        <Link href="/teacher/batches" className="rounded-xl border border-blue-200 bg-blue-50 p-4 transition hover:border-blue-400 hover:shadow-sm">
          <Upload className="mb-2 h-5 w-5 text-blue-600" />
          <p className="font-semibold text-gray-900">Upload</p>
          <p className="text-xs text-gray-500">Upload lecture</p>
        </Link>
        <Link href="/teacher/batches/new" className="rounded-xl border border-orange-200 bg-orange-50 p-4 transition hover:border-orange-400 hover:shadow-sm">
          <BookOpen className="mb-2 h-5 w-5 text-orange-600" />
          <p className="font-semibold text-gray-900">New Batch</p>
          <p className="text-xs text-gray-500">Create a batch</p>
        </Link>
      </div>

      {/* Stats */}
      <StatsCards
        stats={[
          { label: "Students", value: String(data.students) },
          { label: "Teachers", value: String(data.teachers) },
          { label: "Active Batches", value: String(data.batches) },
          { label: "Enrollments", value: String(data.activeEnrollments) },
          { label: "Revenue", value: `₹${data.revenue.toLocaleString("en-IN")}` },
          { label: "Live Today", value: String(data.liveToday) },
          { label: "Lectures", value: String(data.lectureCount) },
          { label: "Pending Concessions", value: String(data.pendingConcessions) },
        ]}
      />

      {/* My Batches */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">My Batches</h2>
          <Link href="/teacher/batches" className="text-sm font-medium text-purple-600 hover:text-purple-700">View all</Link>
        </div>
        {data.myBatches.length === 0 ? (
          <p className="border-t border-gray-100 py-4 text-sm text-gray-500">No batches yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {data.myBatches.map((b: any) => (
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

      {/* Two column: Payments + Upcoming Live */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Recent Payments */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-emerald-500" />
              Recent Payments
            </h2>
            <Link href="/teacher/payments" className="text-xs font-medium text-purple-600 hover:text-purple-800 flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {data.recentPayments.length === 0 ? (
            <div className="p-5 text-sm text-gray-500 text-center">No payments yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Student</th>
                    <th className="px-5 py-3 font-semibold">Batch</th>
                    <th className="px-5 py-3 font-semibold">Amount</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="hidden px-5 py-3 font-semibold md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentPayments.map((p: any) => (
                    <tr key={p.id} className="border-t border-gray-100">
                      <td className="px-5 py-3 text-gray-700">{p.student}</td>
                      <td className="px-5 py-3 text-gray-700">{p.batch}</td>
                      <td className="px-5 py-3 font-medium text-gray-900">₹{p.amount.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                      <td className="hidden whitespace-nowrap px-5 py-3 text-gray-500 md:table-cell">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming Live Classes */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Radio className="h-4 w-4 text-red-500" />
              Upcoming Live Classes
            </h2>
            <Link href="/teacher/live-classes" className="text-xs font-medium text-purple-600 hover:text-purple-800 flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {data.recentLiveClasses.length === 0 ? (
            <div className="p-5 text-sm text-gray-500 text-center">No upcoming live classes.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.recentLiveClasses.map((lc: any) => (
                <div key={lc.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-2 w-2 shrink-0 rounded-full ${lc.status === "live" ? "bg-red-500 animate-pulse" : lc.status === "scheduled" ? "bg-blue-500" : "bg-gray-300"}`} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">{lc.title}</p>
                      <p className="text-xs text-gray-500">{lc.teacher}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-gray-500">
                      {new Date(lc.scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <LiveStatusBadge status={lc.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Recordings */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Recent Recordings</h2>
          <Link href="/teacher/recordings" className="text-sm font-medium text-purple-600 hover:text-purple-700">View all</Link>
        </div>
        {data.recentRecordings.length === 0 ? (
          <p className="border-t border-gray-100 py-4 text-sm text-gray-500">No recordings uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {data.recentRecordings.map((r: any) => (
              <Link key={r.id} href="/teacher/recordings" className="group rounded-lg border border-gray-100 p-3 hover:bg-gray-50">
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
  );
}
