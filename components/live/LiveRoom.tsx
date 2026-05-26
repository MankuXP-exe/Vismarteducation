"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import TeacherLiveStreamer from "./TeacherLiveStreamer";
import StudentLiveViewer from "./StudentLiveViewer";

import { useXP } from "@/hooks/useXP";

type Props = { classId: string; role: "teacher" | "student" };

export default function LiveRoom({ classId, role }: Props) {
  const router = useRouter();
  const { awardXP } = useXP();
  const xpAwardedRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ending, setEnding] = useState(false);
  const [classData, setClassData] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchClass() {
      try {
        const res = await fetch(`/api/live/class/${classId}`);
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok || !json.data) {
          setError(json.error || "Class not found");
          setLoading(false);
          return;
        }
        if (json.data.status === "completed" || json.data.status === "cancelled") {
          if (role === "teacher") {
            toast("This class has already ended");
            router.push("/teacher");
            return;
          }
        }
        setClassData(json.data);
      } catch (e: any) {
        if (!classData && !cancelled) setError(e.message || "Failed to fetch class data");
      }
      if (!cancelled) setLoading(false);
    }
    fetchClass();
    const pollMs = role === "student" ? 5000 : 10000;
    const pollId = setInterval(fetchClass, pollMs);
    return () => { cancelled = true; clearInterval(pollId); };
  }, [classId, role, router]);

  const startLive = useCallback(async () => {
    if (!classData?.hms_room_id) {
      toast.error("No room configured for this class");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/live/start-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start live class");
      setClassData((prev: any) => ({ ...prev, status: "live" }));
      awardXP("live_class", { classId });
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  }, [classId, classData, awardXP]);

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
          <button onClick={() => router.back()}
            className="rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (role === "teacher") {
    if (classData?.status === "scheduled") {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950 p-4">
          <div className="max-w-md text-center">
            <h2 className="mb-2 text-2xl font-bold text-white">{classData.title}</h2>
            <p className="mb-6 text-sm text-gray-400">
              {classData.description || "Click below to start this live class"}
            </p>
            <button onClick={startLive}
              className="rounded-xl bg-purple-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-purple-500/30 hover:bg-purple-700 transition-all active:scale-95">
              Go Live
            </button>
          </div>
        </div>
      );
    }

    if (classData?.status === "live") {
      return (
        <TeacherLiveStreamer
          classId={classId}
          roomName={classData.hms_room_id}
          onEnd={stopLive}
        />
      );
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950 p-4">
        <div className="max-w-sm text-center">
          <p className="text-lg font-bold text-white">Class status: {classData?.status}</p>
          <button onClick={() => router.back()}
            className="mt-4 rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const hlsUrl = classData?.hls_url ||
    `https://stream.vismartlearningeducation.com/live/live/${classData?.hms_room_id}/index.m3u8`;

  return (
    <StudentLiveViewer
      classId={classId}
      classStatus={classData?.status || "scheduled"}
      hlsUrl={hlsUrl}
    />
  );
}
