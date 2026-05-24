"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, ChevronRight, User, LogOut } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { label: "About Us", href: "/#about" },
  { label: "Study Material", href: "/#study-material" },
  { label: "Results", href: "/#results" },
  { label: "Contact", href: "/#contact" },
];

const schoolBatches = [
  { emoji: "📗", label: "Class 9th & 10th", href: "/batches?category=class-9-10" },
  { emoji: "📙", label: "Class 11th Science", href: "/batches?category=class-11" },
  { emoji: "📙", label: "Class 11th Commerce", href: "/batches?category=class-11" },
  { emoji: "📕", label: "Class 12th Science", href: "/batches?category=class-12" },
  { emoji: "📕", label: "Class 12th Commerce", href: "/batches?category=class-12" },
];

const professionalBatches = [
  { emoji: "💼", label: "B.COM (Bachelor of Commerce)", href: "/batches?category=accounting" },
  { emoji: "💼", label: "BBA (Bachelor of Bus. Admin)", href: "/batches?category=accounting" },
  { emoji: "📊", label: "Tally Prime ERP9", href: "/batches?category=accounting" },
  { emoji: "📊", label: "GST Filing & Registration", href: "/batches?category=accounting" },
  { emoji: "📊", label: "Income Tax Return", href: "/batches?category=accounting" },
  { emoji: "📊", label: "DCA / ADCA Computer Course", href: "/batches?category=accounting" },
];

