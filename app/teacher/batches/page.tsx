import Link from "next/link";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function getBatches() {
  if (!isSupabaseAdminConfigured) return [];

  const { data, error } = await supabaseAdmin
    .from("batches")
    .select("id,title,category,subjects,total_students,total_lectures,is_active")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export default async function TeacherBatchesPage() {
  const batches = await getBatches();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My batches</h1>
        <p className="text-sm text-gray-500">Open a batch to manage content and live classes.</p>
      </div>
      {batches.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500">
          No active batches found.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {batches.map((batch) => (
            <Link
              key={batch.id}
              href={`/teacher/batches/${batch.id}`}
              className="rounded-lg border border-gray-200 bg-white p-5 hover:border-[#5c35d9]"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[#5c35d9]">{batch.category}</p>
              <h2 className="mt-2 font-bold text-gray-900">{batch.title}</h2>
              <p className="mt-2 text-sm text-gray-500">
                {Array.isArray(batch.subjects) && batch.subjects.length > 0
                  ? batch.subjects.join(", ")
                  : "Subjects will appear after setup"}
              </p>
              <p className="mt-4 text-sm font-semibold text-gray-700">
                {batch.total_students ?? 0} students · {batch.total_lectures ?? 0} lectures
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
