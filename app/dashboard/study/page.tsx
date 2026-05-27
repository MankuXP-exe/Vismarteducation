"use client";

import { useRouter } from "next/navigation";
import { Package, Clock, HelpCircle, Bookmark, User, ChevronLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import XPDashboard from "@/components/dashboard/XPDashboard";
import { MiniXPBadge } from "@/components/dashboard/MiniXPBadge";
import BackButton from "@/components/ui/BackButton";

export default function StudyPage() {
  const router = useRouter();
  const { profile, user } = useAuth();

  const displayName = profile?.full_name || user?.user_metadata?.full_name || "Student";

  const learningCards = [
    {
      id: "card-my-batches",
      icon: <Package size={28} className="text-[#5c35d9]" />,
      bg: "#eef2ff",
      title: "My Batches",
      subtitle: "View your real batches and uploaded lectures",
      href: "/dashboard/batches",
    },
    {
      id: "card-recent-learning",
      icon: <Clock size={28} className="text-orange-500" />,
      bg: "#fff8ee",
      title: "Recent Learning",
      subtitle: "View your watched lectures",
      href: "/dashboard/recent-learning",
    },
    {
      id: "card-my-doubts",
      icon: <HelpCircle size={28} className="text-green-500" />,
      bg: "#efffef",
      title: "My Doubts",
      subtitle: "View doubts asked from lectures",
      href: "/dashboard/doubts",
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="mb-4 flex items-center gap-2 sm:gap-3">
        <button onClick={() => router.push("/")} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#5c35d9]/10">
            <User size={16} className="text-[#5c35d9]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{displayName}</h1>
          </div>
        </div>
        <MiniXPBadge />
      </div>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">My Learning</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {learningCards.map((card) => (
            <motion.div
              key={card.id}
              id={card.id}
              whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.10)" }}
              transition={{ duration: 0.15 }}
              onClick={() => router.push(card.href)}
              className="cursor-pointer rounded-xl p-6 transition-all duration-200"
              style={{ background: card.bg }}
            >
              <div className="mb-4">{card.icon}</div>
              <h3 className="mb-1 font-semibold text-gray-900">{card.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{card.subtitle}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">XP & Gamification</h2>
        <XPDashboard />
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Access</h2>
        <div className="max-w-xs">
          <motion.div
            id="card-bookmarks"
            whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
            transition={{ duration: 0.15 }}
            onClick={() => router.push("/dashboard/bookmarks")}
            className="cursor-pointer rounded-xl border border-gray-100 bg-white p-6 transition-all duration-200"
          >
            <div className="mb-4">
              <Bookmark size={28} className="text-[#5c35d9]" />
            </div>
            <h3 className="mb-1 font-semibold text-gray-900">Bookmarks</h3>
            <p className="text-sm leading-relaxed text-gray-500">View your saved lectures and notes</p>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
