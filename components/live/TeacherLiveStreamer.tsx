"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Mic, MicOff, Camera, CameraOff, MonitorUp, RotateCw,
  PhoneOff, Loader2, Square, Maximize2, Minus, AlertCircle,
} from "lucide-react";

const WHIP_BASE = "https://live.vismartlearningeducation.com";
const AUTH = btoa("teacher:ViSmartLive2026!");
const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
];
const CANVAS_W = 1280;
const CANVAS_H = 720;
const MAX_BITRATE = 2_000_000;
const PIP_SIZES = { small: 220, medium: 300, large: 380 } as const;
type PipSize = keyof typeof PIP_SIZES;
type Mode = "camera" | "screen" | "pip";

// ─── Canvas helpers ──────────────────────────────────────────────

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawAspectFill(ctx: CanvasRenderingContext2D, video: HTMLVideoElement, dx: number, dy: number, dw: number, dh: number) {
  const vw = video.videoWidth, vh = video.videoHeight;
  if (!vw || !vh) { ctx.fillRect(dx, dy, dw, dh); return; }
  const scale = Math.max(dw / vw, dh / vh);
  const sw = vw * scale, sh = vh * scale;
  const sx = dx + (dw - sw) / 2, sy = dy + (dh - sh) / 2;
  ctx.drawImage(video, sx, sy, sw, sh);
}

