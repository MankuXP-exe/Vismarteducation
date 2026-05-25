import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";
import StatsCards from "@/components/admin/StatsCards";
import {
  Users,
  GraduationCap,
  Layers,
  IndianRupee,
  Video,
  FileText,
  Activity,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getStats() {
  if (!isSupabaseAdminConfigured) {
    return {
      students: 0,
      teachers: 0,
      batches: 0,
      activeEnrollments: 0,
      revenue: 0,
      liveToday: 0,
      pendingConcessions: 0,
      recentPayments: [],
      recentLiveClasses: [],
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    studentsRes,
    teachersRes,
    batchesRes,
    enrollmentsRes,
    paymentsRes,
    liveTodayRes,
    concessionsRes,
    recentPaymentsRes,
    recentLiveClassesRes,
  ] = await Promise.all([
    supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "teacher"),
    supabaseAdmin.from("batches").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabaseAdmin.from("enrollments").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabaseAdmin.from("payments").select("amount,status").eq("status", "success"),
    supabaseAdmin
      .from("live_classes")
      .select("id", { count: "exact", head: true })
      .gte("scheduled_at", today.toISOString())
      .lt("scheduled_at", tomorrow.toISOString()),
    supabaseAdmin.from("concession_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabaseAdmin
      .from("payments")
      .select("id,amount,discount_type,razorpay_payment_id,status,created_at,student:profiles!student_id(full_name),batch:batches(title)")
      .order("created_at", { ascending: false })
      .limit(10),
    supabaseAdmin
      .from("live_classes")
      .select("id,title,scheduled_at,status,teacher:profiles!teacher_id(full_name)")
      .order("scheduled_at", { ascending: true })
      .gte("scheduled_at", today.toISOString())
      .limit(5),
  ]);

  return {
    students: studentsRes.count ?? 0,
    teachers: teachersRes.count ?? 0,
    batches: batchesRes.count ?? 0,
    activeEnrollments: enrollmentsRes.count ?? 0,
    revenue: (paymentsRes.data ?? []).reduce((sum, p) => sum + Number(p.amount || 0), 0),
    liveToday: liveTodayRes.count ?? 0,
    pendingConcessions: concessionsRes.count ?? 0,
    recentPayments: (recentPaymentsRes.data ?? []).map((p: any) => ({
      id: p.id,
      student: p.student?.full_name || "—",
      batch: p.batch?.title || "—",
      amount: Number(p.amount || 0),
      discount: p.discount_type || null,
      razorpayId: p.razorpay_payment_id,
      status: p.status,
      createdAt: p.created_at,
    })),
    recentLiveClasses: (recentLiveClassesRes.data ?? []).map((lc: any) => ({
      id: lc.id,
      title: lc.title,
      scheduledAt: lc.scheduled_at,
      status: lc.status,
      teacher: lc.teacher?.full_name || "—",
    })),
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
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || "bg-gray-50 text-gray-700 ring-1 ring-gray-300"}`}>
      {status}
    </span>
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
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || "bg-gray-50 text-gray-700"}`}>
      {status}
    </span>
  );
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Live platform overview from Supabase.</p>
      </div>

      {/* Stats Cards */}
      <StatsCards
        stats={[
          { label: "Total Students", value: String(stats.students) },
          { label: "Total Teachers", value: String(stats.teachers) },
          { label: "Active Batches", value: String(stats.batches) },
          { label: "Active Enrollments", value: String(stats.activeEnrollments) },
          { label: "Revenue", value: `₹${stats.revenue.toLocaleString("en-IN")}` },
          { label: "Live Classes Today", value: String(stats.liveToday) },
          { label: "Pending Concessions", value: String(stats.pendingConcessions) },
        ]}
      />

      {/* Recent Payments */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-emerald-500" />
            Recent Payments
          </h2>
          <Link
            href="/admin/payments"
            className="text-xs font-medium text-purple-600 hover:text-purple-800 flex items-center gap-1"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {stats.recentPayments.length === 0 ? (
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
                  <th className="px-5 py-3 font-semibold hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentPayments.map((p: any) => (
                  <tr key={p.id} className="border-t border-gray-100">
                    <td className="px-5 py-3 text-gray-700">{p.student}</td>
                    <td className="px-5 py-3 text-gray-700">{p.batch}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">
                      ₹{p.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-3 text-gray-500 hidden md:table-cell whitespace-nowrap">
                      {p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upcoming Live Classes */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Video className="h-4 w-4 text-red-500" />
            Upcoming Live Classes
          </h2>
          <Link
            href="/admin/live-classes"
            className="text-xs font-medium text-purple-600 hover:text-purple-800 flex items-center gap-1"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {stats.recentLiveClasses.length === 0 ? (
          <div className="p-5 text-sm text-gray-500 text-center">No upcoming live classes.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {stats.recentLiveClasses.map((lc: any) => (
              <div key={lc.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-2 w-2 rounded-full flex-shrink-0 ${
                      lc.status === "live"
                        ? "bg-red-500 animate-pulse"
                        : lc.status === "scheduled"
                          ? "bg-blue-500"
                          : "bg-gray-300"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{lc.title}</p>
                    <p className="text-xs text-gray-500">{lc.teacher}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-gray-500">
                    {new Date(lc.scheduledAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <LiveStatusBadge status={lc.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
