"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Menu, User, X } from "lucide-react";
import BatchSwitcher from "./BatchSwitcher";
import NotificationBell from "./NotificationBell";
import { useAuth } from "@/hooks/useAuth";

export default function TopNavbar() {
  const [batchOpen, setBatchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, profile } = useAuth();

  const displayName =
    profile?.full_name || user?.user_metadata?.full_name || user?.email || "Student";
  const firstName = displayName?.split(" ")[0] || "Student";
  const [mobileSidebar, setMobileSidebar] = useState(false);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 h-[56px] z-40 flex items-center px-2 sm:px-4 gap-2 sm:gap-4"
        style={{
          background: "#1a1a2e",
          borderBottom: "1px solid #2a2a3e",
        }}
      >
        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileSidebar(true)}
          className="flex lg:hidden text-white/60 hover:text-white p-1"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        {/* LEFT — Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/images/logo-transparentbg.png"
            alt="Vi Smart"
            width={32}
            height={32}
            className="h-8 w-8 object-contain rounded-full"
          />
          <span className="text-white font-bold text-sm hidden sm:block">Vi Smart Learning Education</span>
        </Link>

        {/* CENTER — Active Batch Selector */}
        <div className="flex-1 flex justify-center">
          <button
            onClick={() => setBatchOpen(true)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm text-white/90 hover:text-white transition-colors"
            style={{ background: "#2a2a3e" }}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
            <span className="font-medium truncate max-w-[200px] sm:max-w-xs">
              My batches
            </span>
            <ChevronDown size={14} className="text-white/60 shrink-0" />
          </button>
        </div>

        {/* RIGHT — Notifications + Profile */}
        <div className="flex items-center gap-3 shrink-0">
          <NotificationBell />

          <div className="relative flex items-center gap-2">
            <span className="text-white/70 text-sm hidden md:block">
              Hi,{" "}
              <span className="text-white font-medium">
                {firstName}
              </span>
            </span>
            <button
              onClick={() => setProfileOpen((open) => !open)}
              className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
              aria-label="Open profile menu"
            >
              <User size={16} />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-10 w-56 rounded-lg border border-gray-100 bg-white p-2 shadow-xl">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User size={15} />
                  Profile
                </Link>
                <a
                  href="/auth/signout"
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <LogOut size={15} />
                  Sign out
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Batch Switcher Modal */}
      <BatchSwitcher isOpen={batchOpen} onClose={() => setBatchOpen(false)} />

      {/* Mobile sidebar overlay */}
      {mobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebar(false)} />
          <aside className="relative h-full w-64 border-r border-[#f0f0f0] bg-white overflow-y-auto shadow-lg pt-14">
            <div className="absolute right-3 top-3">
              <button onClick={() => setMobileSidebar(false)} aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            <nav className="pb-6">
              <MobileNavLinks onClose={() => setMobileSidebar(false)} />
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}

function MobileNavLinks({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/dashboard/study"
      ? pathname?.startsWith("/dashboard/study")
      : href === "/dashboard/batches"
        ? pathname?.startsWith("/dashboard/batches")
        : pathname === href;

  const items: { label: string; href: string; section: string; badge?: string }[] = [
    { label: "Study", href: "/dashboard/study", section: "LEARN ONLINE" },
    { label: "Batches", href: "/dashboard/batches", section: "STUDY PACKS" },
    { label: "My Tests", href: "/dashboard/tests", section: "STUDY PACKS" },
    { label: "Refer & Earn", href: "/dashboard/refer", section: "MORE" },
    { label: "Teacher Panel", href: "/teacher", section: "ADMIN" },
  ];

  const sections = [...new Set(items.map((i) => i.section))];

  return sections.map((section) => (
    <div key={section}>
      <p className="text-[10px] font-semibold text-gray-400 tracking-widest px-4 pt-5 pb-1 uppercase">
        {section}
      </p>
      {items
        .filter((i) => i.section === section)
        .map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 ${
                active
                  ? "bg-[#ede9ff] text-[#5c35d9] font-semibold border-r-2 border-[#5c35d9]"
                  : "text-gray-600 hover:bg-[#f0f0ff] hover:text-[#5c35d9]"
              }`}
            >
                <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
    </div>
  ));
}
