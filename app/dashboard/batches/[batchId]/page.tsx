"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Star,
  FileText,
  X,
  Download,
  Info,
} from "lucide-react";
import { subjectsData, batchResources, studentData } from "@/lib/student-mock-data";
import { motion } from "framer-motion";

// Abbreviation color map
const abbrColors: Record<string, { bg: string; text: string }> = {
  Ac: { bg: "#dbeafe", text: "#1d4ed8" },
  Bu: { bg: "#fce7f3", text: "#be185d" },
  Ec: { bg: "#d1fae5", text: "#065f46" },
  Ma: { bg: "#ede9fe", text: "#5b21b6" },
  En: { bg: "#fef3c7", text: "#92400e" },
  Ph: { bg: "#e0f2fe", text: "#0369a1" },
  Ch: { bg: "#fef9c3", text: "#713f12" },
  Bi: { bg: "#dcfce7", text: "#15803d" },
  SS: { bg: "#ffedd5", text: "#9a3412" },
  Sc: { bg: "#e0f2fe", text: "#0c4a6e" },
};

export default function BatchDetailPage() {
  const params = useParams<{ batchId: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"subjects" | "resources">("subjects");
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const batchId = params.batchId;
  const subjects = subjectsData[batchId] ?? [];
  const batch = studentData.enrolledBatches.find((b) => b.id === batchId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          id="back-btn-batch-detail"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          <span>All Classes</span>
        </button>
        <span className="flex items-center gap-1.5 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
          <Star size={14} className="fill-purple-500 text-purple-500" />
          {studentData.xp} XP
        </span>
      </div>

      {/* Batch Title */}
      {batch && (
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900">{batch.title}</h1>
          <p className="text-sm text-gray-400 mt-1">{batch.subtitle}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        {(["subjects", "resources"] as const).map((tab) => (
          <button
            key={tab}
            id={`tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`pb-2.5 text-sm font-medium capitalize transition-all border-b-2 ${
              activeTab === tab
                ? "border-[#5c35d9] text-[#5c35d9]"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Info Banner */}
      {!bannerDismissed && activeTab === "subjects" && (
        <div className="flex items-center gap-3 bg-gray-800 text-white rounded-xl px-4 py-3 mb-6 text-sm">
          <Info size={16} className="text-blue-400 shrink-0" />
          <p className="flex-1 text-white/80">
            Completion % depends on lecture and DPP progress!
          </p>
          <button
            onClick={() => setBannerDismissed(true)}
            className="text-white/50 hover:text-white transition-colors shrink-0"
            aria-label="Dismiss info banner"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Subjects Tab */}
      {activeTab === "subjects" && (
        <>
          {subjects.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p>No subjects found for this batch.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {subjects.map((sub) => {
                const color = abbrColors[sub.abbr] ?? { bg: "#f3f4f6", text: "#374151" };
                return (
                  <Link
                    key={sub.id}
                    href={`/dashboard/batches/${batchId}/${sub.id}`}
                    id={`subject-${sub.id}`}
                    className="group flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-4 hover:border-purple-300 hover:bg-purple-50 transition-all duration-150 relative overflow-hidden"
                  >
                    {/* Abbr circle */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ background: color.bg, color: color.text }}
                    >
                      {sub.abbr}
                    </div>

                    {/* Subject info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-800 truncate">
                        {sub.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {sub.completion}% complete
                      </p>
                    </div>

                    <ChevronRight size={16} className="text-gray-300 group-hover:text-[#5c35d9] transition-colors shrink-0" />

                    {/* Completion bar at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100">
                      <div
                        className="h-full bg-[#5c35d9] transition-all duration-500"
                        style={{ width: `${sub.completion}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Resources Tab */}
      {activeTab === "resources" && (
        <div className="flex flex-col gap-3">
          {batchResources.map((res) => (
            <div
              key={res.id}
              className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl px-5 py-4"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <FileText size={20} className="text-blue-500" />
              </div>
              <span className="flex-1 text-sm font-medium text-gray-800">{res.name}</span>
              <a
                href={res.fileUrl}
                className="flex items-center gap-1.5 text-sm font-semibold text-[#5c35d9] hover:underline"
              >
                <Download size={14} />
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
