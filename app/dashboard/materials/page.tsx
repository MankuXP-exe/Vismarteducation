"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Search, Download, ExternalLink, BookOpen, ChevronRight, FileIcon } from "lucide-react";
import Link from "next/link";

interface Material {
  id: string;
  title: string;
  file_url: string;
  file_name?: string;
  file_size_bytes?: number;
  file_type?: string;
  material_type: string;
  created_at: string;
  batch_id: string;
  batches: { title: string } | null;
  subjects: { name: string } | null;
  chapters: { title: string } | null;
}

const TYPE_COLORS: Record<string, string> = {
  notes: "bg-blue-50 text-blue-600",
  dpp: "bg-orange-50 text-orange-600",
  dpp_solutions: "bg-green-50 text-green-600",
  reference: "bg-purple-50 text-purple-600",
  assignment: "bg-red-50 text-red-600",
  test_paper: "bg-yellow-50 text-yellow-600",
};

function formatSize(bytes: number): string {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(0) + " KB";
  return bytes + " B";
}

function getFileIcon(fileType?: string, fileName?: string): string {
  const ext = fileName?.split(".").pop()?.toLowerCase() || fileType || "";
  if (ext === "pdf") return "📄";
  if (["doc", "docx"].includes(ext)) return "📝";
  if (["ppt", "pptx"].includes(ext)) return "📊";
  if (["xls", "xlsx"].includes(ext)) return "📈";
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return "🖼️";
  if (["mp4", "webm", "mov", "mkv", "mp3"].includes(ext)) return "🎬";
  if (["zip", "rar", "7z"].includes(ext)) return "📦";
  return "📁";
}

export default function StudentMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetch("/api/materials/student")
      .then((r) => r.json())
      .then((d) => { setMaterials(d.materials || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = materials.filter((m) => {
    if (typeFilter !== "all" && m.material_type !== typeFilter) return false;
    if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const Icon = FileText;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Study Materials</h1>
        <p className="text-sm text-gray-500">{materials.length} materials across your enrolled batches</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search materials..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-purple-300" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none">
          <option value="all">All Types</option>
          <option value="notes">Notes</option>
          <option value="dpp">DPP</option>
          <option value="dpp_solutions">DPP Solutions</option>
          <option value="reference">Reference</option>
          <option value="assignment">Assignment</option>
          <option value="test_paper">Test Paper</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="h-36 animate-pulse rounded-2xl bg-gray-100" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-semibold text-gray-900">No materials available</p>
          <p className="text-sm text-gray-500">Materials shared by your teachers will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="group rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-xl">
                {getFileIcon(m.file_type, m.file_name || m.file_url)}
              </div>
              <h3 className="mb-1 font-semibold text-gray-900 line-clamp-1">{m.title}</h3>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${TYPE_COLORS[m.material_type] || "bg-gray-50 text-gray-600"}`}>
                  {m.material_type.replace("_", " ")}
                </span>
                {m.file_size_bytes ? <span>{formatSize(m.file_size_bytes)}</span> : null}
              </div>
              <div className="mt-1.5 text-[11px] text-gray-400">
                {m.batches?.title && <span>{m.batches.title}</span>}
                {m.subjects?.name && <span> · {m.subjects.name}</span>}
                {m.chapters?.title && <span> · {m.chapters.title}</span>}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button onClick={() => window.open(m.file_url, "_blank")}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-purple-50 py-2 text-xs font-medium text-purple-600 hover:bg-purple-100 transition-colors">
                  <ExternalLink size={12} /> Open
                </button>
                <a href={m.file_url} download={m.file_name || m.title}
                  className="flex items-center justify-center rounded-xl border border-gray-200 p-2 text-gray-400 hover:bg-gray-50 transition-colors"
                  title="Download">
                  <Download size={14} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
