"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DiscountBanner() {
  const [dismissed, setDismissed] = useState(false);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.25 }}
          className="relative bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 text-gray-900 py-2.5 px-4"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm font-semibold text-center flex-1">
              🎖{" "}
              <span className="font-bold">Special discounts available:</span>{" "}
              50% for Army &nbsp;|&nbsp; 50% Differently Abled &nbsp;|&nbsp; ₹5000 flat for
              Single Parents &nbsp;&nbsp;
              <a
                href="#special-offers"
                className="underline font-bold hover:text-[#1a237e] transition-colors whitespace-nowrap"
              >
                → Know More
              </a>
            </p>
            <button
              onClick={() => setDismissed(true)}
              className="shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
              aria-label="Dismiss banner"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
