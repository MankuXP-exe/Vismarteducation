"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

export function MiniXPBadge() {
  const [xp, setXp] = useState<{ level: number; totalXp: number } | null>(null);

  useEffect(() => {
    fetch("/api/xp/stats")
      .then((r) => r.json())
      .then((d) => setXp({ level: d.level ?? 1, totalXp: d.totalXp ?? 0 }))
      .catch(() => setXp({ level: 1, totalXp: 0 }));
  }, []);

  if (!xp) return null;

  return (
    <span className="flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
      <Star size={14} className="fill-purple-500 text-purple-500" />
      Lvl {xp.level} · {xp.totalXp} XP
    </span>
  );
}
