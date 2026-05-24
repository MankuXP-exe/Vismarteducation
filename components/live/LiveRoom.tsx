"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom, RoomAudioRenderer, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";

type Props = {
  classId: string;
  role: "teacher" | "student";
};

export default function LiveRoom({ classId, role }: Props) {
  const [token, setToken] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <LiveKitRoom
      video={role === "teacher"}
      audio={role === "teacher"}
      token={token}
      serverUrl={serverUrl}
      data-lk-theme="default"
      style={{ height: "100vh" }}
    >
      <VideoConference />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
