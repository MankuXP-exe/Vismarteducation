"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clock, Play, ArrowLeft, Loader2, BookOpen } from "lucide-react";
import Link from "next/link";

interface HistoryItem {
  id: string;
  lecture_id: string;
  watched_seconds: number;
  total_seconds: number;
  completed: boolean;
  last_watched_at: string;
  lectures: {
    id: string;
    title: string;
    cloudflare_thumbnail_url: string | null;
    cloudflare_playback_url: string | null;
    duration_label: string | null;
    subject_id: string | null;
  } | null;
}

export default function RecentLearningPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/history/recent");
      const data = await res.json();
      setHistory(data.history || []);
    } catch { setHistory([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const progress = (item: HistoryItem) => {
    if (!item.total_seconds) return 0;
    return Math.min(Math.round((item.watched_seconds / item.total_seconds) * 100), 100);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => router.back()} className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft size={16} /> Back
          </button>

          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100">
              <Clock size={24} className="text-orange-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Recent Learning</h1>
              <p className="text-sm text-gray-500">{history.length} lectures watched</p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
              <Clock size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-semibold text-gray-900">No watch history</p>
              <p className="mt-1 text-sm text-gray-500">Start watching lectures to see your progress here.</p>
              <Link href="/dashboard/study" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#5c35d9] px-5 py-2.5 text-sm font-medium text-white">
                Browse Lectures
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item, i) => {
                const pct = progress(item);
                return (
                  <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:shadow-lg hover:-translate-y-0.5">
                    {/* Thumbnail */}
                    <div className="relative h-20 w-36 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                      {item.lectures?.cloudflare_thumbnail_url ? (
                        <img src={item.lectures.cloudflare_thumbnail_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <BookOpen size={24} className="text-gray-300" />
                        </div>
                      )}
                      {/* Progress bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                        <div className="h-full bg-purple-500 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {item.lectures?.title || "Untitled Lecture"}
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {item.lectures?.duration_label || ""}
                        {item.lectures?.duration_label && " · "}
                        {formatTime(item.watched_seconds)} watched
                      </p>
                      {/* Progress text */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                          <div className="h-full rounded-full bg-purple-500 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-500">{pct}%</span>
                      </div>
                      <p className="mt-1 text-[10px] text-gray-400">
                        {new Date(item.last_watched_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {/* Actions */}
                    <Link href={item.lectures?.cloudflare_playback_url ? "#" : "#"}
                      className="flex shrink-0 items-center gap-2 rounded-xl bg-purple-50 px-4 py-2.5 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100">
                      <Play size={16} className="fill-purple-700 text-purple-700" />
                      {pct >= 90 ? "Revisit" : "Continue"}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
