import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, CheckCircle, Package } from "lucide-react";
import { getEffectiveRole } from "@/lib/auth/roles";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type BatchRow = {
  id: string;
  title: string;
  subtitle?: string | null;
  thumbnail_url?: string | null;
  banner_url?: string | null;
  language?: string | null;
  category?: string | null;
  is_active?: boolean | null;
};

type BatchCard = {
  batch: BatchRow;
  status: "active" | "expired" | "pending";
  accessEndDate?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function getVisibleBatches() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/dashboard/batches");

  if (!isSupabaseAdminConfigured) {
    return { cards: [] as BatchCard[], role: "student" };
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = getEffectiveRole(user, profile);
  const canManage = role === "teacher" || role === "admin";

  if (canManage) {
    const { data } = await supabaseAdmin
      .from("batches")
      .select("id,title,subtitle,thumbnail_url,banner_url,language,category,is_active")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    return {
      role,
      cards: (data ?? []).map((batch) => ({
        batch,
        status: "active" as const,
        accessEndDate: null,
      })),
    };
  }

  const { data } = await supabaseAdmin
    .from("enrollments")
    .select(
      `
      status,
      access_end_date,
      batch:batches(
        id,title,subtitle,thumbnail_url,banner_url,language,category,is_active
      )
    `
    )
    .eq("student_id", user.id)
    .order("enrolled_at", { ascending: false });

  return {
    role,
    cards: (data ?? [])
      .map((item: any) => ({
        batch: item.batch as BatchRow,
        status: (item.status ?? "pending") as BatchCard["status"],
        accessEndDate: item.access_end_date as string | null,
      }))
      .filter((item) => item.batch?.id),
  };
}

export default async function BatchesPage() {
  const { cards, role } = await getVisibleBatches();
  const canManage = role === "teacher" || role === "admin";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          {canManage ? "All Batches" : "My Batches"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {canManage
            ? "Real batches from Supabase. Uploaded lectures appear inside their subject and chapter."
            : "Your enrolled batches from Supabase."}
        </p>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center text-gray-400">
          <Package size={42} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No batches found</p>
          <p className="mt-1 text-sm">
            {canManage
              ? "Create an active batch first."
              : "You are not enrolled in any batch yet."}
          </p>
          {!canManage && (
            <Link
              href="/batches"
              className="mt-4 inline-block rounded-lg bg-[#5c35d9] px-5 py-2 text-sm font-medium text-white hover:bg-[#4a28b8]"
            >
              Browse Batches
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ batch, status, accessEndDate }) => {
            const isExpired = status === "expired";
            const image = batch.thumbnail_url || batch.banner_url || "/images/logo-transparentbg.png";
            const expiresOn = formatDate(accessEndDate);

            return (
              <div key={batch.id} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                <div className="mb-3 px-1">
                  <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
                    {batch.title}
                  </h3>
                  {batch.subtitle && (
                    <p className="mt-1 line-clamp-1 text-xs text-gray-500">{batch.subtitle}</p>
                  )}
                </div>

                <div className={`relative mb-3 aspect-video overflow-hidden rounded-lg bg-gray-100 ${isExpired ? "opacity-60 grayscale" : ""}`}>
                  <img src={image} alt={batch.title} className="h-full w-full object-cover" />
                  {batch.language && (
                    <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                      {batch.language}
                    </span>
                  )}
                </div>

                <div className="mb-3 flex items-center gap-1.5 px-1">
                  {isExpired ? (
                    <>
                      <AlertCircle size={14} className="text-red-500" />
                      <span className="text-xs font-medium text-red-500">Batch Expired</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} className="text-green-500" />
                      <span className="text-xs font-medium text-green-600">Active</span>
                      {expiresOn && (
                        <span className="text-xs text-gray-400">Expires {expiresOn}</span>
                      )}
                    </>
                  )}
                </div>

                <Link
                  href={`/dashboard/batches/${batch.id}`}
                  className="block w-full rounded-lg bg-[#5c35d9] py-2.5 text-center text-sm font-semibold text-white hover:bg-[#4a28b8]"
                >
                  Open Batch
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
