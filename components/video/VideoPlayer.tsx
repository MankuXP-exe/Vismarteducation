"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api/client";

type Props = {
  videoUrl: string;
  lectureId: string;
  batchId: string;
  studentId: string;
  title?: string;
  autoPlay?: boolean;
};

export default function VideoPlayer({
  videoUrl,
  lectureId,
  batchId,
  studentId,
  title,
  autoPlay = true,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      setDuration(video.duration);
      setIsReady(true);
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    progressInterval.current = setInterval(async () => {
      if (!video.paused && video.duration) {
        await api.lectures.updateProgress(lectureId, {
          watchedSeconds: Math.floor(video.currentTime),
          totalSeconds: Math.floor(video.duration),
        });
      }
    }, 10000); // Save every 10 seconds

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [lectureId, batchId, studentId]);

  return (
    <div ref={containerRef} className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
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
