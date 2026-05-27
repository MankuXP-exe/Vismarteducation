"use client";

import { motion } from "framer-motion";
import { CheckCircle, GraduationCap, Users, Award, BookOpen, Target, Heart, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const stats = [
  { icon: Users, label: "Students Enrolled", value: "10,000+" },
  { icon: GraduationCap, label: "Expert Teachers", value: "50+" },
  { icon: Award, label: "Years of Excellence", value: "Since 2023" },
  { icon: BookOpen, label: "Courses Offered", value: "25+" },
];

const values = [
  {
    icon: Target,
    title: "Our Mission",
    desc: "To provide affordable, high-quality education that empowers every student to achieve their dreams, regardless of their financial background.",
  },
  {
    icon: Heart,
    title: "Our Vision",
    desc: "To become Haryana's most trusted educational platform, known for academic excellence, innovation, and our 'Pass Nahi Toh Fees Nahi' guarantee.",
  },
  {
    icon: Shield,
    title: "Our Promise",
    desc: "Quality education at affordable fees with special concessions for Army families, single parents, and differently-abled students.",
  },
];

const team = [
  { name: "Kudan Kumar", role: "Main Head", desc: "Leading Vi Smart Learning Education with a vision to make quality education accessible to all." },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="relative py-24 px-4 overflow-hidden" style={{ background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)" }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 25% 50%, #fdd835 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto text-center relative z-10">
            <p className="text-[#fdd835] font-semibold text-sm uppercase tracking-widest mb-3">Since 2023</p>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              Haryana&apos;s Trusted &{" "}
              <span style={{ color: "#fdd835" }}>Affordable</span>{" "}
              Educational Platform
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Vi Smart Learning Education provides quality education for students of Class 5th to 12th, B.COM & BBA. Our expert teachers deliver live & recorded classes so every student can learn at their own pace — from anywhere.
            </p>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all">
                <s.icon size={32} className="mx-auto mb-3" style={{ color: "#5c35d9" }} />
                <p className="text-3xl font-extrabold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Mission / Vision / Promise */}
        <section className="py-20 px-4" style={{ background: "#f8f9ff" }}>
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What Drives Us</h2>
              <div className="mx-auto mt-3 w-14 h-1 rounded-full" style={{ background: "#fdd835" }} />
            </motion.div>
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((v, i) => (
                <motion.div key={v.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:-translate-y-1 transition-all">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{ background: "#fdd83520" }}>
                    <v.icon size={28} style={{ color: "#5c35d9" }} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{v.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Why Choose Vi Smart?</h2>
              <div className="mx-auto mt-3 w-14 h-1 rounded-full" style={{ background: "#fdd835" }} />
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                "Live & Recorded Classes by Expert Teachers",
                "Personalised Doubt Support 24×7",
                "Affordable Fees with Special Concessions",
                "CBSE & Commerce Board Preparation",
                "Pass Nahi Toh Fees Nahi Guarantee",
                "Free Study Material & Practice Tests",
              ].map((f, i) => (
                <motion.div key={f} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <CheckCircle size={20} className="mt-0.5 shrink-0" style={{ color: "#5c35d9" }} />
                  <span className="text-gray-700">{f}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 px-4" style={{ background: "#f8f9ff" }}>
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Meet Our Team</h2>
              <div className="mx-auto mt-3 w-14 h-1 rounded-full" style={{ background: "#fdd835" }} />
              <p className="text-gray-500 mt-3">Dedicated educators building the future of learning</p>
            </motion.div>
            <div className="flex justify-center">
              {team.map((m, i) => (
                <motion.div key={m.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                  className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100 hover:-translate-y-1 transition-all max-w-sm w-full">
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white" style={{ background: "#5c35d9" }}>
                    {m.name.charAt(0)}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{m.name}</h3>
                  <p className="text-sm font-semibold mt-1" style={{ color: "#5c35d9" }}>{m.role}</p>
                  <p className="text-sm text-gray-500 mt-2">{m.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 text-center" style={{ background: "linear-gradient(135deg, #1a237e, #283593)" }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Start Your Learning Journey Today</h2>
            <p className="text-white/70 mb-8 max-w-xl mx-auto">Join thousands of students who trust Vi Smart for their education.</p>
            <a href="/batches" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all hover:shadow-lg" style={{ background: "#fdd835", color: "#1a237e" }}>
              Explore Batches →
            </a>
          </motion.div>
        </section>
      </main>
      <Footer />
    </>
  );
}
