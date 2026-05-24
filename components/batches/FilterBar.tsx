"use client";

import { motion } from "framer-motion";
import { ArrowUpDown } from "lucide-react";
import { categories } from "@/lib/batches-data";

type SortOption = "newest" | "price-asc" | "price-desc";

interface FilterBarProps {
  activeCategory: string;
  activeSort: SortOption;
  onCategoryChange: (cat: string) => void;
  onSortChange: (sort: SortOption) => void;
}

export default function FilterBar({
  activeCategory,
  activeSort,
  onCategoryChange,
  onSortChange,
}: FilterBarProps) {
  return (
    <div
      className="sticky top-[80px] md:top-[90px] z-40 bg-white border-b border-gray-200"
      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
    >
      {/* Pills row — full width, scrollable */}
      <div className="max-w-7xl mx-auto px-3 md:px-8 pt-2.5 pb-0">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.value}
              id={`filter-${cat.value}`}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onCategoryChange(cat.value)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 border-2 ${
                activeCategory === cat.value
                  ? "bg-[#5c35d9] text-white border-[#5c35d9] shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#5c35d9] hover:text-[#5c35d9]"
              }`}
              style={{ minHeight: "36px" }}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Sort row — shown below pills on mobile, inline on md+ */}
      <div className="max-w-7xl mx-auto px-3 md:px-8 py-2 flex items-center justify-between gap-3">
        <span className="text-xs text-gray-400 hidden sm:block">
          {/* Spacer on desktop — pills take full width via the row above */}
        </span>
        <div className="flex items-center gap-1.5 ml-auto">
          <ArrowUpDown size={13} className="text-gray-400 shrink-0" />
          <select
            id="sort-select"
            value={activeSort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="text-xs sm:text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl px-2.5 py-1.5 cursor-pointer hover:border-[#5c35d9] transition-colors outline-none appearance-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 6px center",
              paddingRight: "22px",
            }}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
          </select>
        </div>
      </div>
    </div>
  );
}
