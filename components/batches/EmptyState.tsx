"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface EmptyStateProps {
  onReset: () => void;
}

export default function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="col-span-full flex flex-col items-center justify-center py-20 text-center"
    >
      {/* SVG Illustration */}
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-6 opacity-60"
      >
        <rect x="20" y="30" width="80" height="12" rx="6" fill="#e0e7ff" />
        <rect x="20" y="50" width="80" height="12" rx="6" fill="#c7d2fe" />
        <rect x="20" y="70" width="80" height="12" rx="6" fill="#a5b4fc" />
        <rect x="10" y="25" width="8" height="65" rx="4" fill="#818cf8" />
        <rect x="102" y="25" width="8" height="65" rx="4" fill="#818cf8" />
        <circle cx="60" cy="95" r="18" fill="#f0f4ff" stroke="#c7d2fe" strokeWidth="2" />
        <path
          d="M54 95l4 4 8-8"
          stroke="#6366f1"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="85" cy="35" r="12" fill="#fee2e2" />
        <path
          d="M81 35h8M85 31v8"
          stroke="#ef4444"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <h3 className="text-xl font-bold text-gray-800 mb-2">
        No batches found in this category
      </h3>
      <p className="text-gray-500 mb-2 max-w-sm">
        Try a different filter or call us — we might have a batch coming up soon!
      </p>
      <a
        href="tel:9821233879"
        className="text-[#5c35d9] font-semibold mb-6 hover:underline"
      >
        📞 Call us: 9821233879
      </a>

      <button
        onClick={onReset}
        id="browse-all-batches-btn"
        className="btn-primary px-8 py-3"
      >
        Browse All Batches
      </button>
    </motion.div>
  );
}
