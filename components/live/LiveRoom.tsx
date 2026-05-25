"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LiveKitRoom, useTracks, FocusLayout,
  RoomAudioRenderer, useLocalParticipant,
} from "@livekit/components-react";
import { Track, VideoPresets, createLocalVideoTrack } from "livekit-client";
import "@livekit/components-styles";
import toast from "react-hot-toast";
import {
  Mic, MicOff, Camera, CameraOff, MonitorUp, RotateCw,
  X, PhoneOff, MessageCircle, Users, Maximize2,
  Loader2, Signal, Wifi,
} from "lucide-react";
import LiveRecording from "./LiveRecording";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { useXP } from "@/hooks/useXP";

type Props = { classId: string; role: "teacher" | "student" };

function TeacherControls({
  micOn, setMicOn, camOn, setCamOn, shareOn, setShareOn,
  switchCamera, devices, onEnd,
}: {
  micOn: boolean; setMicOn: (v: boolean) => void;
  camOn: boolean; setCamOn: (v: boolean) => void;
  shareOn: boolean; setShareOn: (v: boolean) => void;
  switchCamera: () => void;
  devices: MediaDeviceInfo[];
  onEnd: () => void;
}) {
  const btnClass = "flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full backdrop-blur-md border border-white/10 transition-all active:scale-95";

  return (
    <div className="flex items-center justify-center gap-2 md:gap-3 px-3 py-3 md:py-4">
      <button onClick={() => { setMicOn(!micOn); }}
        className={`${btnClass} ${micOn ? "bg-white/20 text-white hover:bg-white/30" : "bg-red-500/80 text-white"}`}
        title={micOn ? "Mute" : "Unmute"}>
        {micOn ? <Mic className="h-4 w-4 md:h-5 md:w-5" /> : <MicOff className="h-4 w-4 md:h-5 md:w-5" />}
      </button>
      <button onClick={() => { setCamOn(!camOn); }}
        className={`${btnClass} ${camOn ? "bg-white/20 text-white hover:bg-white/30" : "bg-red-500/80 text-white"}`}
        title={camOn ? "Camera off" : "Camera on"}>
        {camOn ? <Camera className="h-4 w-4 md:h-5 md:w-5" /> : <CameraOff className="h-4 w-4 md:h-5 md:w-5" />}
      </button>
      <button onClick={() => setShareOn(!shareOn)}
        className={`${btnClass} ${shareOn ? "bg-purple-600 text-white shadow-lg shadow-purple-500/40" : "bg-white/20 text-white hover:bg-white/30"}`}
        title={shareOn ? "Stop sharing" : "Share screen"}>
        <MonitorUp className="h-4 w-4 md:h-5 md:w-5" />
      </button>
      {devices.length > 1 && (
        <button onClick={switchCamera}
          className={`${btnClass} bg-white/20 text-white hover:bg-white/30`} title="Switch camera">
          <RotateCw className="h-4 w-4 md:h-5 md:w-5" />
        </button>
      )}
      <div className="mx-1 h-8 w-px bg-white/10 md:mx-2" />
      <button onClick={onEnd}
        className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-500/30 hover:bg-red-700 active:scale-95 transition-all"
        title="End class">
        <PhoneOff className="h-4 w-4 md:h-5 md:w-5" />
      </button>
    </div>
  );
}

