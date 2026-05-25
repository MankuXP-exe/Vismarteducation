"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LiveKitRoom, useTracks, FocusLayout, ParticipantTile, RoomAudioRenderer } from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";
import toast from "react-hot-toast";
import LiveRecording from "./LiveRecording";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

type Props = {
  classId: string;
  role: "teacher" | "student";
};

function YouTubeStage() {
  const tracks = useTracks([
    Track.Source.Camera,
    Track.Source.ScreenShare,
    Track.Source.Microphone,
  ]);

  const screenShare = tracks.find((t) => t.source === Track.Source.ScreenShare);
  const cameras = tracks.filter((t) => t.source === Track.Source.Camera);
  const mainTrack = screenShare || cameras[0];
  const others = cameras.filter((t) => t !== mainTrack).slice(0, 4);

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
      {others.length > 0 && (
        <div className="flex justify-center gap-1.5 overflow-x-auto px-2 py-1.5">
          {others.map((track) => (
            <div key={track.participant.identity} className="h-20 w-28 shrink-0 overflow-hidden rounded-lg md:h-24 md:w-36">
              <ParticipantTile trackRef={track} className="h-full w-full" />
            </div>
          ))}
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
  const [classStatus, setClassStatus] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const router = useRouter();

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

  const videoOptions = role === "teacher"
    ? { resolution: { width: 1280, height: 720 }, codec: "vp8" }
    : false;

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
        data-lk-theme="default"
        className="flex-1"
        onConnected={() => setConnected(true)}
        onDisconnected={() => toast.error("Disconnected from live stream")}
      >
        <YouTubeStage />
        <RoomAudioRenderer />
        {role === "teacher" && (
          <button
            onClick={stopLive}
            disabled={ending}
            className="fixed bottom-4 right-4 z-[70] rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-red-700 disabled:opacity-50 md:bottom-6 md:right-6 md:px-5 md:py-3 md:text-base"
          >
            {ending ? "Ending..." : "Stop Live"}
          </button>
        )}
      </LiveKitRoom>
    </div>
  );
}
