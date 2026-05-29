"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, Signal, PhoneOff, Maximize2, Minimize2, ChevronLeft,
  Play, Pause, Volume2, VolumeX,
} from "lucide-react";
import LiveRecording from "./LiveRecording";

const WHEP_BASE = "https://live.vismartlearningeducation.com";
const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

type Props = {
  classId: string;
  classStatus: string;
  hlsUrl: string | null;
};

export default function StudentLiveViewer({ classId, classStatus, hlsUrl }: Props) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
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
    let destroyed = false;

    async function tryWebRTC() {
      if (destroyed) return;

      try {
        const roomName = hlsUrl!.match(/\/live\/live\/([^/]+)\//)?.[1] || hlsUrl!.match(/\/live\/([^/]+)\//)?.[1];
        if (!roomName) throw new Error("Invalid stream URL");

        const pc = new RTCPeerConnection({
          iceServers: ICE_SERVERS,
          iceTransportPolicy: "all",
          bundlePolicy: "max-bundle",
        });
        pcRef.current = pc;

        pc.addTransceiver("video", { direction: "recvonly" });
        pc.addTransceiver("audio", { direction: "recvonly" });

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("ICE gathering timeout")), 5000);
          pc.onicecandidate = (e) => {
            if (!e.candidate) { clearTimeout(timeout); resolve(); }
          };
          pc.onicecandidateerror = () => {
            clearTimeout(timeout);
            reject(new Error("ICE candidate error"));
          };
        });

        const whepUrl = `${WHEP_BASE}/live/${roomName}/whep`;
        const res = await fetch(whepUrl, {
          method: "POST",
          headers: { "Content-Type": "application/sdp" },
          body: pc.localDescription!.sdp,
        });

        if (!res.ok) throw new Error(`WHEP error ${res.status}`);

        const answer = await res.text();
        await pc.setRemoteDescription({ type: "answer", sdp: answer });

        pc.ontrack = (e) => {
          if (videoRef.current && e.streams[0]) {
            videoRef.current.srcObject = e.streams[0];
            videoRef.current.play().then(() => {
              setPlaying(true);
              setLoading(false);
            }).catch(() => {});
          }
        };

        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === "failed" || pc.iceConnectionState === "disconnected") {
            if (!destroyed) {
              retryCountRef.current++;
              if (retryCountRef.current >= 30) {
                setError("Connection lost. Retrying with HLS...");
                fallbackToHLS();
                return;
              }
              retryRef.current = setTimeout(() => {
                pc.close();
                tryWebRTC();
              }, 2000);
            }
          }
        };
      } catch (err: any) {
        if (!destroyed) {
          console.warn("WebRTC WHEP failed, falling back to HLS:", err.message);
          fallbackToHLS();
        }
      }
    }

    async function fallbackToHLS() {
      if (destroyed || !hlsUrl) return;

      try {
        const Hls = (await import("hls.js")).default;
        if (destroyed) return;

        if (Hls.isSupported() && videoRef.current) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 5,
            maxBufferLength: 5,
            maxMaxBufferLength: 10,
            liveSyncDurationCount: 1,
            liveMaxLatencyDurationCount: 3,
            maxLoadingDelay: 1,
            manifestLoadingTimeOut: 3000,
            manifestLoadingMaxRetry: 2,
            levelLoadingTimeOut: 3000,
            fragLoadingTimeOut: 3000,
            startLevel: 0,
            startFragPrefetch: true,
            testBandwidth: false,
            xhrSetup: (xhr: XMLHttpRequest) => { xhr.withCredentials = true; },
          });
          hls.loadSource(hlsUrl);
          hls.attachMedia(videoRef.current);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setLoading(false);
            videoRef.current?.play().then(() => setPlaying(true)).catch(() => {});
          });
          videoRef.current.addEventListener("waiting", () => setBuffering(true));
          videoRef.current.addEventListener("canplay", () => setBuffering(false));
          videoRef.current.addEventListener("playing", () => setBuffering(false));

          hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
            if (data.fatal) {
              retryCountRef.current++;
              hls.destroy();
              if (destroyed) return;
              if (retryCountRef.current >= 50) {
                setError("Stream unavailable. The teacher may need to restart the stream.");
                setLoading(false);
                return;
              }
              const delay = retryCountRef.current <= 5 ? 1000 : 3000;
              retryRef.current = setTimeout(() => fallbackToHLS(), delay);
            }
          });
        } else if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
          videoRef.current.src = hlsUrl;
          videoRef.current.addEventListener("loadedmetadata", () => {
            setLoading(false);
            videoRef.current?.play().then(() => setPlaying(true)).catch(() => {});
          });
        } else {
          setError("Your browser does not support live streaming.");
          setLoading(false);
        }
      } catch {
        setError("Failed to load stream.");
        setLoading(false);
      }
    }

    tryWebRTC();

    return () => {
      destroyed = true;
      if (retryRef.current) clearTimeout(retryRef.current);
      pcRef.current?.close();
      pcRef.current = null;
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
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      try { await (el as any).requestFullscreen?.() ?? (el as any).webkitRequestFullscreen?.(); } catch {}
      try { await (screen as any).orientation?.lock?.("landscape"); } catch {}
      setFullscreen(true);
    } else {
      try { await (document as any).exitFullscreen?.() ?? (document as any).webkitExitFullscreen?.(); } catch {}
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
      className="relative flex h-full w-full bg-black overflow-hidden group video-container"
      style={{ aspectRatio: "16 / 9" }}
      onMouseMove={showControlsTemporarily}
      onTouchStart={showControlsTemporarily}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        onClick={togglePlay}
        className="h-full w-full cursor-pointer"
        style={{ objectFit: "contain", aspectRatio: "16 / 9" }}
      />

      {buffering && !loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="h-8 w-8 animate-spin text-white/60" />
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-purple-500" />
            <p className="text-sm font-medium text-white/80">Connecting to stream...</p>
          </div>
        </div>
      )}

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

      <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
        <button onClick={() => router.back()} className="rounded-lg bg-black/40 px-2 py-1 text-[11px] font-medium text-white/80 hover:bg-black/60 transition-colors flex items-center gap-1">
          <ChevronLeft className="h-3.5 w-3.5" />
          Exit
        </button>
        <span className="flex items-center gap-1.5 rounded-md bg-red-600 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          Live
        </span>
      </div>

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
                <Signal className="h-3 w-3" /> WebRTC
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
