"use client";

import { motion } from "framer-motion";

const reasons = [
  {
    id: "why-live",
    icon: "📡",
    title: "Live Interactive Classes",
    desc: "Attend real-time classes with your teachers. Ask questions, get answers instantly.",
  },
  {
    id: "why-recorded",
    icon: "🎥",
    title: "Recorded Lectures",
    desc: "Miss a class? Watch at your pace — anytime, anywhere, as many times as needed.",
  },
  {
    id: "why-notes",
    icon: "📖",
    title: "Study Notes & PDFs",
    desc: "Comprehensive notes and PDFs for every topic, prepared by our expert teachers.",
  },
  {
    id: "why-doubt",
    icon: "❓",
    title: "24×7 Doubt Support",
    desc: "Got stuck at midnight? Our support is always open. No question goes unanswered.",
  },
  {
    id: "why-affordable",
    icon: "💰",
    title: "Most Affordable Fees",
    desc: "Quality education at prices that won't burden your family. Special concessions available.",
  },
  {
    id: "why-guarantee",
    icon: "🎯",
    title: "Pass Guarantee or Refund",
    desc: "Pass Nahi Toh Fees Nahi — if you don't pass your exams, we refund your fees. That's our promise.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="py-16 px-4 md:px-8 bg-white">
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
            Our Edge
          </p>
          <h2 className="section-heading">Why Choose Vi Smart?</h2>
          <div className="section-divider" />
          <p className="section-subheading mt-3">
            Everything you need to succeed — all in one place
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {reasons.map((r) => (
            <motion.div
              key={r.id}
              id={r.id}
              variants={cardVariants}
              className="group bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 p-6 border border-gray-100 flex flex-col gap-4"
            >
              {/* Icon bubble */}
              <div className="w-14 h-14 rounded-2xl bg-[#5c35d9]/10 flex items-center justify-center text-3xl group-hover:bg-[#5c35d9]/20 transition-colors duration-300">
                {r.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {r.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{r.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
