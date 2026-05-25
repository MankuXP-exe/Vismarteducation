"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  Phone,
  MessageCircle,
  CheckCircle,
  Calendar,
  User,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchBatchBySlug } from "@/lib/batches-data";
import type { Batch } from "@/lib/batches-data";

/* ──────────────── TYPES ──────────────── */
type TabId = "overview" | "subjects" | "schedule" | "faculty" | "faq";

/* ──────────────── DUMMY DATA ──────────────── */
const dummyChapters: Record<string, string[]> = {
  Physics: ["Units & Measurements", "Kinematics", "Laws of Motion", "Work & Energy", "Thermodynamics", "Waves"],
  Chemistry: ["Atomic Structure", "Chemical Bonding", "Periodic Table", "Redox Reactions", "Equilibrium", "Organic Chemistry Basics"],
  Mathematics: ["Sets & Functions", "Trigonometry", "Coordinate Geometry", "Calculus Intro", "Statistics", "Probability"],
  Biology: ["Cell Biology", "Plant Physiology", "Human Physiology", "Genetics", "Evolution", "Ecology"],
  Accountancy: ["Journal Entries", "Ledger & Trial Balance", "Final Accounts", "Partnership Accounts", "Company Accounts", "Ratio Analysis"],
  "Business Studies": ["Nature of Business", "Forms of Organisation", "Management", "Marketing", "Finance", "Entrepreneurship"],
  Economics: ["Introduction to Economics", "Demand & Supply", "National Income", "Money & Banking", "Fiscal Policy", "International Trade"],
  Math: ["Real Numbers", "Polynomials", "Linear Equations", "Quadratics", "Arithmetic Progressions", "Trigonometry"],
  Science: ["Matter", "Force & Motion", "Electricity", "Light", "Life Processes", "Natural Resources"],
  English: ["Reading Comprehension", "Grammar", "Writing Skills", "Literature Prose", "Literature Poetry", "Debate & Speech"],
  "Social Science": ["History of India", "Geography", "Political Science", "Economics Basics", "Resources & Development", "Map Work"],
  "Tally Prime ERP9": ["Company Creation", "Inventory Management", "GST in Tally", "Banking in Tally", "Payroll", "MIS Reports"],
  "GST Filing": ["GST Basics", "Registration Process", "GSTR-1", "GSTR-3B", "Input Tax Credit", "Annual Return"],
  Registration: ["Business Registration Types", "ROC Filing", "PAN & TAN", "MSME Registration", "Trade Licence", "Digital Signature"],
  "Income Tax Return": ["Basic Concepts", "Computation of Income", "ITR-1 Filing", "ITR-4 Filing", "TDS Reconciliation", "Tax Planning"],
  TDS: ["TDS Provisions", "Section 194", "Form 16", "TDS Returns", "26AS Reconciliation", "Late Filing Penalties"],
  TCS: ["TCS Basics", "Applicable Sections", "TCS Collection", "TCS Returns", "Form 27D", "Practical Filing"],
  "Balance Sheet": ["Balance Sheet Structure", "Assets Classification", "Liabilities", "Capital & Reserves", "Schedule III", "Analysis"],
  "Basic Computer": ["Introduction to Computers", "Hardware & Software", "Windows OS", "File Management", "Keyboard Shortcuts", "Internet Basics"],
  "MS Office": ["MS Word Advanced", "MS Excel Formulas", "MS PowerPoint", "MS Access", "MS Outlook", "Mail Merge"],
  Internet: ["Web Browsing", "Email Management", "Cloud Storage", "Cybersecurity Basics", "Digital Payments", "Social Media"],
  DCA: ["Computer Fundamentals", "Operating Systems", "Office Applications", "Programming Basics", "Database Intro", "Project Work"],
  ADCA: ["Advanced Office", "Web Design Basics", "Accounting Software", "Tally Integration", "Programming with Python", "Final Project"],
};

const weekSchedule = [
  { day: "Mon", time: "6–8 PM", subject: "Core Subject 1" },
  { day: "Tue", time: "6–8 PM", subject: "Core Subject 2" },
  { day: "Wed", time: "6–8 PM", subject: "Core Subject 1" },
  { day: "Thu", time: "6–8 PM", subject: "Doubt Session" },
  { day: "Fri", time: "6–8 PM", subject: "Core Subject 2" },
  { day: "Sat", time: "10 AM–12 PM", subject: "Test / Revision" },
];

