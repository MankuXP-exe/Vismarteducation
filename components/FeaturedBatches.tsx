"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const batches = [
  {
    id: "batch-11",
    preview: "/images/preview-class11th-batch.png",
    name: "Class 11th Complete Batch",
    teacher: "Expert Faculty — Vi Smart",
    subjects: "Accountancy, Business Studies, Economics, Math / English",
    price: "₹5,000",
    originalPrice: "₹10,000",
    year: "/year",
    offers: ["50% Army", "50% Differently Abled", "Single Parent ₹5000 flat"],
    ribbon: "Pass Nahi Toh Fees Nahi",
  },
  {
    id: "batch-12",
    preview: "/images/preview-class12th-batch.png",
    name: "Class 12th Complete Batch",
    teacher: "Expert Faculty — Vi Smart",
    subjects: "Accountancy, Business Studies, Economics, Math / English",
    price: "₹5,000",
    originalPrice: "₹10,000",
    year: "/year",
    offers: ["50% Army", "50% Differently Abled", "Single Parent ₹5000 flat"],
    ribbon: "Pass Nahi Toh Fees Nahi",
  },
  {
    id: "batch-12-accountancy",
    preview: "/images/preview-class12th-batch-Accountancy.png",
    name: "Class 12th Accountancy Batch",
    teacher: "Expert Faculty — Vi Smart",
    subjects: "Accountancy, Business Studies, Economics, Math",
    price: "₹5,000",
    originalPrice: "₹10,000",
    year: "/year",
    offers: ["50% Army", "50% Differently Abled", "Single Parent ₹5000 flat"],
    ribbon: "Pass Nahi Toh Fees Nahi",
  },
];

export default function FeaturedBatches() {
  return (
    <section
      id="batches"
      className="py-16 px-4 md:px-8"
      style={{ background: "#f5f5f5" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-[#5c35d9] font-semibold text-sm uppercase tracking-widest mb-2">
            Featured
          </p>
          <h2 className="section-heading">Our Popular Batches</h2>
          <div className="section-divider" />
          <p className="section-subheading mt-3">
            Join a batch and start your journey today
          </p>
        </motion.div>

        {/* Cards — horizontal scroll on mobile, 3-col on desktop */}
        <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 lg:grid lg:grid-cols-3">
          {batches.map((batch, i) => (
            <motion.div
              key={batch.id}
              id={batch.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="ribbon min-w-[300px] lg:min-w-0 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col border border-gray-100"
              data-text={batch.ribbon}
            >
              {/* Preview Image */}
              <div className="relative h-44 w-full overflow-hidden bg-gray-100">
                <Image
                  src={batch.preview}
                  alt={batch.name}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 300px, 33vw"
                />
              </div>

              <div className="p-5 flex flex-col flex-1 gap-3">
                {/* Batch name */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-snug">
                    {batch.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{batch.teacher}</p>
                </div>

                {/* Subjects */}
                <p className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                  📘 {batch.subjects}
                </p>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold text-[#5c35d9]">
                    {batch.price}
                  </span>
                  <span className="text-sm text-gray-400 font-medium">
                    {batch.year}
                  </span>
                  <span className="text-sm text-gray-400 line-through ml-1">
                    {batch.originalPrice}
                  </span>
                  <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full ml-auto">
                    50% OFF
                  </span>
                </div>

                {/* Offer chips */}
                <div className="flex flex-wrap gap-1.5">
                  {batch.offers.map((offer) => (
                    <span
                      key={offer}
                      className="text-xs font-semibold bg-[#fff8e1] text-[#b45309] border border-[#fdd835]/60 rounded-full px-2.5 py-0.5"
                    >
                      🎁 {offer}
                    </span>
                  ))}
                </div>

                {/* Pass Nahi Toh Fees Nahi */}
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <span className="text-sm">🎯</span>
                  <span className="text-xs font-bold text-[#c62828]">
                    Pass Nahi Toh Fees Nahi
                  </span>
                </div>

                {/* CTA */}
                <a
                  href="#contact"
                  id={`enroll-${batch.id}`}
                  className="btn-primary justify-center text-center mt-auto"
                >
                  Enroll Now <ArrowRight size={15} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
