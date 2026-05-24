"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Video } from "lucide-react";
import toast from "react-hot-toast";

export default function InstantLiveButton({ batchId }: { batchId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function start() {
    setLoading(true);
    try {
      const res = await fetch("/api/live/instant-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId, title: "Instant Live Class" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start");
      toast.success("Live class started!");
      router.push(`/teacher/live/${data.liveClass.id}`);
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  }

  return (
    <button
      onClick={start}
      disabled={loading}
      className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-5 text-left hover:border-green-400 disabled:opacity-50"
    >
      <Video className="h-6 w-6 text-green-600" />
      <div>
        <h3 className="font-bold text-gray-900">{loading ? "Starting..." : "Start instant live"}</h3>
        <p className="text-sm text-gray-500">Begin a live class immediately — no scheduling needed.</p>
      </div>
    </button>
  );
}
