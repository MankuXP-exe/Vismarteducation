"use client";

import { useMemo, useRef, useState } from "react";
import { ImagePlus, UploadCloud } from "lucide-react";

type Props = {
  batchId: string;
  subjects: string[];
};

type TokenResponse = {
  uploadUrl?: string;
  token?: string;
  subjectId?: string;
  chapterId?: string;
  error?: string;
};

export default function UploadLecture({ batchId, subjects }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const subjectName = useMemo(
    () => (selectedSubject === "__custom" ? customSubject.trim() : selectedSubject),
    [customSubject, selectedSubject]
  );

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!subjectName) {
      setStatus("Select a subject first.");
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("title") || "").trim();
    const chapterTitle = String(formData.get("chapterTitle") || "").trim();
    const video = formData.get("video");

    if (!title || !chapterTitle || !(video instanceof File) || video.size === 0) {
      setStatus("Video, title, and chapter are required.");
      return;
    }

    setUploading(true);
    setProgress(0);
    setStatus("Preparing secure upload...");

    try {
      setStatus("Preparing subjects...");
      const tokenRes = await fetch("/api/upload/video-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId,
          subjectName,
          chapterTitle,
          title,
        }),
      });
      const tokenData = (await tokenRes.json()) as TokenResponse;

      if (!tokenRes.ok || !tokenData.uploadUrl || !tokenData.token) {
        throw new Error(tokenData.error || "Unable to prepare upload");
      }

      formData.set("batchId", batchId);
      formData.set("subjectName", subjectName);
      formData.set("subjectId", tokenData.subjectId || "");
      formData.set("chapterId", tokenData.chapterId || "");

      setStatus("Uploading directly to VPS...");
      const result = await uploadWithProgress(tokenData.uploadUrl!, tokenData.token, formData, setProgress);
      setStatus(`Lecture saved: ${result.videoUrl || "uploaded"}`);
      form.reset();
      setSelectedSubject("");
      setCustomSubject("");
    } catch (err: any) {
      setStatus(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">Subject</span>
          <select
            value={selectedSubject}
            onChange={(event) => setSelectedSubject(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm"
          >
            <option value="">Select subject</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
            <option value="__custom">Add new subject</option>
          </select>
        </label>
        {selectedSubject === "__custom" && (
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">New subject</span>
            <input
              value={customSubject}
              onChange={(event) => setCustomSubject(event.target.value)}
              placeholder="Example: Economics"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm"
            />
          </label>
        )}
      </div>

      {subjectName ? (
        <form ref={formRef} onSubmit={submit} className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
            <UploadCloud className="mb-3 h-8 w-8 text-[#5c35d9]" />
            <span className="font-semibold text-gray-900">Drop lecture video here</span>
            <span className="text-sm text-gray-500">MP4, WebM, or AVI</span>
            <input name="video" type="file" accept="video/*" required className="mt-4 block text-sm" disabled={uploading} />
          </label>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-5 text-center">
            <ImagePlus className="mb-2 h-6 w-6 text-[#5c35d9]" />
            <span className="font-medium text-gray-900">Optional thumbnail</span>
            <span className="text-sm text-gray-500">If empty, the VPS will generate one from the video.</span>
            <input name="thumbnail" type="file" accept="image/png,image/jpeg,image/webp" className="mt-3 block text-sm" disabled={uploading} />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <input name="title" required placeholder="Lecture title" className="rounded-lg border border-gray-300 px-4 py-3 text-sm" disabled={uploading} />
            <input name="chapterTitle" required placeholder="Chapter title" className="rounded-lg border border-gray-300 px-4 py-3 text-sm" disabled={uploading} />
            <input name="sortOrder" type="number" placeholder="Sort order" className="rounded-lg border border-gray-300 px-4 py-3 text-sm" disabled={uploading} />
          </div>
          <textarea name="description" placeholder="Description" className="min-h-24 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm" disabled={uploading} />
          {progress > 0 && (
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full bg-[#5c35d9] transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
          <button
            disabled={uploading}
            className="rounded-lg bg-[#5c35d9] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Upload lecture"}
          </button>
          {status && <p className="text-sm text-gray-600">{status}</p>}
        </form>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 text-sm text-gray-500">
          Select a subject to open the upload form.
        </div>
      )}
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
      try {
        data = JSON.parse(xhr.responseText || "{}");
      } catch {
        data = { error: xhr.responseText };
      }

      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(new Error(data.error || `Upload failed with status ${xhr.status}`));
    };

    xhr.onerror = () => reject(new Error("Upload failed. Check VPS/CORS/network."));
    xhr.ontimeout = () => reject(new Error("Upload timed out."));
    xhr.send(formData);
  });
}
