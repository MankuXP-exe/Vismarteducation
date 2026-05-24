"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const courses = [
  {
    id: "course-9-10",
    icon: "🎓",
    title: "Class 9th & 10th",
    subjects: ["Math", "Science", "English", "Social Science"],
    tag: "CBSE Board",
    tagColor: "bg-blue-50 text-blue-700 border-blue-200",
    accentColor: "#1a237e",
  },
  {
    id: "course-11-science",
    icon: "🎓",
    title: "Class 11th Science",
    subjects: ["Physics", "Chemistry", "Math", "Biology"],
    tag: "CBSE Board",
    tagColor: "bg-blue-50 text-blue-700 border-blue-200",
    accentColor: "#5c35d9",
  },
  {
    id: "course-11-commerce",
    icon: "🎓",
    title: "Class 11th Commerce",
    subjects: ["Accountancy", "Business Studies", "Economics", "Math"],
    tag: "CBSE Board",
    tagColor: "bg-blue-50 text-blue-700 border-blue-200",
    accentColor: "#1565c0",
  },
  {
    id: "course-12-science",
    icon: "🎓",
    title: "Class 12th Science",
    subjects: ["Physics", "Chemistry", "Math", "Biology"],
    tag: "CBSE Board",
    tagColor: "bg-blue-50 text-blue-700 border-blue-200",
    accentColor: "#5c35d9",
  },
  {
    id: "course-12-commerce",
    icon: "🎓",
    title: "Class 12th Commerce",
    subjects: ["Accountancy", "Business Studies", "Economics", "Math"],
    tag: "CBSE Board",
    tagColor: "bg-blue-50 text-blue-700 border-blue-200",
    accentColor: "#1a237e",
  },
  {
    id: "course-bcom-bba",
    icon: "💼",
    title: "B.COM & BBA",
    subjects: ["Tally ERP9", "GST", "Income Tax Return", "TDS"],
    extraTitle: "Accounting Courses",
    tag: "Professional",
    tagColor: "bg-purple-50 text-purple-700 border-purple-200",
    accentColor: "#c62828",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function CourseCategories() {
  return (
    <section id="courses" className="py-16 px-4 md:px-8 bg-white">
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
            What We Offer
          </p>
          <h2 className="section-heading">Courses We Offer</h2>
          <div className="section-divider" />
          <p className="section-subheading mt-3">
            Choose your class and start learning today
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {courses.map((course) => (
            <motion.div
              key={course.id}
              id={course.id}
              variants={cardVariants}
              className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-100"
              style={{ borderLeft: `4px solid ${course.accentColor}` }}
            >
              <div className="p-6 flex flex-col h-full">
                {/* Icon + Tag row */}
                <div className="flex items-start justify-between mb-3">
                  <span className="text-4xl">{course.icon}</span>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border ${course.tagColor}`}
                  >
                    {course.tag}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {course.title}
                </h3>
                {course.extraTitle && (
                  <p className="text-xs font-semibold text-[#c62828] mb-2 uppercase tracking-wide">
                    + {course.extraTitle}
                  </p>
                )}

                {/* Subjects */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {course.subjects.map((s) => (
                    <span
                      key={s}
                      className="text-xs bg-gray-50 text-gray-600 border border-gray-200 rounded-md px-2 py-0.5 font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-auto">
                  <a
                    href="#batches"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#5c35d9] group-hover:gap-2 transition-all duration-200"
                  >
                    Explore <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
