"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Loader2, Signal, PhoneOff, Maximize2, Minimize2,
  Play, Pause, Volume2, VolumeX,
} from "lucide-react";
import LiveRecording from "./LiveRecording";

type Props = {
  classId: string;
  classStatus: string;
  hlsUrl: string | null;
};

export default function StudentLiveViewer({ classId, classStatus, hlsUrl }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);

  useEffect(() => {
    if (classStatus !== "live" || !hlsUrl) {
      setLoading(false);
      return;
    }

    retryCountRef.current = 0;

    let hls: any = null;
    let destroyed = false;

    async function tryLoad() {
      const Hls = (await import("hls.js")).default;
      if (destroyed) return;

      if (Hls.isSupported() && videoRef.current) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 30,
          maxLoadingDelay: 4,
          manifestLoadingTimeOut: 10000,
          manifestLoadingMaxRetry: 1,
          levelLoadingTimeOut: 10000,
          fragLoadingTimeOut: 10000,
          xhrSetup: (xhr: XMLHttpRequest) => { xhr.withCredentials = true; },
        });
        hlsRef.current = hls;
        hls.loadSource(hlsUrl);
        hls.attachMedia(videoRef.current);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setLoading(false);
          videoRef.current?.play().then(() => setPlaying(true)).catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
          if (data.fatal) {
            retryCountRef.current++;
            hls?.destroy();
            hls = null;
            if (destroyed) return;
            if (retryCountRef.current >= 5) {
              setError("Stream error: " + (data.reason || data.details || "Failed to load stream"));
              setLoading(false);
              return;
            }
            retryRef.current = setTimeout(tryLoad, 3000);
          }
        });
      } else if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl") && hlsUrl) {
        videoRef.current.src = hlsUrl;
        videoRef.current.addEventListener("loadedmetadata", () => {
          setLoading(false);
          videoRef.current?.play().then(() => setPlaying(true)).catch(() => {});
        });
        videoRef.current.addEventListener("error", () => {
          setError("Unable to play this stream.");
          setLoading(false);
        });
      } else {
        setError("Your browser does not support HLS streaming.");
        setLoading(false);
      }
    }

    tryLoad();

    return () => {
      destroyed = true;
      if (retryRef.current) clearTimeout(retryRef.current);
      if (hls) hls.destroy();
    };
  }, [classStatus, hlsUrl]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setFullscreen(true);
    } else {
      await document.exitFullscreen();
      setFullscreen(false);
    }
  }, []);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onWaiting = () => setBuffering(true);
    const onCanPlay = () => setBuffering(false);
    const onPlaying2 = () => setBuffering(false);
    vid.addEventListener("play", onPlay);
    vid.addEventListener("pause", onPause);
    vid.addEventListener("waiting", onWaiting);
    vid.addEventListener("canplay", onCanPlay);
    vid.addEventListener("playing", onPlaying2);
    return () => {
      vid.removeEventListener("play", onPlay);
      vid.removeEventListener("pause", onPause);
      vid.removeEventListener("waiting", onWaiting);
      vid.removeEventListener("canplay", onCanPlay);
      vid.removeEventListener("playing", onPlaying2);
    };
  }, [loading]);

  if (classStatus === "completed" || classStatus === "cancelled") {
    return <LiveRecording classId={classId} />;
  }

  if (error) {
    return (
      <div className="flex h-full w-full flex-col bg-gray-950">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="mx-auto max-w-sm text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800">
              <PhoneOff className="h-8 w-8 text-gray-500" />
            </div>
            <h2 className="mb-1 text-lg font-bold text-white">Stream Unavailable</h2>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (classStatus !== "live") {
    return (
      <div className="flex h-full w-full flex-col bg-gray-950">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 animate-pulse rounded-full border-4 border-purple-500 border-t-transparent" />
            <p className="text-base font-medium text-white/80">Stream will start shortly...</p>
            <p className="mt-1 text-xs text-white/40">Waiting for the teacher to begin</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full bg-black overflow-hidden group"
      onMouseMove={showControlsTemporarily}
      onTouchStart={showControlsTemporarily}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        onClick={togglePlay}
        className="h-full w-full object-contain cursor-pointer"
      />

      {/* Buffering spinner */}
      {buffering && !loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="h-8 w-8 animate-spin text-white/60" />
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-purple-500" />
            <p className="text-sm font-medium text-white/80">Loading stream...</p>
          </div>
        </div>
      )}

      {/* Center play button when paused */}
      {!playing && !loading && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
            <Play className="ml-1 h-8 w-8 text-white" />
          </div>
        </button>
      )}

      {/* Top bar - LIVE badge */}
      <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-md bg-red-600 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          Live
        </span>
      </div>

      {/* Bottom controls bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-10 transition-opacity duration-300 ${
          showControls || !playing ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button onClick={togglePlay} className="rounded-full p-1.5 text-white hover:bg-white/10 transition-colors" title={playing ? "Pause" : "Play"}>
                {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              <button onClick={toggleMute} className="rounded-full p-1.5 text-white hover:bg-white/10 transition-colors" title={muted ? "Unmute" : "Mute"}>
                {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <span className="ml-1 flex items-center gap-1 text-[10px] text-green-400">
                <Signal className="h-3 w-3" /> Streaming
              </span>
            </div>
            <button onClick={toggleFullscreen} className="rounded-full p-1.5 text-white hover:bg-white/10 transition-colors" title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}>
              {fullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
