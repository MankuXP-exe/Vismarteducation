"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

const stats = [
  {
    icon: "🔴",
    iconLabel: "LIVE",
    stat: null,
    text: "Daily Live Interactive Classes",
    isLive: true,
    id: "stat-live",
  },
  {
    icon: "📝",
    iconLabel: null,
    stat: 500,
    suffix: "+",
    text: "Students Enrolled",
    isLive: false,
    id: "stat-students",
  },
  {
    icon: "🎯",
    iconLabel: null,
    stat: null,
    text: "24×7 Doubt Solving Support",
    isLive: false,
    id: "stat-doubt",
  },
  {
    icon: "📚",
    iconLabel: null,
    stat: 100,
    suffix: "+",
    text: "Video Lectures",
    isLive: false,
    id: "stat-videos",
  },
];

function StatItem({ item, inView }: { item: typeof stats[0]; inView: boolean }) {
  const count = useCountUp(item.stat ?? 0, 1800, inView && !!item.stat);

  return (
    <motion.div
      id={item.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-6 px-4 text-center group"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-3xl">{item.icon}</span>
        {item.isLive && (
          <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-white live-dot" />
            LIVE
          </span>
        )}
      </div>
      {item.stat !== null ? (
        <p className="text-3xl font-extrabold text-[#5c35d9] font-poppins leading-none">
          {inView ? count : 0}
          {item.suffix}
        </p>
      ) : null}
      <p className="mt-1.5 text-sm md:text-base font-semibold text-gray-700 max-w-[140px] leading-snug">
        {item.text}
      </p>
    </motion.div>
  );
}

export default function TrustStats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="trust-stats"
      className="bg-white py-4"
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}
    >
      <div className="max-w-6xl mx-auto px-4" ref={ref}>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
          {stats.map((item) => (
            <StatItem key={item.id} item={item} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
