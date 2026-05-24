"use client";

import { motion, AnimatePresence } from "framer-motion";
import BatchCard from "./BatchCard";
import type { Batch } from "@/lib/batches-data";

interface BatchGridProps {
  batches: Batch[];
}

export default function BatchGrid({ batches }: BatchGridProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={batches.map((b) => b.id).join("-")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {batches.map((batch, i) => (
          <BatchCard key={batch.id} batch={batch} index={i} />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
