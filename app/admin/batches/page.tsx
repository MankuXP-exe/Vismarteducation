import Link from "next/link";
import { batches } from "@/lib/batches-data";

export default function AdminBatchesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Batches</h1>
        <p className="text-sm text-gray-500">Create, price, publish, and archive batches.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {batches.map((batch) => (
          <Link key={batch.id} href={`/batches/${batch.id}`} className="rounded-lg border border-gray-200 bg-white p-5 hover:border-[#5c35d9]">
            <h2 className="font-bold text-gray-900">{batch.title}</h2>
            <p className="mt-2 text-sm text-gray-500">{batch.category}</p>
            <p className="mt-4 text-sm font-semibold text-gray-700">Rs. {batch.price.toLocaleString("en-IN")}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
