"use client";

import { useEffect, useRef, useState } from "react";
import { updateLectureProgress } from "@/lib/supabase/queries";

type Props = {
  videoUrl: string;
  lectureId: string;
  batchId: string;
  studentId: string;
  lastPosition?: number;
};

export default function VideoPlayer({
  videoUrl,
  lectureId,
  batchId,
  studentId,
  lastPosition = 0,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      if (lastPosition > 0) video.currentTime = lastPosition;
      setIsReady(true);
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    progressInterval.current = setInterval(async () => {
      if (!video.paused && video.duration) {
        await updateLectureProgress({
          studentId,
          lectureId,
          batchId,
          watchedSeconds: Math.floor(video.currentTime),
          totalSeconds: Math.floor(video.duration),
          lastPosition: Math.floor(video.currentTime),
        });
      }
    }, 10000);

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [batchId, lastPosition, lectureId, studentId, videoUrl]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
        preload="metadata"
        playsInline
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support video playback.
      </video>
      <div className="absolute top-4 right-4 text-white/30 text-xs pointer-events-none select-none">
        Vi Smart Learning
      </div>
    </div>
  );
}
