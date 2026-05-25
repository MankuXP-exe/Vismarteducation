"use client";

import { useEffect, useState } from "react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

type Props = {
  classId: string;
};

type LiveClassData = {
  id: string;
  title: string;
  recording_url: string | null;
  cloudflare_playback_url: string | null;
  thumbnail_url: string | null;
  recording_file_size_mb: number | null;
  duration_seconds: number | null;
  started_at: string | null;
  ended_at: string | null;
  subject_name: string | null;
  chapter_title: string | null;
  attendee_count: number | null;
  batch_id: string | null;
};

function formatDuration(seconds: number | null) {
  if (!seconds) return "N/A";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFileSize(mb: number | null) {
  if (!mb) return "N/A";
  if (mb > 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${Math.round(mb)} MB`;
}

export default function LiveRecording({ classId }: Props) {
  const [data, setData] = useState<LiveClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      if (!isSupabaseAdminConfigured) {
        setError("Database not configured");
        setLoading(false);
        return;
      }
      const { data: record, error: err } = await supabaseAdmin
        .from("live_classes")
        .select("*")
        .eq("id", classId)
        .single();
      if (err || !record) {
        setError(err?.message || "Recording not found");
        setLoading(false);
        return;
      }
      setData(record);
      setLoading(false);
    }
    fetchData();
  }, [classId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="animate-spin h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
        <div className="text-center">
          <p className="text-xl text-red-300 mb-4">{error || "Recording not found"}</p>
          <button onClick={() => window.history.back()} className="bg-purple-600 px-6 py-3 rounded-lg">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const videoUrl = data.recording_url || data.cloudflare_playback_url;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <button
          onClick={() => window.history.back()}
          className="mb-4 text-sm text-gray-400 hover:text-white transition-colors"
        >
          &larr; Back
        </button>

        <h1 className="text-2xl font-bold mb-2">{data.title || "Live Class Recording"}</h1>
        {data.subject_name && (
          <p className="text-purple-400 text-sm mb-6">{data.subject_name}{data.chapter_title ? ` — ${data.chapter_title}` : ""}</p>
        )}

        {videoUrl ? (
          <div className="aspect-video bg-black rounded-xl overflow-hidden mb-6">
            <video
              src={videoUrl}
              controls
              className="w-full h-full"
              playsInline
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center mb-6">
            <p className="text-gray-400">Recording not available</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Date</p>
            <p className="font-medium">{formatDate(data.started_at)}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Duration</p>
            <p className="font-medium">{formatDuration(data.duration_seconds)}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">File Size</p>
            <p className="font-medium">{formatFileSize(data.recording_file_size_mb)}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Attendees</p>
            <p className="font-medium">{data.attendee_count ?? "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
