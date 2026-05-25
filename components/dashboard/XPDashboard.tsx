"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Zap, Trophy, Medal, TrendingUp, Loader2 } from "lucide-react";
import { useXP } from "@/hooks/useXP";

interface XPData {
  totalXp: number;
  weeklyXp: number;
  dailyXp: number;
  level: number;
  streakDays: number;
  longestStreak: number;
  rank: number | null;
  weeklyRank: number | null;
  nextLevelXp: number;
  recentLogs: { action: string; xpEarned: number; multiplier: number; createdAt: string; label: string }[];
  badges: { id: string; earnedAt: string }[];
  allBadges: { id: string; name: string; description: string; icon: string; earned: boolean }[];
}

export default function XPDashboard() {
  const [data, setData] = useState<XPData | null>(null);
  const [loading, setLoading] = useState(true);
  const { awardXP } = useXP();

  useEffect(() => {
    fetch("/api/xp/stats")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        if (d?.totalXp != null) setLoading(false);
      })
      .catch(() => setLoading(false));

    // Award daily login XP once per day
    const awarded = sessionStorage.getItem("xp_daily_login");
    if (!awarded) {
      awardXP("daily_login").then(() => {
        sessionStorage.setItem("xp_daily_login", "true");
      });
    }
  }, [awardXP]);

  if (loading) return null;

  return (
    <div className="space-y-4">
      {/* XP Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 text-white overflow-hidden relative"
        style={{ background: "linear-gradient(135deg, #5c35d9 0%, #7c4dff 50%, #b388ff 100%)" }}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Level {data?.level || 1}</p>
              <h2 className="text-2xl font-bold mt-0.5">{(data?.totalXp || 0).toLocaleString()} XP</h2>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-xs">Weekly XP</p>
              <p className="text-lg font-bold">{(data?.weeklyXp || 0).toLocaleString()}</p>
            </div>
          </div>
          {/* Level progress */}
          {data && (
            <div>
              <div className="flex justify-between text-xs text-white/70 mb-1">
                <span>Level {data.level}</span>
                <span>{(data.totalXp % data.nextLevelXp).toLocaleString()} / {data.nextLevelXp.toLocaleString()} XP</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((data.totalXp % data.nextLevelXp) / data.nextLevelXp) * 100}%` }}
                  className="h-full rounded-full"
                  style={{ background: "#fdd835" }}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Flame, label: "Streak", value: `${data?.streakDays || 0}d`, color: "#f97316" },
          { icon: Trophy, label: "Rank", value: data?.rank ? `#${data.rank}` : "--", color: "#fdd835" },
          { icon: Zap, label: "Daily XP", value: `${data?.dailyXp || 0}`, color: "#5c35d9" },
          { icon: TrendingUp, label: "Best Streak", value: `${data?.longestStreak || 0}d`, color: "#22c55e" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl p-3.5 border border-gray-100 text-center hover:shadow-md transition-shadow">
            <s.icon size={18} className="mx-auto mb-1.5" style={{ color: s.color }} />
            <p className="text-lg font-bold text-gray-900">{s.value}</p>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Badges */}
      {data && data.allBadges.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Badges & Achievements</h3>
          <div className="flex flex-wrap gap-2">
            {data.allBadges.map((badge) => (
              <div key={badge.id} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${badge.earned ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-gray-50 text-gray-400 border border-gray-100 opacity-50"}`}
                title={badge.description}>
                <span>{badge.icon}</span>
                <span>{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent XP Activity */}
      {data && data.recentLogs.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Recent Activity</h3>
          <div className="space-y-2">
            {data.recentLogs.slice(0, 5).map((log, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: log.multiplier > 1 ? "#fdd835" : "#5c35d9" }} />
                  <span className="text-sm text-gray-700">{log.label}</span>
                  {log.multiplier > 1 && (
                    <span className="text-[10px] font-bold text-orange-500">{log.multiplier}x</span>
                  )}
                </div>
                <span className="text-sm font-bold text-gray-900">+{log.xpEarned}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Leaderboard Link */}
      <a href="/leaderboard" className="block text-center py-3 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-[#5c35d9] hover:bg-gray-50 transition-colors">
        View Leaderboard →
      </a>
    </div>
  );
}
