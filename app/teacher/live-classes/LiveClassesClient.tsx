"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Search, ExternalLink, Trash2, Play, Users, Clock, ChevronLeft, ChevronRight, Video } from "lucide-react";

type LiveClass = {
  id: string;
  title: string;
  batch: string;
  teacher: string;
  status: string;
  scheduledAt: string | null;
  duration: number | null;
  recordingUrl: string | null;
  hasRecording: boolean;
  attendees: number;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string | null;
};

const STATUS_STYLE: Record<string, { label: string; classes: string }> = {
  scheduled: { label: "Scheduled", classes: "bg-yellow-100 text-yellow-800" },
  live: { label: "Live", classes: "bg-green-100 text-green-800 animate-pulse" },
  completed: { label: "Completed", classes: "bg-blue-100 text-blue-800" },
  cancelled: { label: "Cancelled", classes: "bg-gray-100 text-gray-600" },
};

const PAGE_SIZE = 20;

export default function LiveClassesClient({ classes }: { classes: LiveClass[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = classes;
    if (filter !== "all") {
      result = result.filter((c) => c.status === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.batch.toLowerCase().includes(q) ||
          c.teacher.toLowerCase().includes(q)
      );
    }
    return result;
  }, [classes, search, filter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  async function handleDelete(id: string) {
    if (!confirm("Delete this live class? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch("/api/admin/live-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", classId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      toast.success("Live class deleted");
      setTimeout(() => window.location.reload(), 800);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  }

  function formatDate(d: string | null) {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  function formatTime(d: string | null) {
    if (!d) return "";
    return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, batch, teacher..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(0); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="live">Live</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {paginated.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No live classes found.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3">Teacher</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Scheduled</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Attendees</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((c) => {
                  const s = STATUS_STYLE[c.status] || { label: c.status, classes: "bg-gray-100" };
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{c.title}</td>
                      <td className="px-4 py-3 text-gray-600">{c.batch}</td>
                      <td className="px-4 py-3 text-gray-600">{c.teacher}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${s.classes}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {c.scheduledAt ? (
                          <span title={formatTime(c.scheduledAt)}>
                            {formatDate(c.scheduledAt)}
                          </span>
                        ) : "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {c.duration ? `${c.duration}m` : "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {c.attendees}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {c.hasRecording && (
                            <a
                              href={c.recordingUrl || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                              title="View recording"
                            >
                              <Play className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDelete(c.id)}
                            disabled={deleting === c.id}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="md:hidden space-y-3">
            {paginated.map((c) => {
              const s = STATUS_STYLE[c.status] || { label: c.status, classes: "bg-gray-100" };
              return (
                <div key={c.id} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm truncate">{c.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{c.batch} • {c.teacher}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${s.classes}`}>
                      {s.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {c.scheduledAt ? formatDate(c.scheduledAt) : "-"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {c.attendees}
                    </span>
                    {c.duration && <span>{c.duration}m</span>}
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                    {c.hasRecording && (
                      <a
                        href={c.recordingUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-blue-600 font-medium"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Recording
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={deleting === c.id}
                      className="flex items-center gap-1.5 text-xs text-red-500 font-medium disabled:opacity-50 ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <p className="text-gray-500 text-xs">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                  const p = start + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                        p === page ? "bg-purple-600 text-white" : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {p + 1}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
