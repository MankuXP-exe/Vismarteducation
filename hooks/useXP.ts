"use client";

import { useCallback } from "react";
import toast from "react-hot-toast";

export function useXP() {
  const awardXP = useCallback(async (action: string, metadata?: Record<string, any>) => {
    try {
      const res = await fetch("/api/xp/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, metadata }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data.xpEarned > 0) {
        toast.success(`+${data.xpEarned} XP`, { duration: 2000 });
      }
      if (data.newBadges?.length > 0) {
        toast.success(`🏆 New badge unlocked!`, { duration: 4000 });
      }
      return data;
    } catch {
      return null;
    }
  }, []);

  return { awardXP };
}
