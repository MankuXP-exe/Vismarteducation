"use client";

import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Search, Trash2, Play, Film, X, Eye, EyeOff, UploadCloud, ImagePlus } from "lucide-react";

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

type Batch = {
  id: string;
  title: string;
  subjects: string[] | null;
};

export default function RecordingsClient({ recordings, batches }: { recordings: Recording[]; batches: Batch[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [player, setPlayer] = useState<Recording | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

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
    if (!confirm("Delete this recording permanently?")) return;
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
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
        <button
          onClick={() => setShowUpload(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
        >
          <UploadCloud className="h-4 w-4" />
          Upload
        </button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <Film className="mx-auto mb-3 h-12 w-12 opacity-50" />
          <p className="text-sm">No recordings found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((r) => (
            <div key={r.id} className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg">
              <button
                onClick={() => r.playbackUrl && setPlayer(r)}
                className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600"
              >
                {r.thumbnailUrl ? (
                  <img src={r.thumbnailUrl} alt={r.title} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Film className="h-10 w-10 text-white/40" />
                  </div>
                )}
                {r.playbackUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      <Play className="ml-0.5 h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                )}
                <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
                  {r.durationLabel}
                </span>
                {!r.isActive && (
                  <span className="absolute left-2 top-2 rounded bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                    Inactive
                  </span>
                )}
              </button>
              <div className="space-y-1.5 p-3">
                <h3 className="line-clamp-2 text-sm font-medium leading-snug text-gray-900">{r.title}</h3>
                <p className="text-xs text-gray-500">{r.batch} • {r.subject}</p>
                <p className="text-xs text-gray-400">{formatDate(r.publishedAt)}</p>
                <div className="flex items-center gap-2 border-t border-gray-100 pt-2">
                  <button onClick={() => r.playbackUrl && setPlayer(r)} disabled={!r.playbackUrl} className="flex items-center gap-1 text-xs font-medium text-blue-600 disabled:cursor-not-allowed disabled:text-gray-300">
                    <Play className="h-3.5 w-3.5" /> Play
                  </button>
                  <button onClick={() => handleToggleActive(r.id, r.isActive)} disabled={toggling === r.id} className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-800 disabled:opacity-50">
                    {r.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {r.isActive ? "Hide" : "Show"}
                  </button>
                  <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id} className="ml-auto flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal
          batches={batches}
          onClose={() => setShowUpload(false)}
        />
      )}

      {/* Video Player Modal */}
      {player && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPlayer(null)}>
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPlayer(null)} className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80">
              <X className="h-4 w-4" />
            </button>
            {player.playbackUrl ? (
              <video src={player.playbackUrl} controls autoPlay className="aspect-video w-full" poster={player.thumbnailUrl || undefined}>
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="flex aspect-video w-full items-center justify-center text-white">
                <p>No playback URL available</p>
              </div>
            )}
            <div className="bg-white p-4">
              <h3 className="font-semibold text-gray-900">{player.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{player.batch} • {player.subject} • {player.durationLabel}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UploadModal({ batches, onClose }: { batches: Batch[]; onClose: () => void }) {
  const [batchId, setBatchId] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  const batch = batches.find((b) => b.id === batchId);
  const subjects = useMemo(() => {
    if (!batch?.subjects) return [];
    return Array.from(new Set(batch.subjects.filter((s): s is string => !!s))).sort();
  }, [batch]);
  const finalSubject = subjectName === "__custom" ? customSubject.trim() : subjectName;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const videoFile = fileRef.current?.files?.[0];
    if (!batchId || !finalSubject || !title || !videoFile) {
      toast.error("Batch, subject, title, and video are required.");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const tokenRes = await fetch("/api/upload/video-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId, subjectName: finalSubject, chapterTitle: title, title }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.uploadUrl || !tokenData.token) {
        throw new Error(tokenData.error || "Failed to get upload token");
      }

      const formData = new FormData();
      formData.set("batchId", batchId);
      formData.set("subjectName", finalSubject);
      formData.set("subjectId", tokenData.subjectId || "");
      formData.set("chapterId", tokenData.chapterId || "");
      formData.set("title", title);
      formData.set("description", description);
      formData.set("video", videoFile);

      const thumbFile = thumbRef.current?.files?.[0];
      if (thumbFile) formData.set("thumbnail", thumbFile);

      await uploadWithProgress(tokenData.uploadUrl, tokenData.token, formData, setProgress);
      toast.success("Video uploaded successfully!");
      onClose();
      setTimeout(() => window.location.reload(), 800);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Upload Video</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Batch *</label>
              <select value={batchId} onChange={(e) => { setBatchId(e.target.value); setSubjectName(""); }} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="">Select batch</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>{b.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Subject *</label>
              {batchId ? (
                <select value={subjectName} onChange={(e) => setSubjectName(e.target.value)} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                  <option value="">Select subject</option>
                  {subjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  <option value="__custom">+ Add new</option>
                </select>
              ) : (
                <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400">Select a batch first</p>
              )}
            </div>
          </div>

          {subjectName === "__custom" && (
            <input value={customSubject} onChange={(e) => setCustomSubject(e.target.value)} placeholder="Enter new subject name" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          )}

          <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Video title" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />

          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />

          <div className="grid grid-cols-2 gap-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-purple-400">
              <UploadCloud className="mb-2 h-6 w-6 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">Video *</span>
              <span className="text-xs text-gray-400">MP4, WebM</span>
              <input ref={fileRef} type="file" accept="video/*" required className="hidden" />
              {fileRef.current?.files?.[0] && (
                <p className="mt-1 text-xs text-gray-500">{fileRef.current.files[0].name}</p>
              )}
            </label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-purple-400">
              <ImagePlus className="mb-2 h-6 w-6 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">Thumbnail</span>
              <span className="text-xs text-gray-400">Optional</span>
              <input ref={thumbRef} type="file" accept="image/*" className="hidden" />
              {thumbRef.current?.files?.[0] && (
                <p className="mt-1 text-xs text-gray-500">{thumbRef.current.files[0].name}</p>
              )}
            </label>
          </div>

          {progress > 0 && (
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full bg-purple-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={uploading} className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50">
              {uploading ? `Uploading ${progress}%...` : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function uploadWithProgress(
  uploadUrl: string,
  token: string,
  formData: FormData,
  onProgress: (progress: number) => void
): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadUrl);
    xhr.setRequestHeader("x-upload-token", token);
    xhr.timeout = 30 * 60 * 1000;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.max(1, Math.round((event.loaded / event.total) * 100)));
      }
    };

    xhr.onload = () => {
      let data: any = {};
      try { data = JSON.parse(xhr.responseText || "{}"); } catch { data = { error: xhr.responseText }; }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(new Error(data.error || `Upload failed with status ${xhr.status}`));
    };

    xhr.onerror = () => reject(new Error("Upload failed. Check VPS/CORS/network."));
    xhr.ontimeout = () => reject(new Error("Upload timed out."));
    xhr.send(formData);
  });
}
