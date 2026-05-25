"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Search, Trash2, Play, Film, X, Eye, EyeOff } from "lucide-react";

type Recording = {
  id: string;
  title: string;
  batch: string;
  subject: string;
  thumbnailUrl: string | null;
  playbackUrl: string | null;
  durationLabel: string;
  durationSeconds: number | null;
  type: string;
  publishedAt: string | null;
  isActive: boolean;
};

export default function RecordingsClient({ recordings }: { recordings: Recording[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [player, setPlayer] = useState<Recording | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = recordings;
    if (filter === "recorded") result = result.filter((r) => r.type === "recorded" || !r.type || r.type === "video");
    else if (filter === "live") result = result.filter((r) => r.type === "live_recording" || r.type === "live");
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.batch.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q)
      );
    }
    return result;
  }, [recordings, search, filter]);

  async function handleToggleActive(id: string, current: boolean) {
    setToggling(id);
    try {
      const res = await fetch("/api/admin/recordings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: current ? "deactivate" : "activate", recordingId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      toast.success(current ? "Recording deactivated" : "Recording activated");
      setTimeout(() => window.location.reload(), 800);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setToggling(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this recording? It will be soft-deleted.")) return;
    setDeleting(id);
    try {
      const res = await fetch("/api/admin/recordings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", recordingId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      toast.success("Recording deleted");
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search recordings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Types</option>
          <option value="recorded">Recorded</option>
          <option value="live">Live Recording</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Film className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No recordings found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="group rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Thumbnail */}
              <button
                onClick={() => r.playbackUrl && setPlayer(r)}
                className="relative w-full aspect-video bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 overflow-hidden"
              >
                {r.thumbnailUrl ? (
                  <img
                    src={r.thumbnailUrl}
                    alt={r.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="w-10 h-10 text-white/40" />
                  </div>
                )}
                {r.playbackUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      <Play className="w-5 h-5 text-purple-600 ml-0.5" />
                    </div>
                  </div>
                )}
                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded font-medium">
                  {r.durationLabel}
                </span>
                {!r.isActive && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded font-medium">
                    Inactive
                  </span>
                )}
              </button>

              {/* Details */}
              <div className="p-3 space-y-1.5">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{r.title}</h3>
                <p className="text-xs text-gray-500">{r.batch} • {r.subject}</p>
                <p className="text-xs text-gray-400">{formatDate(r.publishedAt)}</p>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => r.playbackUrl && setPlayer(r)}
                    disabled={!r.playbackUrl}
                    className="flex items-center gap-1 text-xs text-blue-600 font-medium disabled:text-gray-300 disabled:cursor-not-allowed"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Play
                  </button>

                  <button
                    onClick={() => handleToggleActive(r.id, r.isActive)}
                    disabled={toggling === r.id}
                    className="flex items-center gap-1 text-xs text-gray-600 font-medium hover:text-gray-800 disabled:opacity-50"
                  >
                    {r.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {r.isActive ? "Hide" : "Show"}
                  </button>

                  <button
                    onClick={() => handleDelete(r.id)}
                    disabled={deleting === r.id}
                    className="flex items-center gap-1 text-xs text-red-500 font-medium hover:text-red-700 disabled:opacity-50 ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      {player && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPlayer(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPlayer(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            {player.playbackUrl ? (
              <video
                src={player.playbackUrl}
                controls
                autoPlay
                className="w-full aspect-video"
                poster={player.thumbnailUrl || undefined}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full aspect-video flex items-center justify-center text-white">
                <p>No playback URL available</p>
              </div>
            )}
            <div className="p-4 bg-white">
              <h3 className="font-semibold text-gray-900">{player.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {player.batch} • {player.subject} • {player.durationLabel}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
