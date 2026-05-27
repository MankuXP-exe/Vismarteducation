import { supabaseAdmin } from "@/lib/supabase/admin";
import SubjectsClient from "./SubjectsClient";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TeacherSubjectsPage() {
  const { data: batches } = await supabaseAdmin
    .from("batches")
    .select("id, title, slug, category, subjects")
    .order("title");

  return (
    <div className="space-y-4">
      <Link href="/teacher" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
        <ChevronLeft className="h-4 w-4" />
        Back
      </Link>
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Subjects</h1>
        <p className="text-sm text-gray-500">Manage subjects across all batches.</p>
      </div>
      <SubjectsClient batches={batches ?? []} />
    </div>
  );
}