const faqs = [
  {
    q: "Is this batch live or recorded?",
    a: "This batch includes both live interactive classes and recorded lectures. You can attend live sessions and rewatch recordings anytime.",
  },
  {
    q: "What happens if I miss a live class?",
    a: "All live classes are recorded. You can watch the recording within 24 hours of the session through your student dashboard.",
  },
  {
    q: "Do you provide study material?",
    a: "Yes! We provide well-structured notes, PDFs, and practice questions for every topic covered.",
  },
  {
    q: "Is there a pass guarantee?",
    a: "Yes. Our 'Pass Nahi Toh Fees Nahi' guarantee means if you attend all classes and fail, we refund your fees.",
  },
  {
    q: "How can I enroll?",
    a: "Click the 'Enroll Now' button or call us at 9821233879. You can also WhatsApp us for instant assistance.",
  },
];

const tabs: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "subjects", label: "Subjects" },
  { id: "schedule", label: "Schedule" },
  { id: "faculty", label: "Faculty" },
  { id: "faq", label: "FAQ" },
];

/* ──────────────── ACCORDION ──────────────── */
function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-2.5">
      <button
        className="w-full flex items-center justify-between px-4 py-3.5 text-left font-semibold text-gray-800 hover:bg-[#f0f4ff] active:bg-[#e8eeff] transition-colors text-sm"
        onClick={() => setOpen(!open)}
        style={{ minHeight: "48px" }}
      >
        <span className="pr-2">{title}</span>
        {open ? (
          <ChevronUp size={16} className="text-[#5c35d9] shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-gray-400 shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 text-gray-600 text-sm">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────── TAB CONTENT ──────────────── */
function OverviewTab({ batch }: { batch: Batch }) {
  return (
    <div className="space-y-5">
      <div className="bg-[#f0f4ff] rounded-xl p-4 sm:p-6">
        <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-3">About This Batch</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-800 mb-1.5 text-sm">🎯 Who is this for?</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Designed for {batch.stream} stream students targeting board exams and competitive
              entrance tests, with expert faculty guidance.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-1.5 text-sm">📚 What will you learn?</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Full coverage of {batch.subjects.join(", ")} with chapter tests, mock exams, and
              doubt resolution.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
          <Calendar size={16} className="text-[#5c35d9]" /> Live Classes Schedule
        </h4>
        <div className="text-sm text-gray-600 bg-white border border-gray-100 rounded-xl p-4 leading-relaxed">
          📅 <strong>Mon / Wed / Fri</strong> — 6:00 PM to 8:00 PM (Live)<br />
          📅 <strong>Saturday</strong> — 10:00 AM to 12:00 PM (Revision / Test)
        </div>
      </div>

      <div>
        <h4 className="font-bold text-gray-900 mb-3 text-sm sm:text-base">✅ This Batch Includes</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            "Live Interactive Classes",
            "Recorded Lectures",
            "Study Notes & PDFs",
            "Weekly Tests",
            "24×7 Doubt Support",
            "Pass Guarantee",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 font-medium"
            >
              <CheckCircle size={15} className="text-emerald-500 shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SubjectsTab({ batch }: { batch: Batch }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">Tap any subject to see chapters covered.</p>
      {batch.subjects.map((subject, i) => (
        <AccordionItem key={subject} title={`📖 ${subject}`} defaultOpen={i === 0}>
          <ul className="space-y-1.5 mt-1">
            {(
              dummyChapters[subject] || [
                "Chapter 1",
                "Chapter 2",
                "Chapter 3",
                "Chapter 4",
                "Chapter 5",
              ]
            ).map((ch) => (
              <li key={ch} className="flex items-center gap-2 text-gray-600">
                <span className="w-4 h-4 rounded-full bg-[#f0f4ff] text-[#5c35d9] text-[9px] font-bold flex items-center justify-center shrink-0">
                  ✓
                </span>
                {ch}
              </li>
            ))}
          </ul>
        </AccordionItem>
      ))}
    </div>
  );
}

function ScheduleTab() {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">Weekly live session timetable.</p>

      {/* Mobile: stacked cards */}
      <div className="grid grid-cols-2 sm:hidden gap-2">
        {weekSchedule.map((s) => (
          <div key={s.day} className="bg-white border border-gray-100 rounded-xl p-3 text-center">
            <p className="text-xs font-bold text-[#1a237e] mb-0.5">{s.day}</p>
            <p className="text-xs font-semibold text-gray-800 mb-0.5">{s.subject}</p>
            <p className="text-[10px] text-gray-400">{s.time}</p>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1a237e] text-white">
              {weekSchedule.map((s) => (
                <th key={s.day} className="px-3 py-3 font-semibold text-xs text-center">
                  {s.day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {weekSchedule.map((s) => (
                <td
                  key={s.day}
                  className="px-3 py-4 text-center bg-white hover:bg-[#f0f4ff] transition-colors border border-gray-50"
                >
                  <p className="font-semibold text-gray-800 text-xs mb-1">{s.subject}</p>
                  <p className="text-gray-400 text-[11px]">{s.time}</p>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-3 italic">* Sunday off. Recordings available 24×7.</p>
    </div>
  );
}

function FacultyTab() {
  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 bg-[#f0f4ff] rounded-xl p-4 sm:p-6">
      <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#1a237e] to-[#5c35d9] flex items-center justify-center shrink-0 shadow-lg">
        <User size={28} className="text-white sm:hidden" />
        <User size={36} className="text-white hidden sm:block" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Vi Smart Faculty</h3>
        <p className="text-sm text-[#5c35d9] font-semibold mb-1">Senior Educator</p>
        <p className="text-xs sm:text-sm text-gray-500 mb-3">
          M.Sc. | B.Ed. | 10+ Years Teaching Experience
        </p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {["CBSE Expert", "10+ Years XP", "500+ Students", "Board Specialist"].map((tag) => (
            <span
              key={tag}
              className="bg-white text-[#5c35d9] text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full border border-[#e0d4ff]"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-3 leading-relaxed">
          Our faculty specialise in making complex topics exam-ready through structured teaching,
          regular tests, and one-on-one doubt sessions.
        </p>
      </div>
    </div>
  );
}

function FAQTab() {
  return (
    <div>
      {faqs.map((faq, i) => (
        <AccordionItem key={i} title={faq.q}>
          <p className="text-gray-600">{faq.a}</p>
        </AccordionItem>
      ))}
    </div>
  );
}

/* ──────────────── MAIN PAGE ──────────────── */
export default function BatchDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const d = await fetchBatchBySlug(params.id);
        if (cancelled) return;
        setBatch(d);
      } catch {
        setFetchError(true);
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [params.id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#f8f9ff] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#5c35d9]/30 border-t-[#5c35d9] rounded-full animate-spin" />
        </main>
        <Footer />
      </>
    );
  }

  if (fetchError) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center gap-4 px-4">
          <p className="text-lg text-gray-500">Could not load batch details</p>
          <button onClick={() => window.location.reload()} className="rounded-lg bg-[#5c35d9] px-6 py-2 text-sm font-semibold text-white hover:bg-[#4a2bb8] transition-colors">
            Try Again
          </button>
        </main>
        <Footer />
      </>
    );
  }

  if (!batch) notFound();

  const savings = batch.originalPrice - batch.price;
  const discount = Math.round(
    ((batch.originalPrice - batch.price) / batch.originalPrice) * 100
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f8f9ff]">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4 pb-2">
          <nav
            className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 flex-wrap"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-[#5c35d9] transition-colors">
              Home
            </Link>
            <span className="text-gray-300">/</span>
            <Link href="/batches" className="hover:text-[#5c35d9] transition-colors">
              All Batches
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-800 font-semibold truncate max-w-[160px] sm:max-w-xs">
              {batch.title}
            </span>
          </nav>
        </div>

        {/* Page grid: single col on mobile, two-col on lg */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-32 lg:pb-16 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 pt-4">
          {/* ─── LEFT COLUMN ─── */}
          <div className="min-w-0">
            {/* Banner */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl overflow-hidden mb-5 shadow-lg"
            >
              <div className="relative h-48 sm:h-56 md:h-72 bg-gray-200">
                <Image
                  src={batch.banner || batch.image}
                  alt={batch.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 70vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute bottom-3 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  🔴 LIVE
                </span>
              </div>
            </motion.div>

            {/* Title + meta */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-5"
            >
              <h1
                className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 leading-tight"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                {batch.title}
              </h1>
              <div className="flex items-center gap-3 text-xs sm:text-sm flex-wrap">
                <span className="flex items-center gap-1 text-amber-500 font-semibold">
                  <Star size={13} fill="currentColor" /> {batch.rating}
                </span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1 text-gray-500">
                  <Users size={12} /> {batch.students} enrolled
                </span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1 text-gray-500">
                  <Clock size={12} /> {batch.duration}
                </span>
              </div>
            </motion.div>

            {/* Tabs — scrollable on mobile */}
            <div className="sticky top-[80px] md:top-[90px] z-30 bg-[#f8f9ff] pb-px mb-5">
              <div className="flex gap-0 overflow-x-auto scrollbar-hide border-b border-gray-200">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap px-4 sm:px-5 py-3 text-xs sm:text-sm font-semibold transition-all border-b-2 shrink-0 ${
                      activeTab === tab.id
                        ? "border-[#5c35d9] text-[#5c35d9]"
                        : "border-transparent text-gray-500 hover:text-gray-800"
                    }`}
                    style={{ minHeight: "44px" }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100"
              >
                {activeTab === "overview" && <OverviewTab batch={batch} />}
                {activeTab === "subjects" && <SubjectsTab batch={batch} />}
                {activeTab === "schedule" && <ScheduleTab />}
                {activeTab === "faculty" && <FacultyTab />}
                {activeTab === "faq" && <FAQTab />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ─── RIGHT COLUMN — Desktop enrollment card ─── */}
          <div className="hidden lg:block lg:sticky lg:top-[100px] lg:self-start">
            <DesktopEnrollCard batch={batch} savings={savings} discount={discount} />
            <a
              href={`https://wa.me/919821233879?text=Hi%2C%20I%20have%20a%20question%20about%20${encodeURIComponent(batch.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full mt-3 py-3 bg-[#25d366] text-white font-semibold rounded-xl text-sm hover:bg-[#1da851] transition-all duration-200"
            >
              <MessageCircle size={16} /> Ask on WhatsApp
            </a>
          </div>
        </div>

        {/* ─── Mobile: Price summary card (above fold reminder) ─── */}
        <div className="lg:hidden max-w-7xl mx-auto px-4 pb-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-xl font-extrabold text-emerald-600">
                  ₹{batch.price.toLocaleString("en-IN")}
                  <span className="text-xs text-gray-400 font-medium">/yr</span>
                </span>
                <span className="ml-2 text-sm text-gray-400 line-through">
                  ₹{batch.originalPrice.toLocaleString("en-IN")}
                </span>
                <span className="ml-2 text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-lg">
                  {discount}% off
                </span>
              </div>
            </div>

            {Object.keys(batch.discount).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {batch.discount.army && (
                  <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-1 rounded-full font-semibold">
                    🪖 Army {batch.discount.army}% off
                  </span>
                )}
                {batch.discount.disabled && (
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-semibold">
                    ♿ Differently Abled {batch.discount.disabled}% off
                  </span>
                )}
                {batch.discount.singleParent && (
                  <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-1 rounded-full font-semibold">
                    👨‍👦 Single Parent {batch.discount.singleParent}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ─── Mobile Sticky Bottom CTA Bar ─── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-3"
        style={{ boxShadow: "0 -4px 24px rgba(0,0,0,0.10)" }}
      >
        <div className="flex items-center gap-3 max-w-xl mx-auto">
          <a
            href="tel:9821233879"
            id={`call-mobile-${batch.id}`}
            className="flex items-center justify-center gap-1.5 px-4 py-3 border-2 border-[#1a237e] text-[#1a237e] font-bold rounded-xl text-sm transition-all active:scale-95 shrink-0"
            style={{ minHeight: "48px" }}
          >
            <Phone size={15} />
            <span className="hidden xs:inline">Call</span>
          </a>
          <Link
            href={`/checkout/${batch.id}`}
            id={`enroll-mobile-${batch.id}`}
            className="flex-1 flex items-center justify-center py-3 bg-[#5c35d9] text-white font-bold rounded-xl text-sm"
            style={{ minHeight: "48px" }}
          >
            Enroll Now — ₹{batch.price.toLocaleString("en-IN")}
          </Link>
          <a
            href={`https://wa.me/919821233879?text=Hi%2C%20I%20want%20to%20enroll%20in%20${encodeURIComponent(batch.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            id={`wa-mobile-${batch.id}`}
            className="flex items-center justify-center px-3 py-3 bg-[#25d366] text-white font-bold rounded-xl text-sm transition-all active:scale-95 shrink-0"
            style={{ minHeight: "48px" }}
          >
            <MessageCircle size={18} />
          </a>
        </div>
        <p className="text-center text-[10px] text-red-400 italic mt-1">
          "Pass Nahi Toh Fees Nahi"
        </p>
      </div>

      <Footer />
    </>
  );
}

/* ──────────────── DESKTOP ENROLL CARD ──────────────── */
function DesktopEnrollCard({
  batch,
  savings,
  discount,
}: {
  batch: Batch;
  savings: number;
  discount: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100"
      style={{ boxShadow: "0 8px 40px rgba(26,35,126,0.12)" }}
    >
      {/* Thumbnail */}
      <div className="relative h-44 bg-gray-200">
        <Image
          src={batch.image}
          alt={batch.title}
          fill
          className="object-cover"
          sizes="340px"
        />
      </div>

      <div className="p-5 space-y-4">
        {/* Price */}
        <div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-3xl font-extrabold text-emerald-600">
              ₹{batch.price.toLocaleString("en-IN")}
              <span className="text-base text-gray-400 font-semibold">/year</span>
            </span>
            <span className="text-lg text-gray-400 line-through">
              ₹{batch.originalPrice.toLocaleString("en-IN")}
            </span>
          </div>
          <span className="inline-block mt-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-1 rounded-lg">
            You save ₹{savings.toLocaleString("en-IN")} ({discount}% off)
          </span>
        </div>

        {/* Includes */}
        <div className="space-y-2">
          {[
            "Live Interactive Classes",
            "Recorded Lectures",
            "Study Notes & PDFs",
            "24×7 Doubt Support",
            "Pass Guarantee",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle size={14} className="text-emerald-500 shrink-0" />
              {item}
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100" />

        {/* CTA Buttons */}
        <Link
          href={`/checkout/${batch.id}`}
          id={`enroll-detail-${batch.id}`}
          className="block w-full text-center py-3.5 bg-[#5c35d9] text-white font-bold rounded-xl text-base transition-all duration-200 hover:bg-[#4a28b8]"
        >
          Enroll Now
        </Link>

        <a
          href="tel:9821233879"
          id={`call-detail-${batch.id}`}
          className="flex items-center justify-center gap-2 w-full py-3 border-2 border-[#1a237e] text-[#1a237e] font-bold rounded-xl text-sm hover:bg-[#1a237e] hover:text-white transition-all duration-200"
        >
          <Phone size={15} /> Call: 9821233879
        </a>

        {/* Special Offers */}
        {Object.keys(batch.discount).length > 0 && (
          <>
            <div className="border-t border-gray-100" />
            <div id="special-offers">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                🎁 Special Offers
              </p>
              <div className="space-y-1.5">
                {batch.discount.army && (
                  <div className="flex items-center gap-2 text-sm text-gray-700 bg-amber-50 px-3 py-2 rounded-lg">
                    🪖 <span className="font-semibold">Army:</span> {batch.discount.army}% off
                  </div>
                )}
                {batch.discount.disabled && (
                  <div className="flex items-center gap-2 text-sm text-gray-700 bg-blue-50 px-3 py-2 rounded-lg">
                    ♿ <span className="font-semibold">Differently Abled:</span>{" "}
                    {batch.discount.disabled}% off
                  </div>
                )}
                {batch.discount.singleParent && (
                  <div className="flex items-center gap-2 text-sm text-gray-700 bg-rose-50 px-3 py-2 rounded-lg">
                    👨‍👦 <span className="font-semibold">Single Parent:</span>{" "}
                    {batch.discount.singleParent}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <p className="text-center text-xs text-red-500 italic font-semibold border-t border-gray-100 pt-3">
          "Pass Nahi Toh Fees Nahi"
        </p>
      </div>
    </motion.div>
  );
}
