export default function StatsCards({ stats }: { stats: { label: string; value: string }[] }) {
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
