"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send, Loader2, CheckCircle, MessageSquare, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const contactInfo = [
  { icon: Phone, label: "Call Us", value: "+91 9821233879", href: "tel:9821233879" },
  { icon: Mail, label: "Email Us", value: "info@vismartlearningeducation.com", href: "mailto:info@vismartlearningeducation.com" },
  { icon: MapPin, label: "Address", value: "Garhi Harsaru, Gurugram, Haryana, India" },
  { icon: Clock, label: "Working Hours", value: "Mon - Sat: 8:00 AM - 8:00 PM" },
];

const faqs = [
  { q: "How do I enroll in a batch?", a: "Browse our batches page, select your course, and click 'Enroll Now'. Complete the payment via Razorpay and start learning immediately." },
  { q: "What is the 'Pass Nahi Toh Fees Nahi' guarantee?", a: "If you attend all classes and complete the course but don't pass, we refund your fees. Terms and conditions apply." },
  { q: "Do you offer fee concessions?", a: "Yes! We offer special discounts for Army families (50% off), Single Parents (₹5,000 flat), and Differently Abled students (50% off). Apply at our Concession page." },
  { q: "Are classes live or recorded?", a: "Both! We offer live interactive classes with expert teachers, plus recorded sessions you can watch anytime." },
  { q: "How do I contact support?", a: "Call us at +91 9821233879 or use the contact form on this page. We typically respond within 2 hours during working hours." },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    // Simulate send — in production, integrate with VPS email API or webhook
    await new Promise((r) => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: "", email: "", phone: "", message: "" });
  }

  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="relative py-24 px-4 overflow-hidden" style={{ background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)" }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 25% 50%, #fdd835 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              Get in <span style={{ color: "#fdd835" }}>Touch</span>
            </h1>
            <p className="text-lg text-white/80 max-w-xl mx-auto">
              Have a question? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
            </p>
          </motion.div>
        </section>

        {/* Contact Cards + Form */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Left: Contact Info */}
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <div className="space-y-4">
                  {contactInfo.map((c) => (
                    <div key={c.label} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#fdd83520" }}>
                        <c.icon size={22} style={{ color: "#5c35d9" }} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{c.label}</p>
                        {c.href ? (
                          <a href={c.href} className="font-semibold text-gray-900 hover:text-[#5c35d9] transition-colors">{c.value}</a>
                        ) : (
                          <p className="font-semibold text-gray-900">{c.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>


              </motion.div>

              {/* Right: Form */}
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#5c35d9] focus:ring-2 focus:ring-[#5c35d9]/20 outline-none transition-all" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#5c35d9] focus:ring-2 focus:ring-[#5c35d9]/20 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#5c35d9] focus:ring-2 focus:ring-[#5c35d9]/20 outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                    <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#5c35d9] focus:ring-2 focus:ring-[#5c35d9]/20 outline-none transition-all resize-none" />
                  </div>
                  <button type="submit" disabled={sending}
                    className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base text-white transition-all hover:shadow-lg disabled:opacity-70"
                    style={{ background: "#5c35d9" }}>
                    {sending ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : sent ? <><CheckCircle size={18} /> Sent!</> : <><Send size={18} /> Send Message</>}
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-4" style={{ background: "#f8f9ff" }}>
          <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
              <div className="mx-auto mt-3 w-14 h-1 rounded-full" style={{ background: "#fdd835" }} />
            </motion.div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details key={i} className="group bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
                    {faq.q}
                    <ChevronRight size={18} className="text-gray-400 group-open:rotate-90 transition-transform shrink-0" />
                  </summary>
                  <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 text-center" style={{ background: "linear-gradient(135deg, #1a237e, #283593)" }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Prefer to talk?</h2>
            <p className="text-white/70 mb-6">Call us directly and speak with our admissions team.</p>
            <a href="tel:9821233879" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base" style={{ background: "#fdd835", color: "#1a237e" }}>
              <Phone size={18} /> Call +91 9821233879
            </a>
          </motion.div>
        </section>
      </main>
      <Footer />
    </>
  );
}