function TeacherStage({ onEnd }: { onEnd: () => void }) {
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare, Track.Source.Microphone]);
  const screenShare = tracks.find((t) => t.source === Track.Source.ScreenShare);
  const cameras = tracks.filter((t) => t.source === Track.Source.Camera);
  const mainTrack = screenShare || cameras[0];
  const { localParticipant } = useLocalParticipant();
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [shareOn, setShareOn] = useState(false);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((d) => {
      const cams = d.filter((d) => d.kind === "videoinput");
      setDevices(cams);
      if (cams.length > 0 && !currentDeviceId) setCurrentDeviceId(cams[0].deviceId);
    });
  }, [currentDeviceId]);

  useEffect(() => { localParticipant?.setMicrophoneEnabled(micOn); }, [micOn, localParticipant]);
  useEffect(() => { localParticipant?.setCameraEnabled(camOn); }, [camOn, localParticipant]);

  async function switchCamera() {
    if (devices.length < 2) return;
    const idx = devices.findIndex((d) => d.deviceId === currentDeviceId);
    const next = devices[(idx + 1) % devices.length];
    const track = await createLocalVideoTrack({ deviceId: next.deviceId, resolution: VideoPresets.h1080.resolution });
    await localParticipant?.setCameraEnabled(false);
    await localParticipant?.publishTrack(track, { videoEncoding: VideoPresets.h1080.encoding });
    setCurrentDeviceId(next.deviceId);
  }

  async function handleScreenShare() {
    if (shareOn) {
      const st = tracks.find((t) => t.source === Track.Source.ScreenShare);
      st?.participant?.getTrackPublication(st.source)?.track?.stop();
      setShareOn(false);
    } else {
      try {
        const st = await localParticipant?.createScreenTracks({ resolution: VideoPresets.h1080.resolution });
        if (st) { st.forEach((t) => localParticipant?.publishTrack(t)); setShareOn(true); }
      } catch { setShareOn(false); }
    }
  }

  return (
    <div className="flex h-full w-full flex-col bg-gray-950">
      <div className="relative flex-1 overflow-hidden">
        {mainTrack ? (
          <FocusLayout trackRef={mainTrack} className="h-full w-full" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Camera className="mx-auto mb-3 h-12 w-12 text-white/30 md:h-16 md:w-16" />
              <p className="text-base text-white/50 md:text-lg">Your camera is off</p>
              <p className="mt-1 text-xs text-white/30 md:text-sm">Click camera button to enable</p>
            </div>
          </div>
        )}
        <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-md bg-red-600/90 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider md:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </span>
          <span className="rounded-md bg-black/50 px-2 py-1 text-[10px] text-white/70 backdrop-blur-sm md:text-xs">
            {camOn ? "Camera On" : "Camera Off"}
          </span>
        </div>
      </div>
      <div className="bg-gradient-to-t from-gray-950 via-gray-950/95 to-transparent">
        <TeacherControls
          micOn={micOn} setMicOn={setMicOn}
          camOn={camOn} setCamOn={setCamOn}
          shareOn={shareOn}
          setShareOn={async (v) => { setShareOn(v); if (v !== shareOn) handleScreenShare(); }}
          switchCamera={switchCamera} devices={devices} onEnd={onEnd} />
      </div>
    </div>
  );
}

function StudentStage({ classEnded }: { classEnded: boolean }) {
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare, Track.Source.Microphone]);
  const screenShare = tracks.find((t) => t.source === Track.Source.ScreenShare);
  const cameras = tracks.filter((t) => t.source === Track.Source.Camera);
  const mainTrack = screenShare || cameras[0];

  return (
    <div className="flex h-full w-full flex-col bg-gray-950">
      <div className="relative flex-1 overflow-hidden">
        {mainTrack && !classEnded ? (
          <FocusLayout trackRef={mainTrack} className="h-full w-full" />
        ) : classEnded ? (
          <div className="flex h-full items-center justify-center">
            <div className="mx-auto max-w-sm px-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800 md:h-20 md:w-20">
                <PhoneOff className="h-8 w-8 text-gray-500 md:h-10 md:w-10" />
              </div>
              <h2 className="mb-1 text-lg font-bold text-white md:text-xl">Class Ended</h2>
              <p className="text-sm text-gray-400">This live class has ended. Recording will be available shortly.</p>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 animate-pulse rounded-full border-4 border-purple-500 border-t-transparent md:h-20 md:w-20" />
              <p className="text-base font-medium text-white/80 md:text-lg">Stream will start shortly...</p>
              <p className="mt-1 text-xs text-white/40 md:text-sm">Waiting for the teacher to begin</p>
            </div>
          </div>
        )}
      </div>
      {classEnded ? null : (
        <div className="flex items-center justify-center gap-3 bg-gray-950/90 px-4 py-3 backdrop-blur-sm">
          {mainTrack ? (
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              <Signal className="h-3.5 w-3.5" /> Streaming
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-yellow-400">
              <Wifi className="h-3.5 w-3.5" /> Waiting for teacher
            </span>
          )}
          <span className="text-xs text-gray-500">|</span>
          <span className="flex items-center gap-1.5 rounded bg-red-600/80 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            Live
          </span>
        </div>
      )}
    </div>
  );
}

