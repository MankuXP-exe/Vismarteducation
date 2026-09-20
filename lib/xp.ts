import { api } from "@/lib/api/client";

export const XP_ACTIONS = {
  daily_login: { xp: 5, label: "Daily Login" },
  live_class: { xp: 10, label: "Live Class Attended" },
  lecture_watch: { xp: 20, label: "Lecture Watched" },
  assignment: { xp: 15, label: "Assignment Completed" },
  test_attempt: { xp: 25, label: "Test Attempted" },
  test_high_score: { xp: 10, label: "High Score Bonus" },
  doubt_comment: { xp: 2, label: "Doubt Asked" },
  share_notes: { xp: 5, label: "Notes Shared" },
} as const;

export type XPAction = keyof typeof XP_ACTIONS;

export function calcLevel(totalXp: number): number {
  return Math.floor(Math.sqrt(totalXp / 100)) + 1;
}

export function xpForNextLevel(level: number): number {
  return level * level * 100;
}

export function streakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return 2;
  if (streakDays >= 14) return 1.5;
  if (streakDays >= 7) return 1.25;
  return 1;
}

export async function awardXP(
  userId: string,
  action: XPAction,
  metadata: Record<string, any> = {}
): Promise<{ xpEarned: number; newLevel: number; streakDays: number; newBadges: string[] }> {
  try {
    const { data } = await api.xp.award({ action, metadata });
    if (data) {
      return {
        xpEarned: data.xpEarned || 0,
        newLevel: data.newLevel || 1,
        streakDays: data.streakDays || 0,
        newBadges: data.newBadges || [],
      };
    }
  } catch (err) {
    console.warn("Failed to award XP via VPS API:", err);
  }
  return { xpEarned: 0, newLevel: 1, streakDays: 0, newBadges: [] };
}

export async function getUserXPStats(userId?: string) {
  try {
    const { data } = await api.xp.getStats();
    if (data) return data;
  } catch {}
  return {
    totalXp: 0,
    weeklyXp: 0,
    dailyXp: 0,
    level: 1,
    streakDays: 0,
    longestStreak: 0,
    rank: 0,
    weeklyRank: 0,
    recentLogs: [],
    badges: [],
    allBadges: [],
  };
}

export const getUserXP = getUserXPStats;
