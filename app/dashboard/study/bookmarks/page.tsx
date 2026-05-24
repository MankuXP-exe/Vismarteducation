"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Bookmark, Play, FileText, Trash2 } from "lucide-react";
import { studentData } from "@/lib/student-mock-data";
import { motion } from "framer-motion";

export default function BookmarksPage() {
  const router = useRouter();
  const { bookmarks } = studentData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          id="back-btn-bookmarks"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-6">Bookmarks 🔖</h1>

      {bookmarks.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center mb-4">
            <Bookmark size={36} className="text-[#5c35d9] opacity-50" />
          </div>
          <p className="font-semibold text-lg text-gray-600 mb-1">No bookmarks yet</p>
          <p className="text-sm text-center max-w-xs text-gray-400">
            Bookmark lectures and notes while watching to save them here for quick access.
          </p>
          <button
            onClick={() => router.push("/dashboard/batches")}
            className="mt-6 px-6 py-2.5 bg-[#5c35d9] text-white rounded-xl text-sm font-semibold hover:bg-[#4a28b8] transition-colors"
          >
            Go to My Batches
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarks.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-all group"
            >
              {/* Thumbnail */}
              <div
                className="w-full h-36 flex items-center justify-center"
                style={{
                  background:
                    item.type === "lecture"
                      ? "linear-gradient(135deg, #ede9ff, #c4b5fd)"
                      : "linear-gradient(135deg, #dbeafe, #93c5fd)",
                }}
              >
                {item.type === "lecture" ? (
                  <Play size={32} className="text-[#5c35d9]" />
                ) : (
                  <FileText size={32} className="text-blue-500" />
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-sm text-gray-900 truncate mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-400">
                  {item.subject} · {item.chapter}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Bookmarked: {new Date(item.bookmarkedOn).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                  <button className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#5c35d9] border border-[#5c35d9]/30 py-2 rounded-lg hover:bg-purple-50 transition-colors">
                    {item.type === "lecture" ? (
                      <>
                        <Play size={12} /> Watch
                      </>
                    ) : (
                      <>
                        <FileText size={12} /> View
                      </>
                    )}
                  </button>
                  <button
                    aria-label="Remove bookmark"
                    className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
