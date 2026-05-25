"use client";

import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";

export default function CTABanner() {
  return (
    <section
      id="contact"
      className="py-20 px-4 md:px-8 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1a237e 0%, #283593 40%, #1565c0 100%)",
      }}
    >
      {/* Decorative circles */}
      <div
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #fdd835, transparent)" }}
      />
      <div
        className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #5c35d9, transparent)" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
        style={{ background: "radial-gradient(circle, white, transparent)" }}
      />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-6"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/80 font-medium backdrop-blur-sm">
            🎓 Garhi Harsaru, Gurugram | Est. 2023
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
            Join{" "}
            <span
              className="relative inline-block"
              style={{ color: "#fdd835" }}
            >
              Vi Smart
            </span>{" "}
            Learning Education Today
          </h2>

          {/* Sub */}
          <p className="text-white/80 text-base md:text-lg max-w-2xl leading-relaxed">
            Classes available for Class 5th to 12th, B.COM, BBA &amp;
            Accounting Courses. Expert faculty, live classes, and the{" "}
            <span className="text-[#fdd835] font-bold">
              Pass Nahi Toh Fees Nahi
            </span>{" "}
            guarantee.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <a
              href="/batches"
              id="cta-explore-batches"
              className="btn-yellow text-base px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-yellow-500/20"
            >
              Explore Batches <ArrowRight size={18} />
            </a>
            <a
              href="tel:9821233879"
              id="cta-call-us"
              className="btn-outline-white text-base px-8 py-3.5 rounded-xl font-bold"
            >
              <Phone size={18} />
              Call Us: 9821233879
            </a>
          </div>

          {/* Trust chips */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {[
              "✅ Affordable Fees",
              "🎯 Pass Guarantee",
              "📡 Live Classes",
              "🪖 Army Discount",
            ].map((chip) => (
              <span
                key={chip}
                className="text-xs text-white/80 bg-white/10 border border-white/20 rounded-full px-3 py-1 font-medium"
              >
                {chip}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
