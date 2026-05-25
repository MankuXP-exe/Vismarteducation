"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bookmark, Trash2, Search, ArrowLeft, BookOpen, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";

interface BookmarkItem {
  id: string;
  lecture_id: string | null;
  note_title: string | null;
  note_url: string | null;
  note_type: string;
  created_at: string;
  lectures: { id: string; title: string; cloudflare_thumbnail_url: string | null; duration_label: string | null } | null;
}

export default function BookmarksPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");

  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort, q: search });
      const res = await fetch(`/api/bookmarks?${params}`);
      const data = await res.json();
      setBookmarks(data.bookmarks || []);
    } catch { setBookmarks([]); }
    setLoading(false);
  }, [sort, search]);

  useEffect(() => { fetchBookmarks(); }, [fetchBookmarks]);

  const removeBookmark = async (id: string) => {
    await fetch("/api/bookmarks/remove", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookmarkId: id }),
    });
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => router.back()} className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft size={16} /> Back
          </button>

          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100">
              <Bookmark size={24} className="text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Bookmarks</h1>
              <p className="text-sm text-gray-500">{bookmarks.length} saved items</p>
            </div>
          </div>

          {/* Search + Sort */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" placeholder="Search bookmarks..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-purple-300"
              />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-purple-300">
              <option value="recent">Most Recent</option>
              <option value="subject">Subject</option>
            </select>
          </div>

          {/* Bookmark Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
              <Bookmark size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-semibold text-gray-900">No bookmarks yet</p>
              <p className="mt-1 text-sm text-gray-500">Save lectures and notes to access them quickly.</p>
              <Link href="/dashboard/study" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#5c35d9] px-5 py-2.5 text-sm font-medium text-white">
                Browse Lectures
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bookmarks.map((bm, i) => (
                <motion.div key={bm.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all hover:shadow-xl hover:-translate-y-1">
                  <button onClick={() => removeBookmark(bm.id)}
                    className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-400 opacity-0 shadow transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100">
                    <Trash2 size={14} />
                  </button>
                  <div className="p-5">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                      <BookOpen size={22} className="text-purple-600" />
                    </div>
                    <h3 className="mb-1 font-semibold text-gray-900 line-clamp-2">
                      {bm.lectures?.title || bm.note_title || "Untitled"}
                    </h3>
                    {bm.lectures?.duration_label && (
                      <p className="text-xs text-gray-400">{bm.lectures.duration_label}</p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-medium text-purple-600">
                        {bm.note_type}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(bm.created_at).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    {bm.lectures?.id && (
                      <Link href={`/dashboard/batches/lecture/${bm.lectures.id}`}
                        className="mt-3 flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-700">
                        Open <ExternalLink size={12} />
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