function drawAspectCover(ctx: CanvasRenderingContext2D, video: HTMLVideoElement, dx: number, dy: number, dw: number, dh: number) {
  const vw = video.videoWidth, vh = video.videoHeight;
  if (!vw || !vh) { ctx.fillRect(dx, dy, dw, dh); return; }
  const scale = Math.min(dw / vw, dh / vh);
  const sw = vw * scale, sh = vh * scale;
  const sx = dx + (dw - sw) / 2, sy = dy + (dh - sh) / 2;
  ctx.drawImage(video, sx, sy, sw, sh);
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// ─── Controls component ──────────────────────────────────────────

type ControlsProps = {
  micOn: boolean; setMicOn: (v: boolean) => void;
  camOn: boolean; setCamOn: (v: boolean) => void;
  screenOn: boolean; onToggleScreen: () => void;
  mode: Mode; setMode: (v: Mode) => void;
  pipSize: PipSize; setPipSize: (v: PipSize) => void;
  onFlipCamera: () => void;
  onEnd: () => void;
  live: boolean;
  duration: number;
};

function Controls({
  micOn, setMicOn, camOn, setCamOn,
  screenOn, onToggleScreen, mode, setMode,
  pipSize, setPipSize, onFlipCamera, onEnd, live, duration,
}: ControlsProps) {
  const btnClass = "flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full backdrop-blur-md border border-white/10 transition-all active:scale-95";

  return (
    <div className="flex flex-col items-center gap-2 px-3 py-3 md:py-4">
      {/* Mode row */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setMode("camera")}
          className={`rounded-lg px-3 py-1 text-[11px] font-medium transition-all ${
            mode === "camera" ? "bg-purple-600 text-white" : "bg-white/10 text-white/60 hover:bg-white/20"
          }`}
        >
          Camera Full
        </button>
        <button
          onClick={() => { if (screenOn) setMode("screen"); }}
          disabled={!screenOn}
          className={`rounded-lg px-3 py-1 text-[11px] font-medium transition-all ${
            !screenOn ? "opacity-40 cursor-not-allowed" : ""
          } ${mode === "screen" ? "bg-purple-600 text-white" : "bg-white/10 text-white/60 hover:bg-white/20"}`}
        >
          Screen Full
        </button>
        <button
          onClick={() => { if (screenOn) setMode("pip"); }}
          disabled={!screenOn}
          className={`rounded-lg px-3 py-1 text-[11px] font-medium transition-all ${
            !screenOn ? "opacity-40 cursor-not-allowed" : ""
          } ${mode === "pip" ? "bg-purple-600 text-white" : "bg-white/10 text-white/60 hover:bg-white/20"}`}
        >
          Screen + Cam (PiP)
        </button>
      </div>

      {/* Main controls row */}
      <div className="flex items-center justify-center gap-2 md:gap-3">
        <button
          onClick={() => setMicOn(!micOn)}
          className={`${btnClass} ${micOn ? "bg-white/20 text-white hover:bg-white/30" : "bg-red-500/80 text-white"}`}
          title={micOn ? "Mute Microphone" : "Unmute Microphone"}
        >
          {micOn ? <Mic className="h-4 w-4 md:h-5 md:w-5" /> : <MicOff className="h-4 w-4 md:h-5 md:w-5" />}
        </button>

        <button
          onClick={() => setCamOn(!camOn)}
          className={`${btnClass} ${camOn ? "bg-white/20 text-white hover:bg-white/30" : "bg-red-500/80 text-white"}`}
          title={camOn ? "Turn Camera Off" : "Turn Camera On"}
        >
          {camOn ? <Camera className="h-4 w-4 md:h-5 md:w-5" /> : <CameraOff className="h-4 w-4 md:h-5 md:w-5" />}
        </button>

        <button
          onClick={onFlipCamera}
          className={`${btnClass} bg-white/20 text-white hover:bg-white/30`}
          title="Flip camera"
        >
          <RotateCw className="h-4 w-4 md:h-5 md:w-5" />
        </button>

        <button
          onClick={onToggleScreen}
          className={`${btnClass} ${screenOn ? "bg-emerald-500/90 text-white ring-2 ring-emerald-400" : "bg-white/20 text-white hover:bg-white/30"}`}
          title={screenOn ? "Stop sharing screen" : "Share screen"}
        >
          <MonitorUp className="h-4 w-4 md:h-5 md:w-5" />
        </button>

        {/* PIP size controls */}
        {mode === "pip" && screenOn && (
          <div className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-1">
            {(["small", "medium", "large"] as PipSize[]).map((s) => {
              const Icon = s === "small" ? Minus : s === "medium" ? Square : Maximize2;
              return (
                <button
                  key={s}
                  onClick={() => setPipSize(s)}
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                    pipSize === s ? "bg-purple-600 text-white" : "text-white/50 hover:text-white"
                  }`}
                  title={`${s} PiP`}
                >
                  <Icon className="h-3 w-3" />
                </button>
              );
            })}
          </div>
        )}

        <div className="mx-1 h-8 w-px bg-white/10 md:mx-2" />

        <button
          onClick={onEnd}
          className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-500/30 hover:bg-red-700 active:scale-95 transition-all"
          title="End Live Class"
        >
          <PhoneOff className="h-4 w-4 md:h-5 md:w-5" />
        </button>

        {live && (
          <div className="flex items-center gap-2 rounded-lg bg-red-600/90 px-2.5 py-1 text-[11px] font-bold text-white shadow">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span>LIVE</span>
            <span className="font-mono text-white/90 text-[10px]">{formatDuration(duration)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────

type Props = {
  classId: string;
  roomName: string;
  onEnd: () => void;
};

export default function TeacherLiveStreamer({ classId, roomName, onEnd }: Props) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const audioSenderRef = useRef<RTCRtpSender | null>(null);
  const animFrameRef = useRef<number>(0);
  const heartbeatTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenOn, setScreenOn] = useState(false);
  const [live, setLive] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [mode, setMode] = useState<Mode>("camera");
  const [pipSize, setPipSize] = useState<PipSize>("medium");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [duration, setDuration] = useState(0);

  // ─── Live Duration Timer ─────────────────────────────────────────

  useEffect(() => {
    if (!live) return;
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [live]);

  // ─── Stream Heartbeat ────────────────────────────────────────────

  useEffect(() => {
    if (!live) return;
    heartbeatTimer.current = setInterval(async () => {
      try {
        await fetch("/api/live/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classId }),
        });
      } catch {
        // Non-blocking
      }
    }, 15000);
    return () => {
      if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
    };
  }, [live, classId]);

  // ─── Compositor Loop (Always Broadcasts to Students and Teacher) ──

  const drawFrameRef = useRef<() => void>(() => {});

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      animFrameRef.current = requestAnimationFrame(drawFrameRef.current);
      return;
    }

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = "#0c0a09"; // Dark background
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const isSelfFacing = facingMode === "user";
    const scrReady = screenVideoRef.current?.readyState;
    const camReady = cameraVideoRef.current?.readyState;
    const hasScreen = screenOn && scrReady !== undefined && scrReady >= 2;
    const hasCamera = camOn && camReady !== undefined && camReady >= 2;

    if (hasScreen && (mode === "screen" || mode === "pip" || !hasCamera)) {
      // Draw screen as the primary view (aspect-fit to maintain code/slide legibility)
      drawAspectCover(ctx, screenVideoRef.current!, 0, 0, CANVAS_W, CANVAS_H);
    }

    if (hasCamera) {
      if (!hasScreen || mode === "camera") {
        // Camera Full
        ctx.save();
        if (isSelfFacing) {
          ctx.translate(CANVAS_W, 0);
          ctx.scale(-1, 1);
        }
        drawAspectFill(ctx, cameraVideoRef.current!, 0, 0, CANVAS_W, CANVAS_H);
        ctx.restore();
      } else if (mode === "pip" && hasScreen) {
        // Camera PiP Overlay on top of Screen Share
        const pipW = PIP_SIZES[pipSize];
        const pipH = Math.round((pipW * 9) / 16);
        const pipX = CANVAS_W - pipW - 24;
        const pipY = CANVAS_H - pipH - 24;

        ctx.save();
        // Drop shadow for PiP window
        ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
        ctx.shadowBlur = 18;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
        ctx.beginPath();
        roundRect(ctx, pipX, pipY, pipW, pipH, 12);
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fill();
        ctx.restore();

        // Clip and draw camera video in PiP
        ctx.save();
        ctx.beginPath();
        roundRect(ctx, pipX, pipY, pipW, pipH, 12);
        ctx.clip();

        if (isSelfFacing) {
          ctx.save();
          ctx.translate(CANVAS_W, 0);
          ctx.scale(-1, 1);
          drawAspectFill(ctx, cameraVideoRef.current!, CANVAS_W - pipX - pipW, pipY, pipW, pipH);
          ctx.restore();
        } else {
          drawAspectFill(ctx, cameraVideoRef.current!, pipX, pipY, pipW, pipH);
        }

        // Distinct border around PiP
        ctx.strokeStyle = "#8b5cf6"; // Purple accent
        ctx.lineWidth = 3;
        ctx.beginPath();
        roundRect(ctx, pipX, pipY, pipW, pipH, 12);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Audio-only fallback banner if both camera and screen are disabled
    if (!hasScreen && !hasCamera) {
      ctx.fillStyle = "#18181b";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      ctx.fillStyle = "#a855f7";
      ctx.beginPath();
      ctx.arc(CANVAS_W / 2, CANVAS_H / 2 - 20, 48, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🎙️", CANVAS_W / 2, CANVAS_H / 2 - 20);

      ctx.font = "bold 22px sans-serif";
      ctx.fillStyle = "#f4f4f5";
      ctx.fillText("Vi Smart Live - Audio Broadcasting", CANVAS_W / 2, CANVAS_H / 2 + 50);

      ctx.font = "14px sans-serif";
      ctx.fillStyle = "#a1a1aa";
      ctx.fillText("Microphone is active. Enable camera or screen share to broadcast video.", CANVAS_W / 2, CANVAS_H / 2 + 80);
    }

    animFrameRef.current = requestAnimationFrame(drawFrameRef.current);
  }, [camOn, screenOn, mode, pipSize, facingMode]);

  drawFrameRef.current = drawFrame;

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(drawFrameRef.current);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // ─── Mic Toggle ──────────────────────────────────────────────────

  useEffect(() => {
    cameraStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = micOn;
    });
  }, [micOn]);

  // ─── Camera Setup ────────────────────────────────────────────────

  const setupCamera = useCallback(async (facing: "user" | "environment") => {
    try {
      cameraStreamRef.current?.getVideoTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: facing },
        audio: false,
      });
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && cameraStreamRef.current) {
        cameraStreamRef.current.removeTrack(cameraStreamRef.current.getVideoTracks()[0]);
        cameraStreamRef.current.addTrack(videoTrack);
      }
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
        cameraVideoRef.current.play().catch(() => {});
      }
      setCamOn(true);
    } catch {
      setWarning("Could not switch camera.");
    }
  }, []);

  const handleFlipCamera = useCallback(async () => {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    await setupCamera(next);
  }, [facingMode, setupCamera]);

  // ─── Screen Share Toggle ─────────────────────────────────────────

  const toggleScreen = useCallback(async () => {
    if (screenOn) {
      // Stop screen share
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
      setScreenOn(false);
      setMode("camera");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: true,
      });

      screenStreamRef.current = stream;

      // Handle browser's native "Stop sharing" button cleanly
      stream.getVideoTracks()[0].onended = () => {
        screenStreamRef.current = null;
        if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
        setScreenOn(false);
        setMode("camera");
      };

      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
        screenVideoRef.current.play().catch(() => {});
      }

      setScreenOn(true);
      // Automatically switch to PiP mode so camera + screen share show together!
      setMode("pip");
    } catch (err: any) {
      // User cancelled picker or permission denied — non-fatal
      if (err.name !== "NotAllowedError") {
        console.warn("Screen share error:", err);
      }
      setScreenOn(false);
    }
  }, [screenOn]);

  // ─── WebRTC Publishing Initialization ────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // 1. Initialize canvas and compositor stream FIRST
        const canvas = canvasRef.current!;
        canvas.width = CANVAS_W;
        canvas.height = CANVAS_H;
        const canvasStream = canvas.captureStream(30);
        const canvasVideoTrack = canvasStream.getVideoTracks()[0];

        // The teacher preview mirrors the canvas stream so teacher sees what students see!
        if (videoRef.current) {
          videoRef.current.srcObject = canvasStream;
          videoRef.current.play().catch(() => {});
        }

        // 2. Obtain Camera + Microphone
        let userAudioTrack: MediaStreamTrack | null = null;
        try {
          const camStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
            audio: true,
          });

          if (cancelled) {
            camStream.getTracks().forEach((t) => t.stop());
            return;
          }

          cameraStreamRef.current = camStream;
          if (cameraVideoRef.current) {
            cameraVideoRef.current.srcObject = camStream;
            cameraVideoRef.current.play().catch(() => {});
          }

          userAudioTrack = camStream.getAudioTracks()[0] || null;
          if (userAudioTrack) userAudioTrack.enabled = micOn;
        } catch (mediaErr: any) {
          // If camera denied, try microphone only
          try {
            const micOnlyStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (cancelled) {
              micOnlyStream.getTracks().forEach((t) => t.stop());
              return;
            }
            cameraStreamRef.current = micOnlyStream;
            userAudioTrack = micOnlyStream.getAudioTracks()[0] || null;
            if (userAudioTrack) userAudioTrack.enabled = micOn;
            setCamOn(false);
            setWarning("Camera permission denied. Broadcasting audio and screen share.");
          } catch {
            setWarning("Microphone and camera permissions denied.");
          }
        }

        // 3. Create WebRTC PeerConnection for MediaMTX WHIP
        const pc = new RTCPeerConnection({
          iceServers: ICE_SERVERS,
          iceTransportPolicy: "all",
          bundlePolicy: "max-bundle",
          rtcpMuxPolicy: "require",
        });
        pcRef.current = pc;

        // 4. Add the CONSTANT canvas video track to WebRTC
        // This ensures the outgoing stream NEVER resets or renegotiates on layout switches!
        pc.addTrack(canvasVideoTrack, canvasStream);

        // 5. Add audio track
        if (userAudioTrack) {
          const sender = pc.addTrack(userAudioTrack, new MediaStream([userAudioTrack]));
          audioSenderRef.current = sender;
        }

        // 6. Force H.264 video codec preference for broad compatibility
        const [videoTransceiver] = pc.getTransceivers().filter((t) => t.receiver.track.kind === "video");
        if (videoTransceiver && typeof RTCRtpReceiver.getCapabilities === "function") {
          const caps = RTCRtpReceiver.getCapabilities("video");
          if (caps) {
            const h264 = caps.codecs.filter(
              (c) => c.mimeType.toLowerCase() === "video/h264" || c.mimeType.toLowerCase() === "video/x-h264"
            );
            if (h264.length > 0) videoTransceiver.setCodecPreferences(h264);
          }
        }

        // 7. Track ICE Connection State
        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
            setLive(true);
            setConnecting(false);

            try {
              const sender = pc.getSenders().find((s) => s.track?.kind === "video");
              if (sender) {
                const params = sender.getParameters();
                if (!params.encodings) params.encodings = [{}];
                params.encodings[0].maxBitrate = MAX_BITRATE;
                params.encodings[0].maxFramerate = 30;
                params.encodings[0].networkPriority = "high";
                sender.setParameters(params).catch(() => {});
              }
            } catch {
              // Ignore bitrate parameter errors
            }
          } else if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
            setLive(false);
          }
        };

        // 8. Send WHIP Offer once ICE gathering completes
        let whipSent = false;
        const sendWhip = async () => {
          if (whipSent) return;
          whipSent = true;
          const offer = pc.localDescription;
          if (!offer) return;

          try {
            const whipUrl = `${WHIP_BASE}/live/${roomName}/whip`;
            const res = await fetch(whipUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/sdp",
                Authorization: `Basic ${AUTH}`,
              },
              body: offer.sdp,
            });

            if (!res.ok) {
              const text = await res.text();
              throw new Error(text || `WHIP error ${res.status}`);
            }

            let answer = await res.text();

            // Sanitize SDP for Android WebView / strict SDP parsers
            const lines = answer.split("\n");
            let seenMedia = false;
            const sanitized = lines.filter((l) => {
              if (l.startsWith("m=")) seenMedia = true;
              if (l.trim() === "a=recvonly" && !seenMedia) return false;
              return true;
            });
            if (sanitized.length !== lines.length) {
              answer = sanitized.join("\n");
            }

            await pc.setRemoteDescription({ type: "answer", sdp: answer });
          } catch (err: any) {
            setError(err.message || "Failed to establish live stream connection.");
            setConnecting(false);
          }
        };

        pc.onicecandidate = (e) => {
          if (!e.candidate) sendWhip();
        };

        setTimeout(() => {
          if (!whipSent) sendWhip();
        }, 3500);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Could not initialize broadcast.");
          setConnecting(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animFrameRef.current);
      if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
      pcRef.current?.close();
      pcRef.current = null;
      cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
      screenStreamRef.current = null;
    };
  }, [classId, roomName]);

  // ─── End Stream Handler ──────────────────────────────────────────

  const handleEnd = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
    pcRef.current?.close();
    pcRef.current = null;
    cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    cameraStreamRef.current = null;
    screenStreamRef.current = null;
    onEnd();
  }, [onEnd]);

  // ─── Render ──────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950 p-4">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800">
            <CameraOff className="h-8 w-8 text-red-400" />
          </div>
          <p className="mb-1 text-lg font-bold text-white">Broadcast Failed</p>
          <p className="mb-6 text-sm text-gray-400">{error}</p>
          <button
            onClick={() => router.back()}
            className="rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-950 select-none">
      {/* Compositor preview (What teacher sees == What students receive!) */}
      <div className="relative flex-1 overflow-hidden bg-black flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="h-full w-full object-contain"
        />

        {connecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm z-20">
            <div className="text-center">
              <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-purple-500" />
              <p className="text-sm font-medium text-white/90">Connecting to live streaming server...</p>
              <p className="text-xs text-white/50 mt-1">Establishing low-latency WebRTC broadcast</p>
            </div>
          </div>
        )}

        {/* Live Status Overlay */}
        <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-2">
          {live && (
            <div className="flex items-center gap-2 rounded-md bg-red-600 px-2.5 py-1 text-xs font-bold text-white uppercase tracking-wider shadow-lg">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              <span>LIVE</span>
              <span className="font-mono text-white/90">{formatDuration(duration)}</span>
            </div>
          )}
          {screenOn && (
            <div className="flex items-center gap-1.5 rounded-md bg-purple-600/90 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-white shadow">
              <MonitorUp className="h-3.5 w-3.5" />
              <span>Screen Sharing ({mode === "pip" ? "PiP Active" : "Full"})</span>
            </div>
          )}
        </div>

        {/* Non-fatal warning banner */}
        {warning && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-lg bg-amber-500/90 text-black px-3 py-1.5 text-xs font-medium shadow-lg">
            <AlertCircle className="h-4 w-4" />
            <span>{warning}</span>
            <button onClick={() => setWarning("")} className="ml-2 font-bold hover:text-black/70">✕</button>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="bg-gradient-to-t from-gray-950 via-gray-950/95 to-transparent border-t border-white/5">
        <Controls
          micOn={micOn} setMicOn={setMicOn}
          camOn={camOn} setCamOn={setCamOn}
          screenOn={screenOn} onToggleScreen={toggleScreen}
          mode={mode} setMode={setMode}
          pipSize={pipSize} setPipSize={setPipSize}
          onFlipCamera={handleFlipCamera}
          onEnd={handleEnd}
          live={live}
          duration={duration}
        />
      </div>

      {/* Hidden 1280x720 Canvas Compositor */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden Video Elements Feeding the Compositor */}
      <video ref={cameraVideoRef} className="opacity-0 absolute pointer-events-none" style={{ width: "1280px", height: "720px" }} muted playsInline />
      <video ref={screenVideoRef} className="opacity-0 absolute pointer-events-none" style={{ width: "1280px", height: "720px" }} muted playsInline />
    </div>
  );
}
