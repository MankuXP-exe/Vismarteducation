"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Mic, MicOff, Camera, CameraOff, MonitorUp, RotateCw,
  PhoneOff, Loader2, Square, Maximize2, Minus,
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
const MAX_BITRATE = 1_500_000;
const PIP_SIZES = { small: 200, medium: 280, large: 360 } as const;
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

// ─── Controls component ──────────────────────────────────────────

type ControlsProps = {
  micOn: boolean; setMicOn: (v: boolean) => void;
  camOn: boolean; setCamOn: (v: boolean) => void;
  screenOn: boolean; setScreenOn: (v: boolean) => void;
  mode: Mode; setMode: (v: Mode) => void;
  pipSize: PipSize; setPipSize: (v: PipSize) => void;
  onFlipCamera: () => void;
  onEnd: () => void;
  live: boolean;
};

function Controls({
  micOn, setMicOn, camOn, setCamOn,
  screenOn, setScreenOn, mode, setMode,
  pipSize, setPipSize, onFlipCamera, onEnd, live,
}: ControlsProps) {
  const btnClass = "flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full backdrop-blur-md border border-white/10 transition-all active:scale-95";

  return (
    <div className="flex flex-col items-center gap-2 px-3 py-3 md:py-4">
      {/* Mode row */}
      <div className="flex items-center gap-1.5">
        <button onClick={() => setMode("camera")}
          className={`rounded-lg px-3 py-1 text-[11px] font-medium transition-all ${mode === "camera" ? "bg-purple-600 text-white" : "bg-white/10 text-white/60 hover:bg-white/20"}`}>
          Camera
        </button>
        <button onClick={() => { if (screenOn) setMode("screen"); }}
          className={`rounded-lg px-3 py-1 text-[11px] font-medium transition-all ${!screenOn ? "opacity-40 cursor-not-allowed" : ""} ${mode === "screen" ? "bg-purple-600 text-white" : "bg-white/10 text-white/60 hover:bg-white/20"}`}>
          Screen
        </button>
        <button onClick={() => { if (screenOn) setMode("pip"); }}
          className={`rounded-lg px-3 py-1 text-[11px] font-medium transition-all ${!screenOn ? "opacity-40 cursor-not-allowed" : ""} ${mode === "pip" ? "bg-purple-600 text-white" : "bg-white/10 text-white/60 hover:bg-white/20"}`}>
          Screen+Cam
        </button>
      </div>

      {/* Main controls row */}
      <div className="flex items-center justify-center gap-2 md:gap-3">
        <button onClick={() => setMicOn(!micOn)}
          className={`${btnClass} ${micOn ? "bg-white/20 text-white hover:bg-white/30" : "bg-red-500/80 text-white"}`}
          title={micOn ? "Mute" : "Unmute"}>
          {micOn ? <Mic className="h-4 w-4 md:h-5 md:w-5" /> : <MicOff className="h-4 w-4 md:h-5 md:w-5" />}
        </button>

        <button onClick={() => setCamOn(!camOn)}
          className={`${btnClass} ${camOn ? "bg-white/20 text-white hover:bg-white/30" : "bg-red-500/80 text-white"}`}
          title={camOn ? "Camera off" : "Camera on"}>
          {camOn ? <Camera className="h-4 w-4 md:h-5 md:w-5" /> : <CameraOff className="h-4 w-4 md:h-5 md:w-5" />}
        </button>

        <button onClick={onFlipCamera}
          className={`${btnClass} bg-white/20 text-white hover:bg-white/30`}
          title="Flip camera">
          <RotateCw className="h-4 w-4 md:h-5 md:w-5" />
        </button>

        <button onClick={() => setScreenOn(!screenOn)}
          className={`${btnClass} ${screenOn ? "bg-emerald-500/80 text-white" : "bg-white/20 text-white hover:bg-white/30"}`}
          title={screenOn ? "Stop sharing" : "Share screen"}>
          <MonitorUp className="h-4 w-4 md:h-5 md:w-5" />
        </button>

        {/* PIP size controls (only visible in pip mode) */}
        {mode === "pip" && screenOn && (
          <div className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-1">
            {(["small", "medium", "large"] as PipSize[]).map((s) => {
              const Icon = s === "small" ? Minus : s === "medium" ? Square : Maximize2;
              return (
                <button key={s} onClick={() => setPipSize(s)}
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition-all ${pipSize === s ? "bg-purple-600 text-white" : "text-white/50 hover:text-white"}`}
                  title={`${s} PIP`}>
                  <Icon className="h-3 w-3" />
                </button>
              );
            })}
          </div>
        )}

        <div className="mx-1 h-8 w-px bg-white/10 md:mx-2" />

        <button onClick={onEnd}
          className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-500/30 hover:bg-red-700 active:scale-95 transition-all"
          title="End class">
          <PhoneOff className="h-4 w-4 md:h-5 md:w-5" />
        </button>

        {live && (
          <span className="flex items-center gap-1.5 rounded-md bg-red-600/90 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider md:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> LIVE
          </span>
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
  const screenAudioSenderRef = useRef<RTCRtpSender | null>(null);
  const animFrameRef = useRef<number>(0);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenOn, setScreenOn] = useState(false);
  const [live, setLive] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>("camera");
  const [pipSize, setPipSize] = useState<PipSize>("medium");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  // ─── Compositor loop ──────────────────────────────────────────────
  // Always paint every rAF frame to keep canvas.captureStream(30) alive.
  // captureStream samples at 30fps internally, so painting at 60fps is fine.

  const drawFrameRef = useRef<() => void>(() => {});

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) { animFrameRef.current = requestAnimationFrame(drawFrameRef.current); return; }

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const isSelfFacing = facingMode === "user";
    const scrReady = screenVideoRef.current?.readyState;
    const camReady = cameraVideoRef.current?.readyState;
    const hasScreen = screenOn && scrReady !== undefined && scrReady >= 2;
    const hasCamera = camOn && camReady !== undefined && camReady >= 2;

    if (hasScreen && mode !== "camera") {
      drawAspectFill(ctx, screenVideoRef.current!, 0, 0, CANVAS_W, CANVAS_H);
    }

    if (hasCamera) {
      if (!hasScreen || mode === "camera") {
        ctx.save();
        if (isSelfFacing) {
          ctx.translate(CANVAS_W, 0);
          ctx.scale(-1, 1);
        }
        drawAspectFill(ctx, cameraVideoRef.current!, 0, 0, CANVAS_W, CANVAS_H);
        ctx.restore();
      } else if (mode === "pip") {
        const pipW = PIP_SIZES[pipSize];
        const pipAspect = 16 / 9;
        const pipH = Math.round(pipW / pipAspect);
        const pipX = CANVAS_W - pipW - 20;
        const pipY = CANVAS_H - pipH - 20;

        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 20;
        ctx.beginPath();
        roundRect(ctx, pipX - 2, pipY - 2, pipW + 4, pipH + 4, 12);
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        roundRect(ctx, pipX, pipY, pipW, pipH, 10);
        ctx.clip();

        if (isSelfFacing) {
          ctx.save();
          ctx.translate(CANVAS_W, 0);
          ctx.scale(-1, 1);
          drawAspectCover(ctx, cameraVideoRef.current!, CANVAS_W - pipX - pipW, pipY, pipW, pipH);
          ctx.restore();
        } else {
          drawAspectCover(ctx, cameraVideoRef.current!, pipX, pipY, pipW, pipH);
        }

        ctx.strokeStyle = "#7c3aed";
        ctx.lineWidth = 3;
        ctx.beginPath();
        roundRect(ctx, pipX, pipY, pipW, pipH, 10);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Camera-off placeholder when camera expected but disabled
    if (!hasCamera && camOn === false && (mode === "camera" || (hasScreen && mode === "pip"))) {
      ctx.fillStyle = "rgba(30, 30, 40, 0.85)";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = "#555";
      ctx.font = "48px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("📷", CANVAS_W / 2, CANVAS_H / 2 - 12);
      ctx.font = "14px sans-serif";
      ctx.fillStyle = "#777";
      ctx.fillText("Camera Off", CANVAS_W / 2, CANVAS_H / 2 + 32);
    }

    animFrameRef.current = requestAnimationFrame(drawFrameRef.current);
  }, [camOn, screenOn, mode, pipSize, facingMode]);

  // Keep ref in sync so rAF always calls latest
  drawFrameRef.current = drawFrame;

  // Continuous rAF loop — never restarts, so captureStream never gaps
  useEffect(() => {
    const loop = () => {
      drawFrameRef.current();
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // ─── Audio track management ──────────────────────────────────────

  // Mic audio sender (always present)
  const switchAudioTrack = useCallback(async (newTrack: MediaStreamTrack | null) => {
    const sender = audioSenderRef.current;
    if (!sender) {
      if (newTrack && pcRef.current) {
        const s = pcRef.current.addTrack(newTrack, new MediaStream([newTrack]));
        audioSenderRef.current = s;
      }
      return;
    }
    if (newTrack) {
      try { await sender.replaceTrack(newTrack); } catch { /* ignore */ }
    } else {
      try { await sender.replaceTrack(null); } catch { /* ignore */ }
    }
  }, []);

  // Screen audio sender (added when screenshare has audio, removed when screen stops)
  const setupScreenAudio = useCallback(async (screenAudioTrack: MediaStreamTrack | null) => {
    const oldSender = screenAudioSenderRef.current;
    if (oldSender) {
      try {
        const pc = pcRef.current;
        if (pc) pc.removeTrack(oldSender);
      } catch { /* ignore */ }
      screenAudioSenderRef.current = null;
    }
    if (screenAudioTrack && pcRef.current) {
      try {
        const sender = pcRef.current.addTrack(screenAudioTrack, new MediaStream([screenAudioTrack]));
        screenAudioSenderRef.current = sender;
      } catch { /* ignore */ }
    }
  }, []);

  // ─── Mic toggle ──────────────────────────────────────────────────

  useEffect(() => {
    cameraStreamRef.current?.getAudioTracks().forEach((t) => t.enabled = micOn);
  }, [micOn]);

  // ─── Camera toggle ───────────────────────────────────────────────

  useEffect(() => {
    cameraStreamRef.current
      ?.getVideoTracks()
      .forEach(track => {
        track.enabled = camOn
      })
  }, [camOn])

  const setupCamera = useCallback(async (facing: "user" | "environment") => {
    // Stop previous camera
    cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
    cameraStreamRef.current = null;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: facing },
        audio: true,
      });
      cameraStreamRef.current = stream;

      // Feed hidden camera video element for compositor
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
        cameraVideoRef.current.play().catch(() => {});
      }

      // Set mic audio sender
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = micOn;
        await switchAudioTrack(audioTrack);
      }
    } catch (err: any) {
      if (err.name !== "NotAllowedError" && err.name !== "NotFoundError") {
        console.error("Camera error:", err.message);
      }
    }
  }, [micOn, switchAudioTrack]);

  // ─── Screenshare toggle ──────────────────────────────────────────

  const toggleScreen = useCallback(async (enabled: boolean) => {
    const pc = pcRef.current;
    if (!enabled) {
      await setupScreenAudio(null);
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      if (screenVideoRef.current) screenVideoRef.current.srcObject = null;

      // Swap back to camera track directly
      if (pc && cameraStreamRef.current) {
        const camTrack = cameraStreamRef.current.getVideoTracks()[0];
        const sender = pc.getSenders().find(s => s.track?.kind === "video");
        if (sender && camTrack) {
          await sender.replaceTrack(camTrack);
        }
      }

      setScreenOn(false);
      setMode((prev) => prev === "screen" || prev === "pip" ? "camera" : prev);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      screenStreamRef.current = stream;

      stream.getVideoTracks()[0].onended = () => {
        toggleScreen(false);
      };

      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
        screenVideoRef.current.play().catch(() => {});
      }

      // When screen share starts, swap to canvas compositor
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        const drawScreen = () => {
          if (!screenVideoRef.current || !screenOn && !stream.active) return;
          ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
          ctx.fillStyle = "#111";
          ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
          if (mode === "screen" || mode === "pip") {
            drawAspectFill(ctx, screenVideoRef.current, 0, 0, CANVAS_W, CANVAS_H);
          }
          requestAnimationFrame(drawScreen);
        };
        drawScreen();
      }

      const screenAudio = stream.getAudioTracks()[0];
      if (screenAudio) {
        await setupScreenAudio(screenAudio);
      }

      // Swap video track to canvas stream for screen/pip mode
      if (pc) {
        const canvasStream = canvasRef.current!.captureStream(30);
        const canvasVideoTrack = canvasStream.getVideoTracks()[0];
        const sender = pc.getSenders().find(s => s.track?.kind === "video");
        if (sender && canvasVideoTrack) {
          await sender.replaceTrack(canvasVideoTrack);
        }
      }

      setScreenOn(true);
      setMode((prev) => prev === "screen" ? "screen" : "pip");
    } catch {
      setScreenOn(false);
    }
  }, [setupScreenAudio, screenOn, mode]);

  // ─── Flip camera ─────────────────────────────────────────────────

  const handleFlipCamera = useCallback(async () => {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    await setupCamera(next);
  }, [facingMode, setupCamera]);

  // ─── Initial setup ───────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // 1. Get camera — use lower resolution for less encoding overhead
        const camStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: true,
        });
        if (cancelled) { camStream.getTracks().forEach((t) => t.stop()); return; }
        cameraStreamRef.current = camStream;

        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = camStream;
          cameraVideoRef.current.play().catch(() => {});
        }

        // 2. Create canvas and capture stream
        const canvas = canvasRef.current!;
        canvas.width = CANVAS_W;
        canvas.height = CANVAS_H;
        const canvasStream = canvas.captureStream(30);
        const audioTrack = camStream.getAudioTracks()[0];
        if (audioTrack) audioTrack.enabled = micOn;

        // 3. Create peer connection with optimized settings
        const pc = new RTCPeerConnection({
          iceServers: ICE_SERVERS,
          iceTransportPolicy: "all",
          bundlePolicy: "max-bundle",
          rtcpMuxPolicy: "require",
        });
        pcRef.current = pc;

        // 4. Add VIDEO — use camera directly in camera mode (skip canvas), canvas for screen modes
        const camVideoTrack = camStream.getVideoTracks()[0];
        pc.addTrack(camVideoTrack, camStream);
        if (audioTrack) {
          const sender = pc.addTrack(audioTrack, new MediaStream([audioTrack]));
          audioSenderRef.current = sender;
        }

        // 5. Force H.264 for video transceiver
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

        // 6. Connection state
        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
            setLive(true);
            setConnecting(false);

            // Cap video bitrate — lower for stability
            try {
              const sender = pc.getSenders().find(s => s.track?.kind === "video");
              if (sender) {
                const params = sender.getParameters();
                if (!params.encodings) params.encodings = [{}];
                params.encodings[0].maxBitrate = MAX_BITRATE;
                params.encodings[0].maxFramerate = 30;
                params.encodings[0].networkPriority = "high";
                sender.setParameters(params).catch(() => {});
              }
            } catch { /* non-critical */ }
          } else if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
            setLive(false);
          }
        };

        // 7. WHIP — send offer once ICE gathering completes (with timeout fallback)
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

            // Sanitize SDP for Android WebView (Capacitor) which rejects a=recvonly at session level
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

            // Preview the camera stream
            if (videoRef.current) {
              videoRef.current.srcObject = camStream;
              videoRef.current.play().catch(() => {});
            }
          } catch (err: any) {
            setError(err.message);
            setConnecting(false);
          }
        };

        pc.onicecandidate = (e) => {
          if (!e.candidate) sendWhip();
        };

        // Fallback: if ICE gathering doesn't complete in 4s, send anyway
        setTimeout(() => { if (!whipSent) sendWhip(); }, 4000);

        // 8. Create offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
          setConnecting(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animFrameRef.current);
      pcRef.current?.close();
      pcRef.current = null;
      cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
      screenStreamRef.current = null;
    };
  }, [classId, roomName, micOn]);

  // ─── End stream ──────────────────────────────────────────────────

  const handleEnd = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
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
          <p className="mb-1 text-lg font-bold text-white">Failed to Start Stream</p>
          <p className="mb-6 text-sm text-gray-400">{error}</p>
          <button onClick={() => router.back()}
            className="rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-950">
      {/* Compositor preview (what teacher sees = what students get) */}
      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} autoPlay muted playsInline
          className="h-full w-full object-contain" />

        {connecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm">
            <div className="text-center">
              <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-purple-500" />
              <p className="text-sm font-medium text-white/80">Connecting to stream server...</p>
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2">
          {live && (
            <span className="flex items-center gap-1.5 rounded-md bg-red-600/90 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider md:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> LIVE
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gradient-to-t from-gray-950 via-gray-950/95 to-transparent">
        <Controls
          micOn={micOn} setMicOn={setMicOn}
          camOn={camOn} setCamOn={setCamOn}
          screenOn={screenOn} setScreenOn={toggleScreen}
          mode={mode} setMode={setMode}
          pipSize={pipSize} setPipSize={setPipSize}
          onFlipCamera={handleFlipCamera}
          onEnd={handleEnd}
          live={live}
        />
      </div>

      {/* Hidden canvas compositor */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden video elements feeding the compositor (opacity-0 keeps decoder active, reasonable size prevents decode throttling) */}
      <video ref={cameraVideoRef} className="opacity-0 absolute pointer-events-none" style={{ width: "1280px", height: "720px" }} muted playsInline />
      <video ref={screenVideoRef} className="opacity-0 absolute pointer-events-none" style={{ width: "1280px", height: "720px" }} muted playsInline />
    </div>
  );
}
