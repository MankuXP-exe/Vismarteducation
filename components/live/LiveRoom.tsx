"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LiveKitRoom, useTracks, FocusLayout, ParticipantTile,
  RoomAudioRenderer, useLocalParticipant
} from "@livekit/components-react";
import { Track, VideoPresets, createLocalVideoTrack } from "livekit-client";
import "@livekit/components-styles";
import toast from "react-hot-toast";
import { RotateCw, Mic, MicOff, Camera, CameraOff, MonitorUp, Star } from "lucide-react";
import LiveRecording from "./LiveRecording";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { useXP } from "@/hooks/useXP";

type Props = {
  classId: string;
  role: "teacher" | "student";
};

function TeacherStage() {
  const tracks = useTracks([
    Track.Source.Camera,
    Track.Source.ScreenShare,
    Track.Source.Microphone,
  ]);

  const screenShare = tracks.find((t) => t.source === Track.Source.ScreenShare);
  const cameras = tracks.filter((t) => t.source === Track.Source.Camera);
  const mainTrack = screenShare || cameras[0];
  const others = cameras.filter((t) => t !== mainTrack).slice(0, 4);
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

  async function switchCamera() {
    if (devices.length < 2) return;
    const idx = devices.findIndex((d) => d.deviceId === currentDeviceId);
    const next = devices[(idx + 1) % devices.length];
    const track = await createLocalVideoTrack({
      deviceId: next.deviceId,
      resolution: VideoPresets.h1080.resolution,
    });
    await localParticipant?.setCameraEnabled(false);
    await localParticipant?.publishTrack(track, { videoEncoding: VideoPresets.h1080.encoding });
    setCurrentDeviceId(next.deviceId);
    toast("Camera switched", { duration: 1500 });
  }

  function toggleMic() {
    const next = !micOn;
    localParticipant?.setMicrophoneEnabled(next);
    setMicOn(next);
  }

  function toggleCam() {
    const next = !camOn;
    localParticipant?.setCameraEnabled(next);
    setCamOn(next);
  }

  async function toggleScreenShare() {
    if (shareOn) {
      const screenTrack = tracks.find((t) => t.source === Track.Source.ScreenShare);
      if (screenTrack?.participant) {
        const pub = screenTrack.participant.getTrackPublication(screenTrack.source);
        if (pub?.track) pub.track.stop();
      }
      setShareOn(false);
    } else {
      try {
        const screenTracks = await localParticipant?.createScreenTracks({
          resolution: VideoPresets.h1080.resolution,
        });
        if (screenTracks && screenTracks.length > 0) {
          screenTracks.forEach((track) => { localParticipant?.publishTrack(track); });
          setShareOn(true);
        }
      } catch (e: any) {
        toast.error(e?.message || "Screen share cancelled");
      }
    }
  }

  const btnBase = "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors md:h-12 md:w-12";

  return (
    <div className="flex h-full w-full flex-col bg-black">
      <div className="relative flex-1 overflow-hidden">
        {mainTrack ? (
          <FocusLayout trackRef={mainTrack} className="h-full w-full" />
        ) : (
          <div className="flex h-full items-center justify-center text-white/60 text-lg">
            Waiting for video...
          </div>
        )}
      </div>
      <div className="flex items-center justify-center gap-2 overflow-x-auto px-2 py-1.5">
        {others.map((track) => (
          <div key={track.participant.identity} className="h-20 w-28 shrink-0 overflow-hidden rounded-lg md:h-24 md:w-36">
            <ParticipantTile trackRef={track} className="h-full w-full" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-3 bg-gray-900 px-4 py-3">
        <button
          onClick={toggleMic}
          className={`${btnBase} ${micOn ? "bg-white/15 text-white hover:bg-white/25" : "bg-red-600 text-white"}`}
          title={micOn ? "Mute microphone" : "Unmute microphone"}
        >
          {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </button>
        <button
          onClick={toggleCam}
          className={`${btnBase} ${camOn ? "bg-white/15 text-white hover:bg-white/25" : "bg-red-600 text-white"}`}
          title={camOn ? "Turn off camera" : "Turn on camera"}
        >
          {camOn ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
        </button>
        <button
          onClick={toggleScreenShare}
          className={`${btnBase} ${shareOn ? "bg-[#5c35d9] text-white" : "bg-white/15 text-white hover:bg-white/25"}`}
          title={shareOn ? "Stop sharing screen" : "Share screen"}
        >
          <MonitorUp className="h-5 w-5" />
        </button>
        {devices.length > 1 && (
          <button
            onClick={switchCamera}
            className={`${btnBase} bg-white/15 text-white hover:bg-white/25`}
            title="Switch camera"
          >
            <RotateCw className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

function StudentStage() {
  const tracks = useTracks([
    Track.Source.Camera,
    Track.Source.ScreenShare,
    Track.Source.Microphone,
  ]);

  const screenShare = tracks.find((t) => t.source === Track.Source.ScreenShare);
  const cameras = tracks.filter((t) => t.source === Track.Source.Camera);
  const mainTrack = screenShare || cameras[0];

  return (
    <div className="flex h-full w-full flex-col bg-black">
      {/* YouTube-style watermark */}
      <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-2">
        <div className="rounded bg-black/60 px-2.5 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
          LIVE
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden">
        {mainTrack ? (
          <FocusLayout trackRef={mainTrack} className="h-full w-full" />
        ) : (
          <div className="flex h-full items-center justify-center text-white/60 text-lg">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-full border-4 border-purple-500 border-t-transparent" />
              <p>Stream will start shortly...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LiveRoom({ classId, role }: Props) {
  const [token, setToken] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ending, setEnding] = useState(false);
  const [classStatus, setClassStatus] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const router = useRouter();
  const { awardXP } = useXP();
  const xpAwardedRef = useRef(false);

  // Award XP when student successfully connects to the room
  useEffect(() => {
    if (connected && role === "student" && !xpAwardedRef.current) {
      xpAwardedRef.current = true;
      awardXP("live_class", { classId });
    }
  }, [connected, role, awardXP, classId]);

  useEffect(() => {
    async function init() {
      if (isSupabaseAdminConfigured) {
        const { data: liveClass } = await supabaseAdmin
          .from("live_classes")
          .select("status")
          .eq("id", classId)
          .single();
        if (liveClass) {
          setClassStatus(liveClass.status);
          if (liveClass.status === "completed" || liveClass.status === "cancelled") {
            setLoading(false);
            return;
          }
        }
      }
      const res = await fetch("/api/live/get-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, role }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "Unable to join live class");
        setLoading(false);
        return;
      }
      setToken(data.token);
      setServerUrl(data.livekitUrl);
      setLoading(false);
      setConnected(true);
    }
    init();
  }, [classId, role]);

  const stopLive = useCallback(async () => {
    if (!confirm("End this live class for all participants?")) return;
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
  }, [classId, router]);

  if (classStatus === "completed" || classStatus === "cancelled") {
    return <LiveRecording classId={classId} />;
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="text-center text-white">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
          <p>Joining live class...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 p-4">
        <div className="text-center text-white">
          <p className="mb-4 text-xl text-red-300">{error}</p>
          <button onClick={() => window.history.back()} className="rounded-lg bg-purple-600 px-6 py-3 text-sm md:text-base">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isTeacher = role === "teacher";

  const videoOptions = isTeacher
    ? {
        resolution: VideoPresets.h1080.resolution,
        facingMode: "user" as const,
      }
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
        videoCaptureDefaults: {
          resolution: VideoPresets.h1080.resolution,
        },
      }
    : {
        // Student: just receive, don't publish anything
        dynacast: true,
      };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {!connected && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80">
          <div className="text-center text-white">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
            <p>Connecting to live stream...</p>
          </div>
        </div>
      )}
      <LiveKitRoom
        video={videoOptions}
        audio={role === "teacher"}
        token={token}
        serverUrl={serverUrl}
        options={roomOptions}
        data-lk-theme="default"
        className="flex-1"
        onConnected={() => setConnected(true)}
        onDisconnected={() => toast.error("Disconnected from live stream")}
      >
        {isTeacher ? <TeacherStage /> : <StudentStage />}
        <RoomAudioRenderer />
        {isTeacher ? (
          <button
            onClick={stopLive}
            disabled={ending}
            className="fixed bottom-4 right-4 z-[70] rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-red-700 disabled:opacity-50 md:bottom-6 md:right-6 md:px-5 md:py-3 md:text-base"
          >
            {ending ? "Ending..." : "Stop Live"}
          </button>
        ) : (
          <div className="fixed bottom-4 left-4 z-[70] flex items-center gap-2 rounded-lg bg-black/60 px-3 py-1.5 text-xs text-white/70 backdrop-blur-sm">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            Live
          </div>
        )}
      </LiveKitRoom>
    </div>
  );
}
