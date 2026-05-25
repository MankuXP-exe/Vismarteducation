"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Package, Users, CreditCard, Monitor, BarChart3,
  Video, Radio, Menu, X, PlusCircle, GraduationCap, FileVideo, Upload, Zap
} from "lucide-react";

const links = [
  { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teacher/students", label: "Students", icon: GraduationCap },
  { href: "/teacher/batches", label: "Batches", icon: Package },
  { href: "/teacher/subjects", label: "Subjects", icon: BookText },
  { href: "/teacher/lectures", label: "Lectures", icon: FileVideo },
  { href: "/teacher/tests", label: "Tests", icon: FileText },
  { href: "/teacher/materials", label: "Materials", icon: Upload },
  { href: "/teacher/live-classes", label: "Live Classes", icon: Radio },
  { href: "/teacher/live/start", label: "Go Live", icon: Zap },
  { href: "/teacher/recordings", label: "Recordings", icon: FileVideo },
  { href: "/teacher/concessions", label: "Concessions", icon: FileText },
  { href: "/teacher/payments", label: "Payments", icon: CreditCard },
  { href: "/teacher/vps", label: "VPS Monitor", icon: Monitor },
  { href: "/teacher/analytics", label: "Analytics", icon: BarChart3 },
];

function BookText({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

function FileText({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

export default function TeacherSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-lg md:hidden"
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-gray-200 bg-white transition-transform ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <Link href="/teacher" className="flex items-center gap-2">
            <img src="/images/logo-transparentbg.png" alt="Vi Smart" className="h-8" />
          </Link>
          <Link
            href="/teacher/batches/new"
            className="flex items-center gap-1 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            New Batch
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href || pathname?.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-purple-50 text-purple-700" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 p-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600 hover:bg-gray-100"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Back to Site
          </Link>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}
