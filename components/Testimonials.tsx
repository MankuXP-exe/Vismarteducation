"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    id: "testimonial-1",
    avatar: "👩‍🎓",
    name: "Priya Sharma",
    class: "Class 12th Commerce, 2024",
    quote:
      "Vi Smart changed the way I study! The live classes are super interactive and the teachers explain every concept in such simple Hindi that I could understand accountancy easily. Passed with 91%! 🎉",
    rating: 5,
  },
  {
    id: "testimonial-2",
    avatar: "👨‍🎓",
    name: "Rahul Yadav",
    class: "Class 11th Science, 2024",
    quote:
      "Affordable fees, brilliant faculty, and 24×7 doubt support — what more do you need? I was scared of Physics but the recorded lectures helped me revise anytime. Vi Smart is the best!",
    rating: 5,
  },
  {
    id: "testimonial-3",
    avatar: "👩‍💼",
    name: "Anjali Meena",
    class: "Tally ERP9 + GST Course, 2024",
    quote:
      "I completed the Tally Prime and GST course from Vi Smart and got a job within 2 months. The practical approach of the teachers is amazing. Highly recommend to anyone in commerce!",
    rating: 5,
  },
  {
    id: "testimonial-4",
    avatar: "👨‍🏫",
    name: "Deepak Verma",
    class: "Class 12th Science, 2024",
    quote:
      "The 'Pass Nahi Toh Fees Nahi' guarantee gave me so much confidence to enroll. The study notes and PDFs were very helpful. I scored 88% in boards. Thank you Vi Smart! 🙏",
    rating: 5,
  },
  {
    id: "testimonial-5",
    avatar: "👧",
    name: "Sneha Gupta",
    class: "Class 10th, 2024",
    quote:
      "My daughter's results improved dramatically after joining Vi Smart. Teachers are patient, fees are very reasonable, and the location in Garhi Harsaru is very convenient for us.",
    rating: 5,
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const t = testimonials[current];

  return (
    <section
      id="testimonials"
      className="py-16 px-4 md:px-8 bg-white"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-[#5c35d9] font-semibold text-sm uppercase tracking-widest mb-2">
            Testimonials
          </p>
          <h2 className="section-heading">Students ❤️ Vi Smart</h2>
          <div className="section-divider" />
          <p className="section-subheading mt-3">
            Real stories from real students
          </p>
        </motion.div>

        {/* Quote card */}
        <div className="relative min-h-[280px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="w-full bg-gradient-to-br from-[#f0f4ff] to-white rounded-2xl shadow-lg border border-[#e0e8ff] p-8 md:p-10"
            >
              {/* Quote icon */}
              <div className="text-5xl text-[#5c35d9]/20 font-serif leading-none mb-4 select-none">
                &ldquo;
              </div>

              <p className="text-gray-700 text-base md:text-lg leading-relaxed italic font-medium">
                {t.quote}
              </p>

              {/* Stars */}
              <div className="flex gap-0.5 mt-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i} className="text-[#fdd835] text-lg">
                    ★
                  </span>
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center gap-4 mt-6 pt-4 border-t border-[#e0e8ff]">
                <div className="w-12 h-12 rounded-full bg-[#5c35d9]/10 flex items-center justify-center text-2xl">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500 font-medium">{t.class}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              id={`testimonial-dot-${i}`}
              onClick={() => setCurrent(i)}
              aria-label={`View testimonial ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-6 h-2.5 bg-[#5c35d9]"
                  : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
