"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";
import toast from "react-hot-toast";

type Batch = { id: string; title: string; category: string };
type Subject = { id: string; name: string };

export default function StartInstantLive({ batches }: { batches: Batch[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [batchId, setBatchId] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  useEffect(() => {
    if (!batchId) { setSubjects([]); return; }
    fetch(`/api/subjects?batchId=${batchId}`)
      .then((r) => r.json())
      .then((d) => setSubjects(d.subjects || []))
      .catch(() => {});
  }, [batchId]);

  const subjectName = selectedSubject === "__custom" ? customSubject.trim() : selectedSubject;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!batchId) { toast.error("Select a batch"); return; }
    if (!subjectName) { toast.error("Select or enter a subject"); return; }
    if (!title.trim()) { toast.error("Enter a class title"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/live/instant-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId,
          subjectName,
          title: title.trim(),
          description: description.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start");
      toast.success("Live class started!");
      window.open(`/teacher/live/${data.liveClass.id}`, "_blank");
      router.push(`/teacher/batches/${batchId}`);
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-700">Batch</span>
        <select
          value={batchId}
          onChange={(e) => { setBatchId(e.target.value); setSelectedSubject(""); }}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm"
        >
          <option value="">Select batch</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>{b.title} ({b.category})</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-700">Subject</span>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm"
        >
          <option value="">Select subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
          <option value="__custom">Add new subject</option>
        </select>
        {selectedSubject === "__custom" && (
          <input
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
            placeholder="New subject name"
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm"
          />
        )}
        {!batchId && <p className="mt-1 text-xs text-gray-400">Select a batch first</p>}
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-700">Class title</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. Chapter 5 - Quadratic Equations"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-700">Description (optional)</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What will this class cover?"
          className="min-h-24 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-700">Thumbnail (optional)</span>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-[#5c35d9]">
            <ImagePlus className="h-5 w-5" />
            {thumbnail ? thumbnail.name : "Choose image"}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
          {thumbnail && (
            <button type="button" onClick={() => setThumbnail(null)} className="text-sm text-red-500">Remove</button>
          )}
        </div>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Starting..." : "Start live class"}
      </button>
    </form>
  );
}
