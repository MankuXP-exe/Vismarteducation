"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, ChevronDown, LogOut, User } from "lucide-react";
import BatchSwitcher from "./BatchSwitcher";
import { studentData } from "@/lib/student-mock-data";
import { useAuth } from "@/hooks/useAuth";

export default function TopNavbar() {
  const [batchOpen, setBatchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const activeBatch = studentData.enrolledBatches[0];
  const displayName =
    profile?.full_name || user?.user_metadata?.full_name || studentData.name;
  const firstName = displayName?.split(" ")[0] || "Student";

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 h-[56px] z-40 flex items-center px-4 gap-4"
        style={{
          background: "#1a1a2e",
          borderBottom: "1px solid #2a2a3e",
        }}
      >
        {/* LEFT — Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/images/logo-transparentbg.png"
            alt="Vi Smart"
            width={32}
            height={32}
            className="h-8 w-8 object-contain rounded-full"
          />
          <span className="text-white font-bold text-sm hidden sm:block">Vi Smart</span>
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
              {activeBatch.title} · {activeBatch.subtitle}
            </span>
            <ChevronDown size={14} className="text-white/60 shrink-0" />
          </button>
        </div>

        {/* RIGHT — Notifications + Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notification Bell */}
          <button
            aria-label="Notifications"
            className="relative text-white/60 hover:text-white transition-colors p-1"
          >
            <Bell size={20} />
          </button>

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
                <button
                  onClick={async () => {
                    await signOut();
                    setProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Batch Switcher Modal */}
      <BatchSwitcher isOpen={batchOpen} onClose={() => setBatchOpen(false)} />
    </>
  );
}
