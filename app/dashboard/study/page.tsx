"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Clock,
  HelpCircle,
  Bookmark,
  X,
  Star,
  User,
} from "lucide-react";
import { studentData } from "@/lib/student-mock-data";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

export default function StudyPage() {
  const [alertDismissed, setAlertDismissed] = useState(false);
  const router = useRouter();
  const { profile, user } = useAuth();

  const displayName = profile?.full_name || user?.user_metadata?.full_name || studentData.name;
  const userClass = profile?.current_class || user?.user_metadata?.current_class || "";
  const userXp = profile?.xp_points ?? studentData.xp;

  const hasExpiredBatch = studentData.enrolledBatches.some(
    (b) => b.status === "expired"
  );

  const learningCards = [
    {
      id: "card-my-batches",
      icon: <Package size={28} className="text-[#5c35d9]" />,
      bg: "#eef2ff",
      title: "My Batches",
      subtitle: "View list of the batches in which you are enrolled",
      href: "/dashboard/batches",
    },
    {
      id: "card-recent-learning",
      icon: <Clock size={28} className="text-orange-500" />,
      bg: "#fff8ee",
      title: "Recent Learning",
      subtitle: "View your past learning history",
      href: "/dashboard/study/recent",
    },
    {
      id: "card-my-doubts",
      icon: <HelpCircle size={28} className="text-green-500" />,
      bg: "#efffef",
      title: "My Doubts",
      subtitle: "View the list of your asked doubts in the lectures",
      href: "/dashboard/study/doubts",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[#5c35d9]/10 flex items-center justify-center">
              <User size={16} className="text-[#5c35d9]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
              {userClass && (
                <p className="text-xs text-gray-500">{userClass}</p>
              )}
            </div>
          </div>
        </div>
        <span className="flex items-center gap-1.5 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
          <Star size={14} className="fill-purple-500 text-purple-500" />
          {userXp} XP
        </span>
      </div>

      {/* Expired Batch Alert */}
      {hasExpiredBatch && !alertDismissed && (
        <div
          className="relative flex items-center gap-3 rounded-xl px-5 py-4 mb-6 border"
          style={{ background: "#fff3f3", borderColor: "#ffcccc" }}
        >
          <span className="text-2xl shrink-0">⏰</span>
          <div className="flex-1">
            <p className="font-semibold text-red-700 text-sm">
              Your batch access has expired! Renew to continue learning.
            </p>
          </div>
          <Link
            href="/dashboard/batches"
            className="text-red-600 text-sm font-medium hover:underline shrink-0"
          >
            See Details →
          </Link>
          <button
            onClick={() => setAlertDismissed(true)}
            className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition-colors"
            aria-label="Dismiss alert"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* My Learning Section */}
      <section className="mb-8">
        <h2 className="font-semibold text-lg text-gray-900 mb-4">My Learning</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {learningCards.map((card) => (
            <motion.div
              key={card.id}
              id={card.id}
              whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.10)" }}
              transition={{ duration: 0.15 }}
              onClick={() => router.push(card.href)}
              className="rounded-2xl p-6 cursor-pointer transition-all duration-200"
              style={{ background: card.bg }}
            >
              <div className="mb-4">{card.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{card.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{card.subtitle}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="mb-8">
        <h2 className="font-semibold text-lg text-gray-900 mb-4">Quick Access</h2>
        <div className="max-w-xs">
          <motion.div
            id="card-bookmarks"
            whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
            transition={{ duration: 0.15 }}
            onClick={() => router.push("/dashboard/study/bookmarks")}
            className="rounded-2xl p-6 cursor-pointer transition-all duration-200 bg-white border border-gray-100"
          >
            <div className="mb-4">
              <Bookmark size={28} className="text-[#5c35d9]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Bookmarks</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              View the list of your saved questions
            </p>
          </motion.div>
        </div>
      </section>

      {/* Motivational Text */}
      <div className="text-center mt-10 pb-4">
        <p className="text-gray-400 text-sm italic">Padhlo chahe kahi se</p>
        <p className="text-gray-400 text-sm italic font-medium">
          Manzil milegi yahi se! 🎯
        </p>
      </div>
    </motion.div>
  );
}
