"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Zap, Crown, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  weekly_xp?: number;
  total_xp?: number;
  level: number;
  rank: number;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"weekly" | "alltime">("weekly");
  const [weekly, setWeekly] = useState<LeaderboardEntry[]>([]);
  const [alltime, setAlltime] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/xp/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        setWeekly(d.weekly || []);
        setAlltime(d.alltime || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const data = tab === "weekly" ? weekly : alltime;
  const xpKey = tab === "weekly" ? "weekly_xp" : "total_xp";

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Link href="/dashboard/study" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <Trophy size={28} style={{ color: "#fdd835" }} />
              <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
            </div>
            <p className="text-gray-500 text-sm">Compete with fellow students. Earn XP, climb the ranks.</p>
          </motion.div>

          {/* Tab Toggle */}
          <div className="flex bg-white rounded-xl border border-gray-200 p-1 mb-6">
            {[
              { key: "weekly", label: "Weekly", icon: Zap },
              { key: "alltime", label: "All-Time", icon: Crown },
            ].map((t) => (
              <button key={t.key} onClick={() => setTab(t.key as any)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === t.key ? "bg-[#5c35d9] text-white shadow" : "text-gray-500 hover:text-gray-700"}`}>
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Leaderboard List */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={28} className="animate-spin" style={{ color: "#5c35d9" }} />
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Trophy size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No data yet</p>
              <p className="text-sm">Start studying to earn XP and appear here!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.map((entry, i) => {
                const isMe = entry.user_id === user?.id;
                const rank = entry.rank;
                const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
                const xp = entry[xpKey as keyof LeaderboardEntry] as number;

                return (
                  <motion.div key={entry.user_id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isMe ? "bg-purple-50 border border-purple-200" : "bg-white border border-gray-100 hover:border-gray-200"}`}>
                    {/* Rank */}
                    <div className="w-8 text-center shrink-0">
                      {medal ? (
                        <span className="text-xl">{medal}</span>
                      ) : (
                        <span className={`text-sm font-bold ${rank <= 10 ? "text-gray-900" : "text-gray-400"}`}>#{rank}</span>
                      )}
                    </div>
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: isMe ? "#5c35d9" : "#9e9e9e" }}>
                      {(entry.full_name || "S").charAt(0).toUpperCase()}
                    </div>
                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {entry.full_name || "Student"}
                        {isMe && <span className="text-[10px] text-purple-600 font-medium ml-1">(You)</span>}
                      </p>
                      <p className="text-xs text-gray-400">Level {entry.level}</p>
                    </div>
                    {/* XP */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-900">{(xp || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400">XP</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Tip */}
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">💡 How to earn XP</p>
            <p>Watch lectures (+20 XP), attend live classes (+10 XP), attempt tests (+25 XP), maintain your streak for multipliers!</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
