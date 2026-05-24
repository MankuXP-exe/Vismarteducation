import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark, FileText, Play } from "lucide-react";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getBookmarks() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/dashboard/study/bookmarks");
  if (!isSupabaseAdminConfigured) return [];

  const { data } = await supabaseAdmin
    .from("bookmarks")
    .select("id,bookmark_type,lecture_id,material_id,created_at")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export default async function BookmarksPage() {
  const bookmarks = await getBookmarks();

  return (
    <div>
      <Link href="/dashboard/study" className="mb-6 inline-flex text-sm font-medium text-gray-500 hover:text-gray-900">
        Back
      </Link>

      <h1 className="mb-6 text-xl font-bold text-gray-900">Bookmarks</h1>

      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-purple-50">
            <Bookmark size={36} className="text-[#5c35d9] opacity-50" />
          </div>
          <p className="mb-1 text-lg font-semibold text-gray-600">No bookmarks yet</p>
          <p className="max-w-xs text-center text-sm text-gray-400">
            Bookmark lectures and notes while watching to save them here.
          </p>
          <Link
            href="/dashboard/batches"
            className="mt-6 rounded-xl bg-[#5c35d9] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#4a28b8]"
          >
            Go to Batches
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarks.map((item: any) => (
            <div key={item.id} className="overflow-hidden rounded-xl border border-gray-100 bg-white">
              <div className="flex h-36 items-center justify-center bg-purple-50">
                {item.bookmark_type === "lecture" ? (
                  <Play size={32} className="text-[#5c35d9]" />
                ) : (
                  <FileText size={32} className="text-blue-500" />
                )}
              </div>
              <div className="p-4">
                <h3 className="truncate text-sm font-semibold text-gray-900">
                  {item.bookmark_type === "lecture" ? "Saved lecture" : "Saved material"}
                </h3>
                <p className="mt-1 text-xs text-gray-400">
                  Bookmarked: {new Date(item.created_at).toLocaleDateString("en-IN")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
