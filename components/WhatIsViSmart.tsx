"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function WhatIsViSmart() {
  return (
    <section
      id="about"
      className="py-16 px-4 md:px-8"
      style={{ background: "#f0f4ff" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* LEFT — Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/whatisviclasses.png"
                alt="What is Vi Smart Learning Education"
                width={600}
                height={420}
                className="w-full h-auto object-cover"
              />
              {/* Decorative badge */}
              <div className="absolute bottom-4 right-4 bg-[#5c35d9] text-white rounded-xl px-4 py-3 shadow-lg">
                <p className="text-xs font-medium opacity-80">Established</p>
                <p className="text-lg font-bold leading-tight">Since 2023</p>
              </div>
            </div>
            {/* Decorative blob behind image */}
            <div
              className="absolute -z-10 -top-6 -left-6 w-40 h-40 rounded-full opacity-30"
              style={{ background: "radial-gradient(circle, #5c35d9, transparent)" }}
            />
          </motion.div>

          {/* RIGHT — Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-5"
          >
            <div>
              <p className="text-[#5c35d9] font-semibold text-sm uppercase tracking-widest mb-2">
                About Us
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Haryana&apos;s Trusted &amp;{" "}
                <span className="text-[#5c35d9]">Affordable</span>{" "}
                Educational Platform
              </h2>
              <div className="section-divider-left mt-3" />
            </div>

            <p className="text-gray-600 text-base md:text-lg leading-relaxed">
              Vi Smart Learning Education provides quality education for students
              of{" "}
              <strong className="text-gray-800">
                Class 5th to 12th, B.COM &amp; BBA
              </strong>
              . Our expert teachers deliver live &amp; recorded classes so every
              student can learn at their own pace — from anywhere.
            </p>

            {/* Feature bullets */}
            <ul className="flex flex-col gap-3">
              {[
                "Live &amp; Recorded Classes by Expert Teachers",
                "Personalised Doubt Support 24×7",
                "Affordable Fees with Special Concessions",
                "CBSE &amp; Commerce Board Preparation",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 w-5 h-5 rounded-full bg-[#5c35d9]/10 flex items-center justify-center shrink-0">
                    <span className="w-2 h-2 rounded-full bg-[#5c35d9]" />
                  </span>
                  <span
                    className="text-gray-700 text-sm md:text-base"
                    dangerouslySetInnerHTML={{ __html: item }}
                  />
                </li>
              ))}
            </ul>

            {/* Tagline chip */}
            <div className="inline-flex items-center gap-2 bg-[#c62828]/10 border border-[#c62828]/30 rounded-full px-4 py-2 self-start">
              <span className="text-[#c62828] font-bold text-sm">
                🎯 Pass Nahi Toh Fees Nahi
              </span>
            </div>

            <div>
              <a href="/batches" className="btn-primary inline-flex">
                Explore Batches <ArrowRight size={16} />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