const megaDropdownVariants: Variants = {
  hidden: { opacity: 0, y: -8, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.18, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.98,
    transition: { duration: 0.12, ease: "easeIn" },
  },
};

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [mobileBatchOpen, setMobileBatchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const isBatchesActive = pathname?.startsWith("/batches");

  const handleSignOut = async () => {
    await signOut();
    setProfileOpen(false);
    setMobileOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setBatchOpen(false);
      }
    };
    if (batchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [batchOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg"
            : "bg-white"
        }`}
        style={{ borderBottom: "3px solid #fdd835" }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-20 md:h-[90px]">
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/images/logo-transparentbg.png"
                alt="Vi Smart Learning Education Logo"
                width={120}
                height={120}
                className="h-16 md:h-[76px] w-auto object-contain"
                priority
              />
            </Link>

            {/* Center Nav — Desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              {/* All Batches Mega Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  id="all-batches-btn"
                  onMouseEnter={() => setBatchOpen(true)}
                  onMouseLeave={() => setBatchOpen(false)}
                  onClick={() => setBatchOpen(!batchOpen)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-600 border-2 transition-all duration-200 font-semibold ${
                    isBatchesActive
                      ? "border-[#5c35d9] bg-[#5c35d9] text-white"
                      : "border-[#1a237e] text-[#1a237e] hover:bg-[#1a237e] hover:text-white"
                  }`}
                  aria-expanded={batchOpen}
                  aria-haspopup="true"
                >
                  All Batches{" "}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${batchOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Active purple underline */}
                {isBatchesActive && (
                  <span className="absolute -bottom-[3px] left-0 right-0 h-[3px] rounded-full bg-[#5c35d9]" />
                )}

                <AnimatePresence>
                  {batchOpen && (
                    <motion.div
                      variants={megaDropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      onMouseEnter={() => setBatchOpen(true)}
                      onMouseLeave={() => setBatchOpen(false)}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[580px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                      style={{ boxShadow: "0 20px 60px rgba(26,35,126,0.15)" }}
                    >
                      <div className="grid grid-cols-2 gap-0">
                        {/* Column 1 — School Classes */}
                        <div className="p-5 border-r border-gray-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
                            🏫 School Classes
                          </p>
                          {schoolBatches.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={() => setBatchOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-700 font-medium transition-all duration-150 hover:bg-[#f0f4ff] hover:text-[#5c35d9] group border-l-2 border-transparent hover:border-[#5c35d9] mb-0.5"
                            >
                              <span className="text-base leading-none">{item.emoji}</span>
                              <span>{item.label}</span>
                              <ChevronRight
                                size={12}
                                className="ml-auto opacity-0 group-hover:opacity-100 text-[#5c35d9] transition-opacity"
                              />
                            </Link>
                          ))}
                        </div>

                        {/* Column 2 — Professional */}
                        <div className="p-5">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
                            💼 Professional
                          </p>
                          {professionalBatches.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={() => setBatchOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-700 font-medium transition-all duration-150 hover:bg-[#f0f4ff] hover:text-[#5c35d9] group border-l-2 border-transparent hover:border-[#5c35d9] mb-0.5"
                            >
                              <span className="text-base leading-none">{item.emoji}</span>
                              <span>{item.label}</span>
                              <ChevronRight
                                size={12}
                                className="ml-auto opacity-0 group-hover:opacity-100 text-[#5c35d9] transition-opacity"
                              />
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Footer — View All */}
                      <div className="border-t border-gray-100 bg-gradient-to-r from-[#f0f4ff] to-[#faf5ff]">
                        <Link
                          href="/batches"
                          onClick={() => setBatchOpen(false)}
                          className="flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-[#5c35d9] hover:text-[#4a28b8] transition-colors group"
                        >
                          View All Batches
                          <span className="group-hover:translate-x-1 transition-transform duration-200">
                            →
                          </span>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-[#5c35d9] rounded-lg hover:bg-[#f0f4ff] transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right — Login Button + Mobile Hamburger */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-3">
                {!user ? (
                  <>
                    <Link
                      href="/login"
                      className="text-sm font-semibold text-gray-700 hover:text-[#5c35d9] transition-colors"
                    >
                      Log In
                    </Link>
                    <Link href="/signup" className="btn-primary text-sm px-4 py-2">
                      Register
                    </Link>
                  </>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setProfileOpen((open) => !open)}
                      className="h-9 w-9 rounded-full bg-[#f0f4ff] flex items-center justify-center text-[#5c35d9] hover:bg-[#e8eeff]"
                      aria-label="Open profile menu"
                    >
                      <User size={17} />
                    </button>
                    {profileOpen && (
                      <div className="absolute right-0 top-11 w-52 rounded-lg border border-gray-100 bg-white p-2 shadow-xl">
                        <Link
                          href="/dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <LogOut size={15} />
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                id="mobile-menu-btn"
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                onClick={() => setMobileOpen(true)}
                aria-label="Open mobile menu"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-[80vw] max-w-xs bg-white z-50 shadow-2xl flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <Image
                  src="/images/logo-transparentbg.png"
                  alt="Vi Smart Logo"
                  width={100}
                  height={100}
                  className="h-14 w-auto object-contain"
                />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
                {/* All Batches Accordion */}
                <button
                  onClick={() => setMobileBatchOpen(!mobileBatchOpen)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors w-full text-left ${
                    isBatchesActive
                      ? "bg-[#f0f4ff] text-[#5c35d9]"
                      : "text-gray-700 hover:bg-[#f0f4ff] hover:text-[#5c35d9]"
                  }`}
                >
                  <span>All Batches</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      mobileBatchOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {mobileBatchOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-3 flex flex-col gap-0.5 pb-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 pt-2 pb-1">
                          School Classes
                        </p>
                        {schoolBatches.map((b) => (
                          <Link
                            key={b.label}
                            href={b.href}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-[#f0f4ff] hover:text-[#5c35d9] transition-colors border-l-2 border-transparent hover:border-[#5c35d9]"
                            onClick={() => setMobileOpen(false)}
                          >
                            <span>{b.emoji}</span>
                            {b.label}
                          </Link>
                        ))}
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 pt-3 pb-1">
                          Professional
                        </p>
                        {professionalBatches.map((b) => (
                          <Link
                            key={b.label}
                            href={b.href}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-[#f0f4ff] hover:text-[#5c35d9] transition-colors border-l-2 border-transparent hover:border-[#5c35d9]"
                            onClick={() => setMobileOpen(false)}
                          >
                            <span>{b.emoji}</span>
                            {b.label}
                          </Link>
                        ))}
                        <Link
                          href="/batches"
                          onClick={() => setMobileOpen(false)}
                          className="mt-2 mx-3 py-2.5 text-center text-sm font-semibold text-[#5c35d9] bg-[#f0f4ff] rounded-xl hover:bg-[#e8eeff] transition-colors"
                        >
                          View All Batches →
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="my-1 border-t border-gray-100" />
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-[#f0f4ff] hover:text-[#5c35d9] transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="p-4 border-t border-gray-100 flex flex-col gap-3">
                {!user ? (
                  <>
                    <Link
                      href="/login"
                      className="w-full py-2.5 rounded-lg border-2 border-[#1a237e] text-[#1a237e] font-semibold hover:bg-[#1a237e] hover:text-white transition-all text-center"
                      onClick={() => setMobileOpen(false)}
                    >
                      Log In
                    </Link>
                    <Link
                      href="/signup"
                      className="btn-primary w-full justify-center text-center"
                      onClick={() => setMobileOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="w-full rounded-lg bg-[#5c35d9] py-2.5 text-center font-semibold text-white"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-700"
                    >
                      <LogOut size={15} />
                      Sign out
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      <div className="h-20 md:h-[90px]" />
    </>
  );
}
