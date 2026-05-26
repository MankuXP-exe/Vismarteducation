"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Loader2, Play, Pause, Maximize, Minimize, RotateCw, SkipBack, SkipForward } from "lucide-react";

type Props = { classId: string };

type LiveClassData = {
  id: string; title: string;
  recording_url: string | null; cloudflare_playback_url: string | null;
  thumbnail_url: string | null; recording_file_size_mb: number | null;
  started_at: string | null; ended_at: string | null;
  batch_id: string | null;
  total_attendees: number | null;
};

function fmtDur(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function fmtDate(s: string | null) {
  if (!s) return "";
  return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function fmtSize(mb: number | null) {
  if (!mb) return "";
  return mb > 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${Math.round(mb)} MB`;
}

export default function LiveRecording({ classId }: Props) {
  const router = useRouter();
  const [data, setData] = useState<LiveClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [buffered, setBuffered] = useState(0);
  const vidRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<any>(null);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/live/class/${classId}`);
        const json = await res.json();
        if (!res.ok || !json.data) { setError(json.error || "Not found"); setLoading(false); return; }
        setData(json.data);
      } catch (e: any) { setError(e.message || "Failed to fetch"); }
      setLoading(false);
    }
    fetchData();
  }, [classId]);

  const videoUrl = data?.recording_url || data?.cloudflare_playback_url;

  const togglePlay = () => {
    if (!vidRef.current) return;
    if (vidRef.current.paused) { vidRef.current.play(); setPlaying(true); }
    else { vidRef.current.pause(); setPlaying(false); }
  };

  const handleTimeUpdate = () => {
    if (!vidRef.current) return;
    setCurrentTime(vidRef.current.currentTime);
    if (vidRef.current.buffered.length > 0)
      setBuffered(vidRef.current.buffered.end(vidRef.current.buffered.length - 1));
  };

  const handleLoaded = () => {
    if (!vidRef.current) return;
    setDuration(vidRef.current.duration || 0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!vidRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    vidRef.current.currentTime = pct * duration;
  };

  const skip = (s: number) => {
    if (!vidRef.current) return;
    vidRef.current.currentTime = Math.max(0, Math.min(vidRef.current.currentTime + s, vidRef.current.duration || 0));
  };

  const changeSpeed = () => {
    const speeds = [0.5, 1, 1.25, 1.5, 2];
    const idx = speeds.indexOf(speed);
    const next = speeds[(idx + 1) % speeds.length];
    setSpeed(next);
    if (vidRef.current) vidRef.current.playbackRate = next;
  };

  const toggleFS = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      try { (document as any).exitFullscreen?.() ?? (document as any).webkitExitFullscreen?.(); } catch {}
      setFullscreen(false);
    } else {
      try { (el as any).requestFullscreen?.() ?? (el as any).webkitRequestFullscreen?.(); } catch {}
      try { (screen as any).orientation?.lock?.("landscape"); } catch {}
      setFullscreen(true);
    }
  };

  useEffect(() => {
    const onFS = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFS);
    return () => document.removeEventListener("fullscreenchange", onFS);
  }, []);

  const showControlsTemporarily = () => {
    setShowControls(true);
    clearTimeout(hideTimerRef.current);
    if (playing) { hideTimerRef.current = setTimeout(() => setShowControls(false), 3000); }
  };

  useEffect(() => {
    return () => clearTimeout(hideTimerRef.current);
  }, []);

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0;

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-950">
      <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
    </div>
  );

  if (error || !data) return (
    <div className="flex h-screen items-center justify-center bg-gray-950 p-4">
      <div className="max-w-sm text-center">
        <p className="mb-1 text-lg font-bold text-white">Not Found</p>
        <p className="mb-6 text-sm text-gray-400">{error || "Recording not found"}</p>
        <button onClick={() => router.back()} className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700">Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-5xl px-2 py-4 md:px-4 md:py-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between px-1">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold md:text-xl">{data.title || "Recording"}</h1>
            <p className="text-xs text-gray-400">{fmtDate(data.started_at)}</p>
          </div>
          <button onClick={() => router.back()} className="ml-3 shrink-0 rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700">Back</button>
        </div>

        {/* Video Player */}
        <div ref={containerRef}
          className="video-container group relative aspect-video overflow-hidden rounded-xl bg-black"
          onMouseMove={showControlsTemporarily}
          onMouseLeave={() => playing && setShowControls(false)}>
          {videoUrl ? (
            <video ref={vidRef} src={videoUrl}
              className="h-full w-full cursor-pointer" playsInline preload="metadata"
              style={{ objectFit: "contain", aspectRatio: "16 / 9" }}
              onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoaded}
              onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              onClick={togglePlay} />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">Recording not available</div>
          )}

          {/* Gradient overlay */}
          <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent transition-opacity ${showControls ? "opacity-100" : "opacity-0"}`} />

          {/* Center play button (when paused) */}
          {!playing && videoUrl && (
            <button onClick={togglePlay}
              className="absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-purple-600/90 text-white shadow-xl shadow-purple-500/30 backdrop-blur-sm transition-all hover:scale-110 hover:bg-purple-500 md:h-16 md:w-16">
              <Play className="ml-0.5 h-6 w-6 md:h-7 md:w-7" />
            </button>
          )}

          {/* Bottom controls */}
          <div className={`absolute inset-x-0 bottom-0 z-10 px-2 pb-2 transition-opacity md:px-4 md:pb-4 ${showControls || !playing ? "opacity-100" : "opacity-0"}`}>
            {/* Seek bar */}
            <div className="mb-2 cursor-pointer" onClick={handleSeek}>
              <div className="relative h-1 rounded-full bg-white/20 md:h-1.5 group/seek">
                <div className="absolute h-full rounded-full bg-white/30" style={{ width: bufferedPct + "%" }} />
                <div className="absolute h-full rounded-full bg-purple-500" style={{ width: progressPct + "%" }} />
                <div className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover/seek:opacity-100 md:h-4 md:w-4" style={{ left: progressPct + "%" }} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 md:gap-2">
                <button onClick={togglePlay} className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/10 md:h-9 md:w-9">
                  {playing ? <Pause className="h-4 w-4 md:h-5 md:w-5" /> : <Play className="ml-0.5 h-4 w-4 md:h-5 md:w-5" />}
                </button>
                <button onClick={() => skip(-10)} className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white md:h-9 md:w-9" title="Back 10s">
                  <SkipBack className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </button>
                <button onClick={() => skip(10)} className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white md:h-9 md:w-9" title="Forward 10s">
                  <SkipForward className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </button>
                <span className="ml-1 text-[11px] text-white/60 md:text-xs">
                  {fmtDur(currentTime)} / {fmtDur(duration)}
                </span>
              </div>

              <div className="flex items-center gap-1 md:gap-2">
                <button onClick={changeSpeed}
                  className="flex h-7 items-center justify-center rounded bg-white/10 px-2 text-[11px] font-medium text-white/80 hover:bg-white/20 md:h-8 md:px-2.5 md:text-xs" title="Speed">
                  {speed}x
                </button>
                <button onClick={toggleFS} className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white md:h-9 md:w-9" title={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
                  {fullscreen ? <Minimize className="h-3.5 w-3.5 md:h-4 md:w-4" /> : <Maximize className="h-3.5 w-3.5 md:h-4 md:w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
          {[
            { l: "Date", v: fmtDate(data.started_at) },
            { l: "Duration", v: fmtDur(duration) },
            { l: "File Size", v: fmtSize(data.recording_file_size_mb) },
            { l: "Attendees", v: data.total_attendees != null ? String(data.total_attendees) : "N/A" },
          ].map((item) => item.v ? (
            <div key={item.l} className="rounded-lg bg-gray-800/60 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">{item.l}</p>
              <p className="mt-0.5 text-xs font-medium md:text-sm">{item.v}</p>
            </div>
          ) : null)}
        </div>
      </div>
    </div>
  );
}
