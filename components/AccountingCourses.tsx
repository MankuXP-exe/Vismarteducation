"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const leftCourses = [
  "Basic Computer",
  "DCA, ADCA",
  "Journal Entry & Adv Complex Entry",
  "Tally Prime ERP9",
  "GST Filing (Return, Registration)",
];

const rightCourses = [
  "Income Tax Return",
  "TDS, TCS",
  "Accounting Balance Sheet Finalization",
  "Analysing of Financial Statements",
  "Advanced Accounting",
];

export default function AccountingCourses() {
  return (
    <section
      id="accounting"
      className="py-16 px-4 md:px-8 bg-white"
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
            Professional Courses
          </p>
          <h2 className="section-heading">Accounting &amp; Computer Courses</h2>
          <div className="section-divider" />
          <p className="section-subheading mt-3">
            Industry-ready skills for your career
          </p>
        </motion.div>

        {/* Course list card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-[#f0f4ff] to-white rounded-2xl shadow-md border border-[#e8eeff] overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#e0e8ff]">
            {/* Left Column */}
            <div className="p-8">
              <h3 className="text-sm font-bold text-[#1a237e] uppercase tracking-widest mb-5 flex items-center gap-2">
                <span className="w-6 h-0.5 bg-[#5c35d9] rounded-full inline-block" />
                Core Courses
              </h3>
              <ul className="flex flex-col gap-3">
                {leftCourses.map((course, i) => (
                  <motion.li
                    key={course}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="flex items-center gap-3 group cursor-default py-2 px-3 rounded-lg hover:bg-[#5c35d9]/5 transition-colors duration-200"
                  >
                    <ArrowRight
                      size={16}
                      className="text-[#5c35d9] shrink-0 group-hover:translate-x-1 transition-transform"
                    />
                    <span className="text-gray-700 text-sm md:text-base font-medium">
                      {course}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Right Column */}
            <div className="p-8">
              <h3 className="text-sm font-bold text-[#1a237e] uppercase tracking-widest mb-5 flex items-center gap-2">
                <span className="w-6 h-0.5 bg-[#c62828] rounded-full inline-block" />
                Advanced Courses
              </h3>
              <ul className="flex flex-col gap-3">
                {rightCourses.map((course, i) => (
                  <motion.li
                    key={course}
                    initial={{ opacity: 0, x: 15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="flex items-center gap-3 group cursor-default py-2 px-3 rounded-lg hover:bg-[#c62828]/5 transition-colors duration-200"
                  >
                    <ArrowRight
                      size={16}
                      className="text-[#c62828] shrink-0 group-hover:translate-x-1 transition-transform"
                    />
                    <span className="text-gray-700 text-sm md:text-base font-medium">
                      {course}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA bar */}
          <div
            className="px-8 py-5 border-t border-[#e0e8ff] flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ background: "rgba(92,53,217,0.04)" }}
          >
            <p className="text-sm text-gray-600 font-medium">
              🎓 Start your professional accounting journey today
            </p>
            <a href="#contact" id="view-all-courses-btn" className="btn-primary shrink-0">
              View All Courses <ArrowRight size={15} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
