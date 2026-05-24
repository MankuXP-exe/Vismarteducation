"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";

export default function UploadLecture({ batchId }: { batchId: string }) {
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("Uploading to VPS...");
    setProgress(15);

    const formData = new FormData(e.currentTarget);
    formData.set("batchId", batchId);

    const res = await fetch("/api/upload/video", {
      method: "POST",
      body: formData,
    });

    setProgress(100);
    const data = await res.json();
    setStatus(
      res.ok
        ? `Saved: ${data.videoUrl || data.lecture?.cloudflare_playback_url}`
        : data.error || "Upload failed"
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
        <UploadCloud className="mb-3 h-8 w-8 text-[#5c35d9]" />
        <span className="font-semibold text-gray-900">Drop lecture video here</span>
        <span className="text-sm text-gray-500">MP4, WebM, or AVI up to 10GB</span>
        <input name="video" type="file" accept="video/*" required className="mt-4 block text-sm" />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <input name="title" required placeholder="Lecture title" className="rounded-lg border border-gray-300 px-4 py-3 text-sm" />
        <input name="subjectName" required placeholder="Subject name" className="rounded-lg border border-gray-300 px-4 py-3 text-sm" />
        <input name="chapterTitle" required placeholder="Chapter title" className="rounded-lg border border-gray-300 px-4 py-3 text-sm" />
        <input name="sortOrder" type="number" placeholder="Sort order" className="rounded-lg border border-gray-300 px-4 py-3 text-sm" />
      </div>
      <textarea name="description" placeholder="Description" className="min-h-24 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm" />
      {progress > 0 && <div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full bg-[#5c35d9]" style={{ width: `${progress}%` }} /></div>}
      <button className="rounded-lg bg-[#5c35d9] px-5 py-3 font-semibold text-white">Upload lecture</button>
      {status && <p className="text-sm text-gray-600">{status}</p>}
    </form>
  );
}
