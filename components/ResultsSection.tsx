"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const tabs = ["Class 10th", "Class 12th", "Commerce", "Science"];

const resultsData: Record<
  string,
  { id: string; name: string; score: string; school: string; icon: string }[]
> = {
  "Class 10th": [
    { id: "r10-1", name: "Ananya Singh", score: "95.4%", school: "CBSE Board, 2024", icon: "🥇" },
    { id: "r10-2", name: "Rohan Gupta", score: "92.8%", school: "CBSE Board, 2024", icon: "🥈" },
    { id: "r10-3", name: "Kavya Sharma", score: "91.2%", school: "CBSE Board, 2024", icon: "🥉" },
    { id: "r10-4", name: "Arjun Meena", score: "89.6%", school: "CBSE Board, 2024", icon: "⭐" },
    { id: "r10-5", name: "Pooja Yadav", score: "88.0%", school: "CBSE Board, 2024", icon: "⭐" },
    { id: "r10-6", name: "Nikhil Verma", score: "86.4%", school: "CBSE Board, 2024", icon: "⭐" },
  ],
  "Class 12th": [
    { id: "r12-1", name: "Sneha Kapoor", score: "94.0%", school: "CBSE Board, 2024", icon: "🥇" },
    { id: "r12-2", name: "Rahul Kumar", score: "91.5%", school: "CBSE Board, 2024", icon: "🥈" },
    { id: "r12-3", name: "Priya Malhotra", score: "90.0%", school: "CBSE Board, 2024", icon: "🥉" },
    { id: "r12-4", name: "Amit Rana", score: "88.2%", school: "CBSE Board, 2024", icon: "⭐" },
    { id: "r12-5", name: "Ritika Joshi", score: "86.5%", school: "CBSE Board, 2024", icon: "⭐" },
    { id: "r12-6", name: "Saurabh Tomar", score: "84.8%", school: "CBSE Board, 2024", icon: "⭐" },
  ],
  Commerce: [
    { id: "rc-1", name: "Muskan Agarwal", score: "96.2%", school: "Accountancy — CBSE 2024", icon: "🥇" },
    { id: "rc-2", name: "Divya Bansal", score: "93.6%", school: "Business Studies — CBSE 2024", icon: "🥈" },
    { id: "rc-3", name: "Karan Mittal", score: "91.0%", school: "Economics — CBSE 2024", icon: "🥉" },
    { id: "rc-4", name: "Anjali Sharma", score: "89.4%", school: "Accountancy — CBSE 2024", icon: "⭐" },
    { id: "rc-5", name: "Vikram Rathi", score: "87.8%", school: "B.COM — University 2024", icon: "⭐" },
    { id: "rc-6", name: "Simran Kaur", score: "85.0%", school: "BBA — University 2024", icon: "⭐" },
  ],
  Science: [
    { id: "rs-1", name: "Harsh Bhatia", score: "97.0%", school: "Physics — CBSE 2024", icon: "🥇" },
    { id: "rs-2", name: "Tanvi Singh", score: "94.5%", school: "Chemistry — CBSE 2024", icon: "🥈" },
    { id: "rs-3", name: "Mohit Kumar", score: "92.0%", school: "Math — CBSE 2024", icon: "🥉" },
    { id: "rs-4", name: "Riya Sharma", score: "90.5%", school: "Biology — CBSE 2024", icon: "⭐" },
    { id: "rs-5", name: "Aditya Pal", score: "88.0%", school: "Physics — CBSE 2024", icon: "⭐" },
    { id: "rs-6", name: "Pankaj Rawat", score: "86.0%", school: "Chemistry — CBSE 2024", icon: "⭐" },
  ],
};

export default function ResultsSection() {
  const [active, setActive] = useState("Class 10th");

  return (
    <section
      id="results"
      className="py-16 px-4 md:px-8"
      style={{ background: "#f0f4ff" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-[#5c35d9] font-semibold text-sm uppercase tracking-widest mb-2">
            Achievements
          </p>
          <h2 className="section-heading">Academic Excellence: Results</h2>
          <div className="section-divider" />
          <p className="section-subheading mt-3">
            Our students achieve their dreams — every single year
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              id={`results-tab-${tab.replace(/\s/g, "-").toLowerCase()}`}
              onClick={() => setActive(tab)}
              className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                active === tab
                  ? "bg-[#5c35d9] text-white border-[#5c35d9] shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#5c35d9] hover:text-[#5c35d9]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Results grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {resultsData[active].map((result, i) => (
              <motion.div
                key={result.id}
                id={result.id}
                initial={{ opacity: 0, scale: 0.93 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="text-3xl mb-2">{result.icon}</span>
                <p className="font-bold text-gray-900 text-sm leading-snug">
                  {result.name}
                </p>
                <p className="text-2xl font-black text-[#5c35d9] mt-1">
                  {result.score}
                </p>
                <p className="text-xs text-gray-500 mt-1">{result.school}</p>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
