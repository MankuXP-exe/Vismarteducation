"use client";

import Image from "next/image";
import Link from "next/link";
import { Phone, MapPin } from "lucide-react";

const courses = [
  "Class 10th",
  "Class 9th",
  "Class 11th Science",
  "Class 11th Commerce",
  "Class 12th Science",
  "Class 12th Commerce",
  "B.COM & BBA",
];

const accountingCourses = [
  "Basic Computer",
  "DCA / ADCA",
  "Tally Prime ERP9",
  "GST Filing",
  "Income Tax Return",
  "TDS / TCS",
];

const quickLinks = [
  { label: "About Us", href: "#about" },
  { label: "All Batches", href: "#batches" },
  { label: "Study Material", href: "#study-material" },
  { label: "Results", href: "#results" },
  { label: "Contact Us", href: "#contact" },
  { label: "Privacy Policy", href: "#" },
];

const socials = [
  {
    id: "social-whatsapp",
    label: "WhatsApp",
    href: "https://wa.me/919821233879",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    ),
    color: "hover:bg-green-600",
  },
  {
    id: "social-instagram",
    label: "Instagram",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    color: "hover:bg-pink-600",
  },
  {
    id: "social-youtube",
    label: "YouTube",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    color: "hover:bg-red-600",
  },
  {
    id: "social-facebook",
    label: "Facebook",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    color: "hover:bg-blue-700",
  },
];

export default function Footer() {
  return (
    <footer style={{ background: "#0d1b4b" }} id="footer">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* COL 1 — About */}
          <div className="flex flex-col gap-5">
            <Link href="/">
              <Image
                src="/images/logo-whitebg.png"
                alt="Vi Smart Learning Education"
                width={120}
                height={120}
                className="h-20 md:h-[90px] w-auto object-contain rounded-lg"
              />
            </Link>
            <p className="text-white/60 text-sm leading-relaxed">
              Quality education for Class 5th–12th, B.COM, BBA &amp; Accounting.
              Since 2023.
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2 text-white/70 text-sm">
                <MapPin size={15} className="mt-0.5 shrink-0 text-[#fdd835]" />
                <span>
                  Garhi Harsaru, Near Punjab National Bank, Gurugram
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Phone size={15} className="shrink-0 text-[#fdd835]" />
                <a
                  href="tel:9821233879"
                  className="hover:text-[#fdd835] transition-colors"
                >
                  9821233879
                </a>
              </div>
            </div>
            {/* Socials */}
            <div className="flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.id}
                  id={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className={`w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/70 transition-all duration-200 hover:text-white ${s.color}`}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* COL 2 — Courses */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-5">
              Our Courses
            </h3>
            <ul className="flex flex-col gap-2.5">
              {courses.map((c) => (
                <li key={c}>
                  <Link
                    href="#courses"
                    className="text-white/60 text-sm hover:text-[#fdd835] transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5c35d9] shrink-0" />
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COL 3 — Accounting */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-5">
              Accounting Courses
            </h3>
            <ul className="flex flex-col gap-2.5">
              {accountingCourses.map((c) => (
                <li key={c}>
                  <Link
                    href="#accounting"
                    className="text-white/60 text-sm hover:text-[#fdd835] transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c62828] shrink-0" />
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COL 4 — Quick Links */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-5">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2.5">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-white/60 text-sm hover:text-[#fdd835] transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#fdd835]/60 shrink-0" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tagline bar */}
        <div
          className="rounded-xl px-6 py-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ background: "rgba(253,216,53,0.08)", border: "1px solid rgba(253,216,53,0.2)" }}
        >
          <p className="text-[#fdd835] font-black text-lg md:text-xl tracking-tight">
            🎯 Pass Nahi Toh Fees Nahi
          </p>
          <p className="text-white/60 text-sm">
            If you don&apos;t pass, you don&apos;t pay. Simple.
          </p>
        </div>

        {/* Legal Links Row */}
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm text-white/50 mb-6 font-medium">
          <Link href="/legal/terms" className="hover:text-white hover:underline transition-all">Terms & Conditions</Link>
          <span>&middot;</span>
          <Link href="/legal/privacy" className="hover:text-white hover:underline transition-all">Privacy Policy</Link>
          <span>&middot;</span>
          <Link href="/legal/refund" className="hover:text-white hover:underline transition-all">Refund Policy</Link>
          <span>&middot;</span>
          <Link href="/legal/cookie" className="hover:text-white hover:underline transition-all">Cookie Policy</Link>
          <span>&middot;</span>
          <Link href="/legal/disclaimer" className="hover:text-white hover:underline transition-all">Disclaimer</Link>
        </div>

        {/* Bottom bar */}
        <div
          className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white/40 text-xs text-center md:text-left"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          <div>
            <p className="mb-1">© 2025 Vi Smart Learning Education. All Rights Reserved.</p>
            <p>Garhi Harsaru, Near Punjab National Bank, Gurugram, Haryana</p>
          </div>
          <div className="md:text-right">
            <p>CIN: [Registration Number] | GSTIN: [GST Number]</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
