import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";
import StartInstantLive from "@/components/teacher/StartInstantLive";

export const dynamic = "force-dynamic";

async function getBatches() {
  if (!isSupabaseAdminConfigured) return [];
  const { data } = await supabaseAdmin
    .from("batches")
    .select("id,title,category")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function StartLivePage() {
  const batches = await getBatches();
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Start instant live class</h1>
        <p className="text-sm text-gray-500">Fill in the details and begin streaming immediately.</p>
      </div>
      <StartInstantLive batches={batches} />
    </div>
  );
}
