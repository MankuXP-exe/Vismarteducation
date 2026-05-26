"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Wifi, Signal, PhoneOff } from "lucide-react";
import LiveRecording from "./LiveRecording";

type Props = {
  classId: string;
  classStatus: string;
  hlsUrl: string | null;
};

export default function StudentLiveViewer({ classId, classStatus, hlsUrl }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [debugLog, setDebugLog] = useState("");

  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);

  useEffect(() => {
    if (classStatus !== "live" || !hlsUrl) {
      setLoading(false);
      return;
    }

    retryCountRef.current = 0;
    setDebugLog("");

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
          videoRef.current?.play().catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
          setDebugLog(
            `Error type=${data.type} details=${data.details} fatal=${data.fatal} reason=${data.reason || ""} url=${data.url || ""}`
          );
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
          videoRef.current?.play().catch(() => {});
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

  if (classStatus === "completed" || classStatus === "cancelled") {
    return <LiveRecording classId={classId} />;
  }

  if (error) {
    return (
      <div className="flex h-full w-full flex-col bg-gray-950">
        <div className="flex flex-1 items-center justify-center">
          <div className="mx-auto max-w-sm px-6 text-center">
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
        <div className="flex flex-1 items-center justify-center">
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
    <div className="flex h-full w-full flex-col bg-gray-950">
      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} autoPlay playsInline controls={false}
          className="h-full w-full object-contain" />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950/80">
            <div className="text-center">
              <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-purple-500" />
              <p className="text-sm font-medium text-white/80">Loading stream...</p>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-center gap-3 bg-gray-950/90 px-4 py-3 backdrop-blur-sm">
        <span className="flex items-center gap-1.5 text-xs text-green-400">
          <Signal className="h-3.5 w-3.5" /> Streaming
        </span>
        <span className="text-xs text-gray-500">|</span>
        <span className="flex items-center gap-1.5 rounded bg-red-600/80 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          Live
        </span>
        {debugLog && (
          <span className="ml-2 text-[9px] text-gray-600 max-w-[300px] truncate" title={debugLog}>
            {debugLog}
          </span>
        )}
      </div>
    </div>
  );
}
