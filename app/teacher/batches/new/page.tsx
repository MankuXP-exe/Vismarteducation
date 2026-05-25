import { supabaseAdmin } from "@/lib/supabase/admin";
import NewBatchForm from "./NewBatchForm";

export const dynamic = "force-dynamic";

export default async function NewBatchPage() {
  const { data: batches } = await supabaseAdmin
    .from("batches")
    .select("id, title, slug")
    .order("title");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Batch</h1>
        <p className="mt-1 text-sm text-gray-500">Create a new batch for students to enrol in.</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <NewBatchForm />
      </div>
    </div>
  );
}
