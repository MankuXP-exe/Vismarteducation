"use client";

import { useEffect, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";

type Subject = { id: string; name: string; abbreviation: string };
type Chapter = { id: string; title: string; chapter_number: string };

export default function UploadLecture({ batchId }: { batchId: string }) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await fetch(`/api/subjects?batchId=${batchId}`);
        const data = await res.json();
        setSubjects(data.subjects || []);
      } catch { /* ignore */ }
      setLoadingSubjects(false);
    }
    loadSubjects();
  }, [batchId]);

  useEffect(() => {
    if (!selectedSubject) { setChapters([]); return; }
    async function loadChapters() {
      try {
        const res = await fetch(`/api/chapters?subjectId=${selectedSubject}`);
        const data = await res.json();
        setChapters(data.chapters || []);
      } catch { /* ignore */ }
    }
    loadChapters();
  }, [selectedSubject]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);
    setStatus("Uploading...");

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("batchId", batchId);
    if (selectedSubject) formData.set("subjectId", selectedSubject);
    if (selectedChapter) formData.set("chapterId", selectedChapter);

    try {
      const res = await fetch("/api/upload/video", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("Lecture saved!");
        form.reset();
        setSelectedSubject("");
        setSelectedChapter("");
      } else {
        setStatus(data.error || "Upload failed");
      }
    } catch {
      setStatus("Upload failed");
    }
    setUploading(false);
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-lg border border-gray-200 bg-white p-5">

      {/* Step 1: Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        {loadingSubjects ? (
          <div className="flex items-center gap-2 text-sm text-gray-400"><Loader2 size={14} className="animate-spin" /> Loading subjects...</div>
        ) : (
          <select
            value={selectedSubject}
            onChange={(e) => { setSelectedSubject(e.target.value); setSelectedChapter(""); }}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm"
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Step 2: Chapter */}
      {selectedSubject && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chapter</label>
          <div className="flex gap-2">
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm"
            >
              <option value="">Select chapter (or type new)</option>
              {chapters.map((c) => (
                <option key={c.id} value={c.id}>{c.chapter_number}. {c.title}</option>
              ))}
            </select>
            <input
              name="chapterTitle"
              placeholder="New chapter name"
              disabled={!!selectedChapter}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm disabled:opacity-40"
            />
          </div>
        </div>
      )}

      {/* Step 3: Details */}
      {selectedSubject && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lecture title</label>
            <input name="title" required placeholder="e.g. Introduction to Accounting" className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" placeholder="Optional description" className="min-h-20 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort order</label>
              <input name="sortOrder" type="number" placeholder="0" className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm" />
            </div>
          </div>

          {/* Video file */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video file</label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-[#5c35d9] transition-colors">
              <UploadCloud className="mb-2 h-8 w-8 text-[#5c35d9]" />
              <span className="font-semibold text-gray-900">Drop lecture video here</span>
              <span className="text-sm text-gray-500">MP4, WebM, or AVI up to 10GB</span>
              <input name="video" type="file" accept="video/*" required className="mt-3 block text-sm" />
            </label>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail image <span className="text-gray-400 font-normal">(optional — auto-generated from video if not provided)</span></label>
            <input name="thumbnail" type="file" accept="image/*" className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm file:mr-3 file:rounded file:border-0 file:bg-[#5c35d9] file:px-3 file:py-1 file:text-xs file:text-white" />
          </div>

          {uploading && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 size={16} className="animate-spin" /> Uploading lecture... this may take a while for large files.
            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="rounded-lg bg-[#5c35d9] px-5 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload lecture"}
          </button>

          {status && (
            <p className={`text-sm ${status.includes("saved") || status.includes("Saved") ? "text-green-600" : "text-red-600"}`}>
              {status}
            </p>
          )}
        </>
      )}
    </form>
  );
}
