"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Users, Clock, Video, FileText, BookOpen } from "lucide-react";
import type { Batch } from "@/lib/batches-data";

interface BatchCardProps {
  batch: Batch;
  index: number;
}

const badgeStyles: Record<string, string> = {
  POPULAR: "bg-[#5c35d9] text-white",
  NEW: "bg-emerald-500 text-white",
  HOT: "bg-rose-500 text-white",
  LIVE: "bg-red-500 text-white",
};

const discountPercent = (price: number, original: number) =>
  Math.round(((original - price) / original) * 100);

export default function BatchCard({ batch, index }: BatchCardProps) {
  const savings = batch.originalPrice - batch.price;
  const discount = discountPercent(batch.price, batch.originalPrice);
  // Cap stagger delay so cards don't animate slowly on mobile
  const delay = Math.min(index * 0.06, 0.3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className="bg-white rounded-2xl overflow-hidden flex flex-col group"
      style={{
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        transition: "box-shadow 0.3s ease, transform 0.3s ease",
        WebkitTapHighlightColor: "transparent",
      }}
      whileHover={{ y: -4 }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 20px 50px rgba(92,53,217,0.18)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 4px 24px rgba(0,0,0,0.08)";
      }}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden h-44 sm:h-48 bg-gray-100 shrink-0">
        <Image
          src={batch.image}
          alt={batch.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* LIVE badge */}
        <span className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow">
          <span className="w-1.5 h-1.5 rounded-full bg-white live-dot" />
          LIVE
        </span>

        {/* Badge (NEW/POPULAR/HOT) */}
        {batch.badge && (
          <span
            className={`absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow ${
              badgeStyles[batch.badge] || "bg-gray-500 text-white"
            }`}
          >
            {batch.badge}
          </span>
        )}

        {/* Discount strip */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-14 flex items-end px-3 pb-2">
          <span className="text-[10px] text-white font-bold bg-red-500 px-2 py-0.5 rounded-full">
            {discount}% OFF
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4 gap-2.5">
        {/* Title */}
        <h3 className="font-bold text-base sm:text-lg text-gray-900 leading-snug group-hover:text-[#5c35d9] transition-colors">
          {batch.title}
        </h3>

        {/* Rating + Students */}
        <div className="flex items-center gap-2.5 text-xs sm:text-sm">
          <span className="flex items-center gap-1 text-amber-500 font-semibold">
            <Star size={12} fill="currentColor" />
            {batch.rating}
          </span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center gap-1 text-gray-500">
            <Users size={11} />
            {batch.students} students
          </span>
        </div>

        {/* Subjects */}
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
          <span className="font-semibold text-gray-400 uppercase tracking-wide text-[10px]">Subjects: </span>
          {batch.subjects.join(" · ")}
        </p>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-xs text-gray-500">
          <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
            <Clock size={10} /> {batch.duration}
          </span>
          <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
            <Video size={10} /> {batch.type.join(" + ")}
          </span>
          {batch.includes.includes("Notes") && (
            <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
              <BookOpen size={10} /> Notes
            </span>
          )}
          {batch.includes.includes("PDFs") && (
            <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
              <FileText size={10} /> PDFs
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Price */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xl sm:text-2xl font-extrabold text-emerald-600">
            ₹{batch.price.toLocaleString("en-IN")}
            <span className="text-xs font-semibold text-gray-400">/yr</span>
          </span>
          <span className="text-xs sm:text-sm text-gray-400 line-through">
            ₹{batch.originalPrice.toLocaleString("en-IN")}
          </span>
          <span className="ml-auto text-[10px] sm:text-xs text-emerald-600 font-semibold">
            Save ₹{savings.toLocaleString("en-IN")}
          </span>
        </div>

        {/* CTA — large tap target */}
        <Link
          href={`/batches/${batch.id}`}
          id={`enroll-${batch.id}`}
          className="block w-full text-center py-3 sm:py-3 bg-[#5c35d9] hover:bg-[#4a28b8] active:bg-[#3b1f99] text-white font-bold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-purple-200 text-sm sm:text-base"
          style={{ minHeight: "44px", lineHeight: "1.2" }}
        >
          Enroll Now
        </Link>

        {/* Guarantee */}
        <p className="text-center text-[11px] text-red-500 italic font-medium">
          "Pass Nahi Toh Fees Nahi"
        </p>
      </div>
    </motion.div>
  );
}
