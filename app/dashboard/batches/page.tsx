"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Star, CheckCircle, AlertCircle, Package } from "lucide-react";
import { studentData } from "@/lib/student-mock-data";
import { motion } from "framer-motion";

export default function BatchesPage() {
  const [priceTab, setPriceTab] = useState<"paid" | "free">("paid");
  const [statusTab, setStatusTab] = useState<"all" | "expired">("all");
  const router = useRouter();

  const filtered = studentData.enrolledBatches.filter((b) => {
    if (statusTab === "expired") return b.status === "expired";
    return true;
  });

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
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
          id="back-btn-batches"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <span className="flex items-center gap-1.5 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
          <Star size={14} className="fill-purple-500 text-purple-500" />
          {studentData.xp} XP
        </span>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-5">My Batches</h1>

      {/* Price Toggle Tabs (Paid / Free) */}
      <div className="flex gap-2 mb-5">
        {(["paid", "free"] as const).map((tab) => (
          <button
            key={tab}
            id={`tab-${tab}`}
            onClick={() => setPriceTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
              priceTab === tab
                ? "bg-white shadow text-gray-900"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Status Sub-Tabs (All / Expired) */}
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        {(["all", "expired"] as const).map((tab) => (
          <button
            key={tab}
            id={`subtab-${tab}`}
            onClick={() => setStatusTab(tab)}
            className={`pb-2.5 text-sm font-medium capitalize transition-all border-b-2 ${
              statusTab === tab
                ? "border-[#5c35d9] text-[#5c35d9]"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Batch Cards Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package size={48} className="mx-auto mb-4 opacity-40" />
          <p className="font-medium">No batches found</p>
          <p className="text-sm mt-1">
            {statusTab === "expired"
              ? "You have no expired batches."
              : "You have not enrolled in any batches yet."}
          </p>
          {statusTab === "all" && (
            <Link
              href="/batches"
              className="inline-block mt-4 px-5 py-2 bg-[#5c35d9] text-white rounded-lg text-sm font-medium hover:bg-[#4a28b8] transition-colors"
            >
              Browse Batches
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((batch) => {
            const isExpired = batch.status === "expired";
            return (
              <motion.div
                key={batch.id}
                whileHover={{ boxShadow: "0 8px 30px rgba(0,0,0,0.10)" }}
                transition={{ duration: 0.15 }}
                className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100"
              >
                {/* Title Row */}
                <div className="flex items-start justify-between gap-2 mb-3 px-1">
                  <h3 className="font-semibold text-sm text-gray-900 leading-tight flex-1">
                    {batch.title}
                  </h3>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      NEW
                    </span>
                    <button
                      aria-label="Notifications"
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Bell size={14} />
                    </button>
                  </div>
                </div>

                {/* Thumbnail */}
                <div
                  className={`relative w-full aspect-video rounded-xl overflow-hidden mb-3 bg-gray-100 ${
                    isExpired ? "opacity-60 grayscale" : ""
                  }`}
                >
                  <Image
                    src={batch.image}
                    alt={batch.title}
                    fill
                    className="object-cover"
                  />
                  {/* Language chip */}
                  <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                    {batch.language}
                  </span>
                </div>

                {/* Status */}
                <div className="flex items-center gap-1.5 px-1 mb-3">
                  {isExpired ? (
                    <>
                      <AlertCircle size={14} className="text-red-500" />
                      <span className="text-red-500 text-xs font-medium">Batch Expired</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} className="text-green-500" />
                      <span className="text-green-600 text-xs font-medium">Active</span>
                      <span className="text-gray-300 mx-1">·</span>
                      <span className="text-gray-400 text-xs">
                        Expires {new Date(batch.expiresOn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </>
                  )}
                </div>

                {/* Action Button */}
                {isExpired ? (
                  <Link
                    href="/batches"
                    className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                  >
                    View Similar
                  </Link>
                ) : (
                  <Link
                    href={`/dashboard/batches/${batch.id}`}
                    className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold bg-[#5c35d9] text-white hover:bg-[#4a28b8] transition-colors"
                  >
                    Go to Batch
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}


