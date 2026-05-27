import { supabaseAdmin } from "@/lib/supabase/admin";

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
  const config = XP_ACTIONS[action];
  if (!config) throw new Error("Unknown XP action");

  const today = new Date().toISOString().split("T")[0];

  let { data: xpProfile } = await supabaseAdmin
    .from("user_xp")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!xpProfile) {
    const { data } = await supabaseAdmin
      .from("user_xp")
      .insert({ user_id: userId })
      .select()
      .single();
    xpProfile = data;
  }

  // Prevent duplicate daily_login XP
  if (action === "daily_login" && xpProfile.last_active_date === today) {
    const { data: existingLog } = await supabaseAdmin
      .from("xp_logs")
      .select("id")
      .eq("user_id", userId)
      .eq("action", "daily_login")
      .gte("created_at", today)
      .maybeSingle();
    if (existingLog) {
      const xp = await getUserXP(userId);
      return { xpEarned: 0, newLevel: xp?.level || 1, streakDays: xp?.streakDays || 0, newBadges: [] };
    }
  }

  let streakDays = xpProfile.streak_days || 0;
  const lastActive = xpProfile.last_active_date;

  if (lastActive !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (lastActive === yesterdayStr) {
      streakDays += 1;
    } else if (lastActive !== today) {
      streakDays = 1;
    }
  }

  const multi = streakMultiplier(streakDays);
  const baseXp = config.xp;
  const xpEarned = Math.round(baseXp * multi);

  const newTotal = (xpProfile.total_xp || 0) + xpEarned;
  const newWeekly = (xpProfile.weekly_xp || 0) + xpEarned;
  const newDaily = lastActive === today ? (xpProfile.daily_xp || 0) + xpEarned : xpEarned;
  const newLevel = calcLevel(newTotal);
  const longestStreak = Math.max(xpProfile.longest_streak || 0, streakDays);

  await supabaseAdmin.from("xp_logs").insert({
    user_id: userId,
    action,
    xp_earned: xpEarned,
    multiplier: multi,
    metadata,
  });

  await supabaseAdmin.from("user_xp").upsert({
    user_id: userId,
    total_xp: newTotal,
    weekly_xp: newWeekly,
    daily_xp: newDaily,
    level: newLevel,
    streak_days: streakDays,
    longest_streak: longestStreak,
    last_active_date: today,
    updated_at: new Date().toISOString(),
  });

  const newBadges = await checkBadges(userId, {
    total_xp: newTotal,
    streak: streakDays,
    weekly_rank: metadata.weeklyRank,
  });

  return { xpEarned, newLevel, streakDays, newBadges };
}

async function checkBadges(
  userId: string,
  stats: { total_xp: number; streak: number; weekly_rank?: number }
): Promise<string[]> {
  const earned: string[] = [];

  const checks: { badgeId: string; condition: boolean }[] = [
    { badgeId: "xp_1000", condition: stats.total_xp >= 1000 },
    { badgeId: "xp_5000", condition: stats.total_xp >= 5000 },
    { badgeId: "xp_10000", condition: stats.total_xp >= 10000 },
    { badgeId: "streak_7", condition: stats.streak >= 7 },
    { badgeId: "streak_30", condition: stats.streak >= 30 },
    { badgeId: "streak_100", condition: stats.streak >= 100 },
  ];

  if (stats.weekly_rank) {
    checks.push(
      { badgeId: "top_10_weekly", condition: stats.weekly_rank <= 10 },
      { badgeId: "top_3_weekly", condition: stats.weekly_rank <= 3 }
    );
  }

  const { data: existingBadges } = await supabaseAdmin
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", userId);

  const existing = new Set((existingBadges || []).map((b) => b.badge_id));

  for (const check of checks) {
    if (check.condition && !existing.has(check.badgeId)) {
      await supabaseAdmin.from("user_badges").insert({
        user_id: userId,
        badge_id: check.badgeId,
      });
      earned.push(check.badgeId);
    }
  }

  if (earned.length > 0) {
    const { data: badgeRecords } = await supabaseAdmin
      .from("badges")
      .select("id")
      .in("id", earned);

    const badgeIds = (badgeRecords || []).map((b) => b.id);

    await supabaseAdmin
      .from("user_xp")
      .update({
        badges: supabaseAdmin.rpc("array_append_unique", {
          arr: existingBadges?.map((b) => b.badge_id) || [],
          val: badgeIds,
        }),
      })
      .eq("user_id", userId);
  }

  return earned;
}

export async function getUserXP(userId: string) {
  const { data: xp } = await supabaseAdmin
    .from("user_xp")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!xp) return null;

  const { data: rankData } = await supabaseAdmin
    .from("alltime_leaderboard")
    .select("rank")
    .eq("user_id", userId)
    .maybeSingle();

  const { data: weeklyRankData } = await supabaseAdmin
    .from("weekly_leaderboard")
    .select("rank")
    .eq("user_id", userId)
    .maybeSingle();

  const { data: recentLogs } = await supabaseAdmin
    .from("xp_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: earnedBadges } = await supabaseAdmin
    .from("user_badges")
    .select("badge_id, earned_at")
    .eq("user_id", userId);

  const { data: allBadges } = await supabaseAdmin.from("badges").select("*");

  const nextLevelXp = xpForNextLevel(xp.level);

  return {
    totalXp: xp.total_xp || 0,
    weeklyXp: xp.weekly_xp || 0,
    dailyXp: xp.daily_xp || 0,
    level: xp.level || 1,
    streakDays: xp.streak_days || 0,
    longestStreak: xp.longest_streak || 0,
    rank: rankData?.rank || null,
    weeklyRank: weeklyRankData?.rank || null,
    nextLevelXp,
    recentLogs: (recentLogs || []).map((l) => ({
      action: l.action,
      xpEarned: l.xp_earned,
      multiplier: l.multiplier,
      createdAt: l.created_at,
      label: XP_ACTIONS[l.action as XPAction]?.label || l.action,
    })),
    badges: (earnedBadges || []).map((b) => ({
      id: b.badge_id,
      earnedAt: b.earned_at,
    })),
    allBadges: (allBadges || []).map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      icon: b.icon,
      requirementType: b.requirement_type,
      requirementValue: b.requirement_value,
      earned: (earnedBadges || []).some((eb) => eb.badge_id === b.id),
    })),
  };
}
