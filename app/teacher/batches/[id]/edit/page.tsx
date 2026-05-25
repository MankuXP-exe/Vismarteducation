import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import EditBatchForm from "./EditBatchForm";

export const dynamic = "force-dynamic";

export default async function EditBatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: batch } = await supabaseAdmin.from("batches").select("*").eq("id", id).single();
  if (!batch) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Batch</h1>
        <p className="mt-1 text-sm text-gray-500">{batch.title}</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <EditBatchForm batch={batch} />
      </div>
    </div>
  );
}
