import StatsCards from "@/components/admin/StatsCards";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500">Learning behavior, growth, and revenue trends.</p>
      </div>
      <StatsCards
        stats={[
          { label: "Avg watch time", value: "42m" },
          { label: "Completion rate", value: "68%" },
          { label: "Doubts answered", value: "914" },
          { label: "Storage used", value: "2.4GB" },
        ]}
      />
      <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-600">
        Connect Supabase production data to populate advanced charts.
      </div>
    </div>
  );
}
