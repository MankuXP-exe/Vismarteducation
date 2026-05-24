"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BatchSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BatchSwitcher({ isOpen, onClose }: BatchSwitcherProps) {
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-1/2 top-[72px] z-50 w-full max-w-lg -translate-x-1/2 px-4"
          >
            <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div>
                  <h2 className="font-bold text-gray-900">My batches</h2>
                  <p className="mt-0.5 text-xs text-gray-400">Open your enrolled batch list.</p>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
                  aria-label="Close batch switcher"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-5">
                <Link
                  href="/dashboard/batches"
                  onClick={onClose}
                  className="block rounded-lg bg-[#5c35d9] px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  View my batches
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
