import Link from "next/link";
import { batches } from "@/lib/batches-data";

export default function TeacherBatchesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My batches</h1>
        <p className="text-sm text-gray-500">Open a batch to manage content and live classes.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {batches.slice(0, 6).map((batch) => (
          <Link key={batch.id} href={`/teacher/batches/${batch.id}`} className="rounded-lg border border-gray-200 bg-white p-5 hover:border-[#5c35d9]">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5c35d9]">{batch.category}</p>
            <h2 className="mt-2 font-bold text-gray-900">{batch.title}</h2>
            <p className="mt-2 text-sm text-gray-500">{batch.subjects?.join(", ")}</p>
            <p className="mt-4 text-sm font-semibold text-gray-700">{batch.students}+ students</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
