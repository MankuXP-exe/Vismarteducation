import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminBatchesPage() {
  const { data: batches } = await supabaseAdmin
    .from("batches")
    .select("id, title, category, price, is_active, total_students, thumbnail_url, slug")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Batches</h1>
          <p className="text-sm text-gray-500">Create, edit, and manage all batches.</p>
        </div>
        <Link
          href="/admin/batches/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700"
        >
          + New Batch
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-600">Batch</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Category</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Price</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Students</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(!batches || batches.length === 0) && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No batches found.</td></tr>
            )}
            {batches?.map((batch) => (
              <tr key={batch.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {batch.thumbnail_url ? (
                      <img src={batch.thumbnail_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 font-bold">
                        {batch.title?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <Link href={`/admin/batches/${batch.id}`} className="font-medium text-gray-900 hover:text-purple-600">
                        {batch.title}
                      </Link>
                      <p className="text-xs text-gray-400">{batch.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{batch.category}</td>
                <td className="px-4 py-3 text-right font-medium">₹{batch.price?.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-center">{batch.total_students ?? 0}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${batch.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {batch.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/batches/${batch.id}/edit`}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-purple-600 hover:bg-purple-50"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
