import StatsCards from "@/components/admin/StatsCards";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function getStats() {
  if (!isSupabaseAdminConfigured) {
    return {
      students: 0,
      revenue: 0,
      batches: 0,
      liveToday: 0,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [students, payments, batches, liveToday] = await Promise.all([
    supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    supabaseAdmin.from("payments").select("amount,status").eq("status", "success"),
    supabaseAdmin.from("batches").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabaseAdmin
      .from("live_classes")
      .select("id", { count: "exact", head: true })
      .gte("scheduled_at", today.toISOString())
      .lt("scheduled_at", tomorrow.toISOString()),
  ]);

  return {
    students: students.count ?? 0,
    revenue: (payments.data ?? []).reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
    batches: batches.count ?? 0,
    liveToday: liveToday.count ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin dashboard</h1>
        <p className="text-sm text-gray-500">Live platform totals from Supabase.</p>
      </div>
      <StatsCards
        stats={[
          { label: "Total Students", value: String(stats.students) },
          { label: "Total Revenue", value: `Rs. ${stats.revenue.toLocaleString("en-IN")}` },
          { label: "Active Batches", value: String(stats.batches) },
          { label: "Live Classes Today", value: String(stats.liveToday) },
        ]}
      />
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-bold text-gray-900">Analytics</h2>
        <p className="mt-2 text-sm text-gray-500">
          Charts will appear when there are payments, enrollments, and live class records to plot.
        </p>
      </div>
    </div>
  );
}
