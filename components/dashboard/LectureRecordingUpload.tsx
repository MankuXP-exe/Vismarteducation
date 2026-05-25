"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import toast from "react-hot-toast";

export default function LectureRecordingUpload({
  lectureId,
  batchId,
}: {
  lectureId: string;
  batchId: string;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("lectureId", lectureId);
      formData.append("batchId", batchId);

      const res = await fetch("/api/upload/recording", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      toast.success("Recording uploaded! Refreshing...");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message);
      setUploading(false);
    }
  }

  return (
    <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
      <Upload size={16} />
      {uploading ? "Uploading..." : "Upload recording file"}
      <input
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={handleUpload}
        className="hidden"
        disabled={uploading}
      />
    </label>
  );
}
