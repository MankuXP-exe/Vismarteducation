"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Mic, MicOff, Camera, CameraOff, MonitorUp, RotateCw,
  PhoneOff, Loader2, Signal, Wifi,
} from "lucide-react";

const WHIP_BASE = "https://live.vismartlearningeducation.com";
const AUTH = btoa("teacher:ViSmartLive2026!");
const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

type Props = {
  classId: string;
  roomName: string;
  onEnd: () => void;
};

function Controls({
  micOn, setMicOn, camOn, setCamOn,
  onEnd, live,
}: {
  micOn: boolean; setMicOn: (v: boolean) => void;
  camOn: boolean; setCamOn: (v: boolean) => void;
  onEnd: () => void;
  live: boolean;
}) {
  const btnClass = "flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full backdrop-blur-md border border-white/10 transition-all active:scale-95";
  return (
    <div className="flex items-center justify-center gap-2 md:gap-3 px-3 py-3 md:py-4">
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
  );
}

export default function TeacherLiveStreamer({ classId, roomName, onEnd }: Props) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [live, setLive] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState("");

  const updateTracks = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc || !streamRef.current) return;
    const senders = pc.getSenders();
    for (const track of streamRef.current.getTracks()) {
      const existing = senders.find((s) => s.track?.kind === track.kind);
      if (existing) {
        await existing.replaceTrack(track);
      } else {
        pc.addTrack(track, streamRef.current);
      }
    }
  }, []);

  useEffect(() => {
    if (!camOn) {
      streamRef.current?.getVideoTracks().forEach((t) => t.enabled = false);
      return;
    }
    streamRef.current?.getVideoTracks().forEach((t) => t.enabled = true);
  }, [camOn]);

  useEffect(() => {
    if (!micOn) {
      streamRef.current?.getAudioTracks().forEach((t) => t.enabled = false);
      return;
    }
    streamRef.current?.getAudioTracks().forEach((t) => t.enabled = true);
  }, [micOn]);

  useEffect(() => {
    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1920, height: 1080, facingMode: "user" },
          audio: true,
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;

        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        pcRef.current = pc;

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
            setLive(true);
            setConnecting(false);
          } else if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
            setLive(false);
          }
        };

        pc.onicecandidate = async (e) => {
          if (e.candidate) return;
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

            const answer = await res.text();
            await pc.setRemoteDescription({ type: "answer", sdp: answer });
          } catch (err: any) {
            setError(err.message);
            setConnecting(false);
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
      } catch (err: any) {
        setError(err.message);
        setConnecting(false);
      }
    }

    init();

    return () => {
      pcRef.current?.close();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [classId, roomName]);

  const handleEnd = useCallback(async () => {
    pcRef.current?.close();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onEnd();
  }, [onEnd]);

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
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
          )}
        </div>
      </div>
      <div className="bg-gradient-to-t from-gray-950 via-gray-950/95 to-transparent">
        <Controls micOn={micOn} setMicOn={setMicOn} camOn={camOn} setCamOn={setCamOn}
          onEnd={handleEnd} live={live} />
      </div>
    </div>
  );
}
