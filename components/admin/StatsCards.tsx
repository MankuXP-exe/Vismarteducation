const defaults = [
  { label: "Total Students", value: "1,248" },
  { label: "Total Revenue", value: "Rs. 18.4L" },
  { label: "Active Batches", value: "16" },
  { label: "Live Classes Today", value: "5" },
];

export default function StatsCards({ stats = defaults }: { stats?: { label: string; value: string }[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">{stat.label}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
