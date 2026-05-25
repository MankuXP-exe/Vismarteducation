"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play, Plus, Search, Loader2 } from "lucide-react";
import Link from "next/link";

interface Lecture {
  id: string;
  title: string;
  cloudflare_thumbnail_url: string | null;
  duration_label: string | null;
  created_at: string;
  lecture_type: string;
  chapters: { title: string } | null;
  subjects: { name: string } | null;
  batch_id: string;
}

export default function TeacherLecturesPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/lectures/list")
      .then((r) => r.json())
      .then((d) => { setLectures(d.lectures || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = lectures.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.chapters?.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Lectures</h1>
          <p className="text-sm text-gray-500">{lectures.length} total lectures</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search lectures..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-purple-300" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-100" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <Play size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-semibold text-gray-900">No lectures found</p>
          <p className="text-sm text-gray-500">Upload lectures from the batch management page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((lec, i) => (
            <motion.div key={lec.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="relative aspect-video bg-gray-100">
                {lec.cloudflare_thumbnail_url ? (
                  <img src={lec.cloudflare_thumbnail_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center"><Play size={32} className="text-gray-300" /></div>
                )}
                {lec.duration_label && (
                  <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-[10px] text-white">{lec.duration_label}</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="mb-1 font-semibold text-gray-900 line-clamp-1">{lec.title}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{lec.subjects?.name || "—"}</span>
                  <span>·</span>
                  <span>{lec.chapters?.title || "—"}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-600">{lec.lecture_type}</span>
                  <span className="text-[10px] text-gray-400">{new Date(lec.created_at).toLocaleDateString("en-IN")}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
