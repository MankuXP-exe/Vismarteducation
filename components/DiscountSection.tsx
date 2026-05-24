"use client";

import { motion } from "framer-motion";

const discounts = [
  {
    id: "discount-army",
    icon: "🪖",
    title: "Indian Army Privilege",
    desc: "50% flat discount for students with an immediate family member serving in the Indian Army.",
    badge: "50% OFF",
    badgeColor: "bg-green-100 text-green-700",
    borderColor: "border-green-300",
  },
  {
    id: "discount-single-parent",
    icon: "👨‍👦",
    title: "Single Parent Support",
    desc: "Flat ₹5,000/year if the bread earner of the student's family is no more.",
    badge: "₹5,000 FLAT",
    badgeColor: "bg-blue-100 text-blue-700",
    borderColor: "border-blue-300",
  },
  {
    id: "discount-abled",
    icon: "♿",
    title: "Specially Abled Students",
    desc: "50% flat discount for physically handicapped students on all courses.",
    badge: "50% OFF",
    badgeColor: "bg-purple-100 text-purple-700",
    borderColor: "border-purple-300",
  },
];

export default function DiscountSection() {
  return (
    <section
      id="discounts"
      className="py-20 px-4 md:px-8"
      style={{ background: "#1a237e" }}
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
          <p className="text-[#fdd835]/70 font-semibold text-sm uppercase tracking-widest mb-2">
            Social Commitment
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold leading-tight"
            style={{ color: "#fdd835" }}
          >
            Special Fee Concessions
          </h2>
          <div
            className="mx-auto mt-3 w-14 h-1 rounded-full"
            style={{ background: "#fdd835" }}
          />
          <p className="text-white/70 mt-3 text-base">
            We believe education should be accessible to everyone.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {discounts.map((d, i) => (
            <motion.div
              key={d.id}
              id={d.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className={`bg-white rounded-2xl p-6 border-t-4 ${d.borderColor} shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4`}
            >
              <div className="flex items-start justify-between">
                <span className="text-4xl">{d.icon}</span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${d.badgeColor}`}
                >
                  {d.badge}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{d.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{d.desc}</p>
              <a
                href="#contact"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#5c35d9] hover:underline mt-auto"
              >
                Apply Now →
              </a>
            </motion.div>
          ))}
        </div>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div
            className="inline-block bg-[#fdd835]/10 border-2 border-[#fdd835]/40 rounded-2xl px-8 py-6"
          >
            <h3
              className="text-3xl md:text-5xl font-black tracking-tight"
              style={{ color: "#fdd835" }}
            >
              Pass Nahi Toh Fees Nahi
            </h3>
            <p className="text-white/80 mt-2 text-base md:text-lg font-medium">
              If you don&apos;t pass, you don&apos;t pay. Simple.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