export default function LiveRoom({ classId, role }: Props) {
  const [token, setToken] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ending, setEnding] = useState(false);
  const [classEnded, setClassEnded] = useState(false);
  const [connected, setConnected] = useState(false);
  const router = useRouter();
  const { awardXP } = useXP();
  const xpAwardedRef = useRef(false);
  const checkClassStatus = useCallback(async () => {
    if (!isSupabaseAdminConfigured) return false;
    const { data } = await supabaseAdmin
      .from("live_classes")
      .select("status")
      .eq("id", classId)
      .single();
    if (data?.status === "completed" || data?.status === "cancelled") {
      setClassEnded(true);
      setConnected(false);
      return true;
    }
    return false;
  }, [classId]);

  useEffect(() => {
    if (connected && role === "student" && !xpAwardedRef.current) {
      xpAwardedRef.current = true;
      awardXP("live_class", { classId });
    }
  }, [connected, role, awardXP, classId]);

  useEffect(() => {
    async function init() {
      const ended = await checkClassStatus();
      if (ended) { setLoading(false); return; }
      const res = await fetch("/api/live/get-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, role }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        const endedAfter = await checkClassStatus();
        if (!endedAfter) setError(data.error ?? "Unable to join live class");
        setLoading(false);
        return;
      }
      setToken(data.token);
      setServerUrl(data.livekitUrl);
      setLoading(false);
      setConnected(true);
    }
    init();
  }, [classId, role, checkClassStatus]);

  const onDisconnected = useCallback(async () => {
    if (role === "student") {
      await checkClassStatus();
    }
    if (!classEnded) {
      toast.error("Disconnected from live stream");
    }
  }, [role, checkClassStatus, classEnded]);

  const stopLive = useCallback(async () => {
    setEnding(true);
    try {
      const res = await fetch("/api/live/end-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to end class");
      toast.success("Live class ended");
      awardXP("live_class", { classId });
      router.push("/teacher");
    } catch (err: any) {
      toast.error(err.message);
      setEnding(false);
    }
  }, [classId, router, awardXP]);

  const isTeacher = role === "teacher";

  if (classEnded && !isTeacher) {
    return <LiveRecording classId={classId} />;
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-purple-500" />
          <p className="text-base font-medium text-white/80">Joining live class...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950 p-4">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800">
            <X className="h-8 w-8 text-red-400" />
          </div>
          <p className="mb-1 text-lg font-bold text-white">Unable to Join</p>
          <p className="mb-6 text-sm text-gray-400">{error}</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => router.back()}
              className="rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700">
              Go Back
            </button>
            <button onClick={() => window.location.reload()}
              className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const videoOptions = isTeacher
    ? { resolution: VideoPresets.h1080.resolution, facingMode: "user" as const }
    : false;

  const roomOptions = isTeacher
    ? {
        dynacast: true,
        publishDefaults: {
          simulcast: true,
          videoCodecs: "h264" as const,
          videoEncoding: VideoPresets.h1080.encoding,
          videoSimulcastLayers: [VideoPresets.h720, VideoPresets.h360],
          screenshareEncoding: VideoPresets.h1080.encoding,
          screenshareSimulcastLayers: [VideoPresets.h720, VideoPresets.h360],
        },
        videoCaptureDefaults: { resolution: VideoPresets.h1080.resolution },
      }
    : { dynacast: true };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-950">
      {!connected && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-950/90 backdrop-blur-sm">
          <div className="text-center">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-purple-500" />
            <p className="text-sm font-medium text-white/80">Connecting...</p>
          </div>
        </div>
      )}
      <LiveKitRoom
        video={videoOptions}
        audio={isTeacher}
        token={token}
        serverUrl={serverUrl}
        options={roomOptions}
        data-lk-theme="default"
        className="flex-1"
        onConnected={() => setConnected(true)}
        onDisconnected={onDisconnected}>
        {isTeacher ? <TeacherStage onEnd={stopLive} /> : <StudentStage classEnded={classEnded} />}
        <RoomAudioRenderer />
        {ending && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-gray-950/80 backdrop-blur-sm">
            <div className="text-center">
              <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-purple-500" />
              <p className="text-sm font-medium text-white/80">Ending class...</p>
            </div>
          </div>
        )}
      </LiveKitRoom>
    </div>
  );
}
