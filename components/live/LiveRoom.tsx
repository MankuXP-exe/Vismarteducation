"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LiveKitRoom, RoomAudioRenderer, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import toast from "react-hot-toast";

type Props = {
  classId: string;
  role: "teacher" | "student";
};

export default function LiveRoom({ classId, role }: Props) {
  const [token, setToken] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ending, setEnding] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function getToken() {
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

    getToken();
  }, [classId, role]);

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
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="text-center text-white">
          <p className="mb-4 text-xl text-red-300">{error}</p>
          <button onClick={() => window.history.back()} className="rounded-lg bg-purple-600 px-6 py-3">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  async function stopLive() {
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
  }

  return (
    <LiveKitRoom
      video={role === "teacher"}
      audio={role === "teacher"}
      token={token}
      serverUrl={serverUrl}
      data-lk-theme="default"
      style={{ position: "fixed", inset: 0, zIndex: 50, height: "100vh" }}
    >
      <VideoConference />
      <RoomAudioRenderer />
      {role === "teacher" && (
        <button
          onClick={stopLive}
          disabled={ending}
          className="fixed bottom-6 right-6 z-[60] rounded-lg bg-red-600 px-5 py-3 font-semibold text-white shadow-lg hover:bg-red-700 disabled:opacity-50"
        >
          {ending ? "Ending..." : "Stop live"}
        </button>
      )}
    </LiveKitRoom>
  );
}
