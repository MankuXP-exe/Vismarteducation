"use client";

import { useRef, useCallback, useEffect } from "react";
import { useXP } from "@/hooks/useXP";

interface Props {
  src: string;
  poster?: string;
  lectureId: string;
  lectureTitle: string;
}

export default function LectureVideoPlayer({ src, poster, lectureId, lectureTitle }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const xpAwardedRef = useRef(false);
  const { awardXP } = useXP();

  const reportProgress = useCallback(
    async (completed = false) => {
      const video = videoRef.current;
      if (!video || !video.duration) return;
      try {
        await fetch("/api/history/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lectureId,
            watchedSeconds: Math.floor(video.currentTime),
            totalSeconds: Math.floor(video.duration),
            completed,
          }),
        });
      } catch {}
    },
    [lectureId]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (video && !video.paused && video.duration > 0) {
        reportProgress(false);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [reportProgress]);

  const handleEnded = useCallback(async () => {
    await reportProgress(true);
    if (xpAwardedRef.current) return;
    xpAwardedRef.current = true;
    await awardXP("lecture_watch", { lectureId, title: lectureTitle });
  }, [awardXP, lectureId, lectureTitle, reportProgress]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster || undefined}
      controls
      preload="metadata"
      playsInline
      controlsList="nodownload"
      className="h-full w-full"
      onEnded={handleEnded}
      onPause={() => reportProgress(false)}
    />
  );
}
