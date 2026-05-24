"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play, Tv } from "lucide-react";
import { studentData } from "@/lib/student-mock-data";
import { motion } from "framer-motion";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function RecentLearningPage() {
  const router = useRouter();
  const { recentLectures } = studentData;

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
          id="back-btn-recent"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-6">Recent Learning</h1>

      {recentLectures.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Tv size={56} className="mb-4 opacity-30" />
          <p className="font-semibold text-lg text-gray-600 mb-1">No recent activity yet</p>
          <p className="text-sm text-center max-w-xs">
            Start watching a lecture to see it here
          </p>
          <Link
            href="/dashboard/batches"
            className="mt-6 px-6 py-2.5 bg-[#5c35d9] text-white rounded-xl text-sm font-semibold hover:bg-[#4a28b8] transition-colors"
          >
            Go to My Batches
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {recentLectures.map((lec) => (
            <div
              key={lec.id}
              className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                <div
                  className="w-24 h-16 rounded-xl shrink-0 flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #ede9ff, #c4b5fd)" }}
                >
                  <Play size={24} className="text-[#5c35d9]" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {lec.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {lec.subject} &nbsp;·&nbsp; {lec.chapter}
                  </p>
                  <p className="text-xs text-gray-400">
                    Batch: {lec.batchTitle}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Last watched: {timeAgo(lec.lastWatched)}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Progress</span>
                      <span className="text-xs font-semibold text-[#5c35d9]">
                        {lec.progress}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#5c35d9] rounded-full transition-all"
                        style={{ width: `${lec.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Action */}
                  <Link
                    href={`/dashboard/batches/${lec.batchId}/accountancy/lecture/${lec.id}`}
                    className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-[#5c35d9] hover:underline"
                  >
                    Continue Watching →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
