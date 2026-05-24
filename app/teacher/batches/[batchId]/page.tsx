import BatchManager from "@/components/teacher/BatchManager";
import Link from "next/link";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";

export default async function ManageBatchPage({ params }: { params: Promise<{ batchId: string }> }) {
  const { batchId } = await params;
  const { data: liveClasses } = isSupabaseAdminConfigured
    ? await supabaseAdmin
        .from("live_classes")
        .select("id,title,scheduled_at,status")
        .eq("batch_id", batchId)
        .order("scheduled_at", { ascending: false })
        .limit(8)
    : { data: [] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage batch</h1>
        <p className="text-sm text-gray-500">Batch ID: {batchId}</p>
      </div>
      <BatchManager batchId={batchId} />
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-bold text-gray-900">Live classes</h2>
        {!liveClasses || liveClasses.length === 0 ? (
          <p className="border-t border-gray-100 py-4 text-sm text-gray-500">No live classes scheduled for this batch.</p>
        ) : (
          liveClasses.map((liveClass) => (
            <Link
              key={liveClass.id}
              href={`/teacher/live/${liveClass.id}`}
              className="flex items-center justify-between border-t border-gray-100 py-3 text-sm hover:text-[#5c35d9]"
            >
              <span className="font-medium">{liveClass.title}</span>
              <span className="text-gray-500">
                {liveClass.status} · {new Date(liveClass.scheduled_at).toLocaleString("en-IN")}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
