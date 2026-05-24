"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, HelpCircle, CheckCircle, Clock } from "lucide-react";
import { studentData } from "@/lib/student-mock-data";
import { motion } from "framer-motion";

type Filter = "all" | "pending" | "resolved";

export default function DoubtsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const { doubts } = studentData;

  const filtered = doubts.filter((d) => {
    if (filter === "pending") return d.status === "pending";
    if (filter === "resolved") return d.status === "resolved";
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          id="back-btn-doubts"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-5">My Doubts</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "pending", "resolved"] as const).map((f) => (
          <button
            key={f}
            id={`filter-${f}`}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
              filter === f
                ? "bg-[#5c35d9] text-white"
                : "bg-white border border-gray-200 text-gray-500 hover:border-[#5c35d9] hover:text-[#5c35d9]"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <HelpCircle size={56} className="mb-4 opacity-30" />
          <p className="font-semibold text-lg text-gray-600 mb-1">
            {doubts.length === 0 ? "No doubts asked yet" : "No doubts in this category"}
          </p>
          <p className="text-sm text-center max-w-xs">
            Ask doubts directly from lecture videos
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((doubt) => (
            <div
              key={doubt.id}
              className="bg-white border border-gray-100 rounded-2xl p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    ❓ Doubt about: {doubt.lectureTitle}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {doubt.subject} · {doubt.chapter} · Batch: {doubt.batchId}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Asked: {new Date(doubt.askedOn).toLocaleDateString("en-IN")}
                  </p>
                </div>

                {/* Status Badge */}
                {doubt.status === "resolved" ? (
                  <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0">
                    <CheckCircle size={12} />
                    Resolved
                  </span>
                ) : (
                  <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0">
                    <Clock size={12} />
                    Pending
                  </span>
                )}
              </div>

              {/* Doubt text */}
              <div className="bg-gray-50 rounded-xl px-4 py-3 mb-3">
                <p className="text-sm text-gray-600 leading-relaxed">{doubt.question}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/batches/${doubt.batchId}`}
                  className="text-xs font-medium text-[#5c35d9] border border-[#5c35d9]/30 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  View Lecture
                </Link>
                {doubt.status === "resolved" && (
                  <button className="text-xs font-medium text-green-600 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors">
                    See Answer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
