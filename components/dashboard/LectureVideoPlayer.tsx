"use client";

import { useRef, useCallback } from "react";
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

  const handleEnded = useCallback(async () => {
    if (xpAwardedRef.current) return;
    xpAwardedRef.current = true;
    await awardXP("lecture_watch", { lectureId, title: lectureTitle });
  }, [awardXP, lectureId, lectureTitle]);

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
    />
  );
}
