"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, User, Menu, X, Settings, GraduationCap, Shield, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BatchSwitcher from "./BatchSwitcher";
import NotificationBell from "./NotificationBell";
import { useAuth } from "@/hooks/useAuth";

export default function TopNavbar() {
  const [batchOpen, setBatchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const { user, profile } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || "Student";
  const firstName = displayName?.split(" ")[0] || "Student";
  const role = profile?.role || user?.user_metadata?.role || "student";
  const initial = displayName.charAt(0).toUpperCase();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const roleConfig = {
    student: { label: "Student", icon: GraduationCap, color: "bg-blue-500" },
    teacher: { label: "Teacher", icon: Shield, color: "bg-purple-500" },
    admin: { label: "Admin", icon: Shield, color: "bg-red-500" },
  } as const;
  const roleInfo = roleConfig[role as keyof typeof roleConfig] || roleConfig.student;
  const RoleIcon = roleInfo.icon;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-14 z-40 flex items-center px-3 sm:px-5 gap-2 sm:gap-4"
        style={{ background: "#1a1a2e", borderBottom: "1px solid #2a2a3e" }}>
        
        {/* Mobile hamburger */}
        <button onClick={() => setMobileSidebar(true)}
          className="flex lg:hidden text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Open sidebar">
          <Menu size={20} />
        </button>

        {/* LEFT — Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image src="/images/logo-transparentbg.png" alt="Vi Smart" width={32} height={32}
            className="h-8 w-8 object-contain rounded-full" />
          <span className="text-white font-bold text-sm hidden sm:block">Vi Smart</span>
        </Link>

        {/* CENTER — Active Batch Selector */}
        <div className="flex-1 flex justify-center">
          <button onClick={() => setBatchOpen(true)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm text-white/80 hover:text-white transition-all hover:bg-white/5"
            style={{ background: "#2a2a3e" }}>
            <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
            <span className="font-medium truncate max-w-[180px] sm:max-w-xs">My batches</span>
            <ChevronDown size={14} className="text-white/50 shrink-0" />
          </button>
        </div>

        {/* RIGHT — Notifications + Profile */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <NotificationBell />

          <div ref={dropdownRef} className="relative">
            <button onClick={() => setProfileOpen((o) => !o)}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-all hover:bg-white/5"
              style={profileOpen ? { background: "rgba(255,255,255,0.08)" } : {}}>
              {/* Avatar */}
              <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ background: role === "teacher" ? "#7c3aed" : role === "admin" ? "#ef4444" : "#3b82f6" }}>
                {initial}
              </div>
              {/* Name + Role */}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-white leading-tight">{firstName}</p>
                <div className="flex items-center gap-1">
                  <RoleIcon size={10} className="text-white/60" />
                  <span className="text-[10px] text-white/50 capitalize">{roleInfo.label}</span>
                </div>
              </div>
              <ChevronDown size={14} className={`text-white/40 transition-transform duration-200 hidden sm:block ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-11 w-64 rounded-2xl border border-gray-100 bg-white shadow-xl shadow-black/5 overflow-hidden">
                  
                  {/* User Info Header */}
                  <div className="px-4 pt-4 pb-3 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center text-base font-bold text-white shrink-0"
                        style={{ background: role === "teacher" ? "#7c3aed" : role === "admin" ? "#ef4444" : "#3b82f6" }}>
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email || ""}</p>
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium text-white ${roleInfo.color}`}>
                        <RoleIcon size={10} />
                        {roleInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-1.5">
                    <Link href="/dashboard/profile" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50">
                      <User size={16} className="text-gray-400" />
                      Profile Settings
                    </Link>
                    {role === "teacher" || role === "admin" ? (
                      <Link href="/teacher" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50">
                        <Settings size={16} className="text-gray-400" />
                        Teacher Panel
                      </Link>
                    ) : null}
                    <Link href="/dashboard/study" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50">
                      <BookOpen size={16} className="text-gray-400" />
                      My Dashboard
                    </Link>
                  </div>

                  {/* Sign Out */}
                  <div className="border-t border-gray-50 p-1.5">
                    <a href="/auth/signout"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50">
                      <LogOut size={16} />
                      Sign Out
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <BatchSwitcher isOpen={batchOpen} onClose={() => setBatchOpen(false)} />

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebar && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebar(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative h-full w-64 border-r border-gray-100 bg-white overflow-y-auto shadow-xl pt-14">
              <div className="absolute right-3 top-3">
                <button onClick={() => setMobileSidebar(false)} aria-label="Close menu" className="p-1.5 rounded-lg hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>
              <nav className="pb-6">
                <MobileNavLinks onClose={() => setMobileSidebar(false)} />
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MobileNavLinks({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const { profile } = useAuth();
  const role = profile?.role || "student";

  const isActive = (href: string) =>
    href === "/dashboard/study" ? pathname?.startsWith("/dashboard/study")
    : href === "/dashboard/batches" ? pathname?.startsWith("/dashboard/batches")
    : pathname === href;

  const items: { label: string; href: string; section: string; badge?: string; roles?: string[] }[] = [
    { label: "Study", href: "/dashboard/study", section: "LEARN ONLINE" },
    { label: "Batches", href: "/dashboard/batches", section: "STUDY PACKS" },
    { label: "My Tests", href: "/dashboard/tests", section: "STUDY PACKS" },
    { label: "Recent Learning", href: "/dashboard/recent-learning", section: "STUDY PACKS" },
    { label: "My Doubts", href: "/dashboard/doubts", section: "STUDY PACKS" },
    { label: "Bookmarks", href: "/dashboard/bookmarks", section: "STUDY PACKS" },
    { label: "Fee Concession", href: "/concession", section: "MORE", badge: "NEW" },
    { label: "Teacher Panel", href: "/teacher", section: "ADMIN", roles: ["teacher", "admin"] },
  ];

  const visible = role === "teacher" || role === "admin" ? items : items.filter((i) => !i.roles || i.roles.includes(role));
  const sections = [...new Set(visible.map((i) => i.section))];

  return sections.map((section) => (
    <div key={section}>
      <p className="text-[10px] font-semibold text-gray-400 tracking-widest px-4 pt-5 pb-1 uppercase">{section}</p>
      {visible.filter((i) => i.section === section).map((item) => {
        const active = isActive(item.href);
        return (
          <Link key={item.href} href={item.href} onClick={onClose}
            className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 ${
              active ? "bg-purple-50 text-purple-700 font-semibold border-r-2 border-purple-600" : "text-gray-600 hover:bg-gray-50 hover:text-purple-600"
            }`}>
            <span className="flex-1">{item.label}</span>
            {item.badge && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">{item.badge}</span>}
          </Link>
        );
      })}
    </div>
  ));
}
