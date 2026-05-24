"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { studentData } from "@/lib/student-mock-data";
import { motion, AnimatePresence } from "framer-motion";

interface BatchSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BatchSwitcher({ isOpen, onClose }: BatchSwitcherProps) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onClose}
          />

          {/* Modal — slides down from top */}
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-[72px] left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <h2 className="font-bold text-gray-900">Switch Batch</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Select a batch to study</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Batch List */}
              <div className="p-4 flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
                {studentData.enrolledBatches.map((batch, idx) => (
                  <button
                    key={batch.id}
                    onClick={onClose}
                    className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-[#5c35d9] hover:bg-purple-50 transition-all text-left group"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      <Image
                        src={batch.image}
                        alt={batch.title}
                        width={64}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {batch.title}
                      </p>
                      <p className="text-xs text-gray-400">{batch.subtitle}</p>
                    </div>

                    {/* Status */}
                    <div className="shrink-0">
                      {idx === 0 ? (
                        <span className="flex items-center gap-1 text-[#5c35d9] text-xs font-semibold">
                          <CheckCircle size={14} />
                          Active
                        </span>
                      ) : batch.status === "active" ? (
                        <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                          <CheckCircle size={14} />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
                          <AlertCircle size={14} />
                          Expired
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-center text-gray-400">
                  Want more batches?{" "}
                  <a href="/batches" className="text-[#5c35d9] font-medium hover:underline">
                    Browse all batches
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
