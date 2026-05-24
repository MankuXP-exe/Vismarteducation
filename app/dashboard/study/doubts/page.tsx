import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle, Clock, HelpCircle } from "lucide-react";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getDoubts() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/dashboard/study/doubts");
  if (!isSupabaseAdminConfigured) return [];

  const { data } = await supabaseAdmin
    .from("doubts")
    .select("id,batch_id,lecture_id,question,answer,status,asked_at")
    .eq("student_id", user.id)
    .order("asked_at", { ascending: false });

  return data ?? [];
}

export default async function DoubtsPage() {
  const doubts = await getDoubts();

  return (
    <div>
      <Link href="/dashboard/study" className="mb-6 inline-flex text-sm font-medium text-gray-500 hover:text-gray-900">
        Back
      </Link>

      <h1 className="mb-5 text-xl font-bold text-gray-900">My Doubts</h1>

      {doubts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <HelpCircle size={56} className="mb-4 opacity-30" />
          <p className="mb-1 text-lg font-semibold text-gray-600">No doubts asked yet</p>
          <p className="max-w-xs text-center text-sm">Ask doubts directly from lecture videos.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {doubts.map((doubt: any) => {
            const answered = doubt.status === "answered";
            return (
              <div key={doubt.id} className="rounded-xl border border-gray-100 bg-white p-5">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Doubt</p>
                    <p className="mt-1 text-xs text-gray-400">
                      Asked: {new Date(doubt.asked_at).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <span
                    className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      answered ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {answered ? <CheckCircle size={12} /> : <Clock size={12} />}
                    {answered ? "Answered" : "Pending"}
                  </span>
                </div>
                <div className="mb-3 rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-sm leading-relaxed text-gray-600">{doubt.question}</p>
                </div>
                {doubt.answer && (
                  <div className="rounded-xl bg-green-50 px-4 py-3">
                    <p className="text-sm leading-relaxed text-green-800">{doubt.answer}</p>
                  </div>
                )}
                {doubt.lecture_id && (
                  <Link
                    href={`/dashboard/batches/${doubt.batch_id}`}
                    className="mt-3 inline-flex text-xs font-medium text-[#5c35d9] hover:underline"
                  >
                    Open batch
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
