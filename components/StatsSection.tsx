"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

function useCountUp(target: number, duration = 2000, start = false) {
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
    id: "stats-students",
    number: 500,
    suffix: "+",
    label: "Happy Students",
    icon: "😊",
    color: "#5c35d9",
  },
  {
    id: "stats-teachers",
    number: 10,
    suffix: "+",
    label: "Expert Teachers",
    icon: "👨‍🏫",
    color: "#1a237e",
  },
  {
    id: "stats-experience",
    number: 5,
    suffix: "+",
    label: "Years Experience",
    icon: "🏆",
    color: "#c62828",
  },
  {
    id: "stats-result",
    number: 100,
    suffix: "%",
    label: "Result Commitment",
    icon: "🎯",
    color: "#2e7d32",
  },
];

function StatBox({
  stat,
  inView,
}: {
  stat: (typeof stats)[0];
  inView: boolean;
}) {
  const count = useCountUp(stat.number, 2000, inView);

  return (
    <motion.div
      id={stat.id}
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-md p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
    >
      <span className="text-4xl mb-3">{stat.icon}</span>
      <p
        className="text-4xl md:text-5xl font-black leading-none"
        style={{ color: stat.color }}
      >
        {inView ? count : 0}
        {stat.suffix}
      </p>
      <p className="mt-2 text-gray-600 font-semibold text-sm md:text-base text-center">
        {stat.label}
      </p>
    </motion.div>
  );
}

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="stats"
      className="py-16 px-4 md:px-8"
      style={{ background: "#f5f5f5" }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-[#5c35d9] font-semibold text-sm uppercase tracking-widest mb-2">
            Our Numbers
          </p>
          <h2 className="section-heading">Vi Smart by the Numbers</h2>
          <div className="section-divider" />
        </motion.div>

        <div
          ref={ref}
          className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6"
        >
          {stats.map((stat) => (
            <StatBox key={stat.id} stat={stat} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
