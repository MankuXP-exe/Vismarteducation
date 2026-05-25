import { supabaseAdmin } from "@/lib/supabase/admin";
import SubjectsClient from "./SubjectsClient";

export const dynamic = "force-dynamic";

export default async function AdminSubjectsPage() {
  const { data: batches } = await supabaseAdmin
    .from("batches")
    .select("id, title, slug, category, subjects")
    .order("title");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
        <p className="text-sm text-gray-500">Manage subjects across all batches.</p>
      </div>
      <SubjectsClient batches={batches ?? []} />
    </div>
  );
}
