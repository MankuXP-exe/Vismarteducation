"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarPlus, LayoutDashboard, Menu, Package, Upload, Video, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/teacher", label: "Overview", icon: LayoutDashboard },
  { href: "/teacher/batches", label: "My Batches", icon: Package },
  { href: "/teacher/live/start", label: "Go Live", icon: Video },
];

export default function TeacherSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const sidebarContent = (
    <>
      <Link href="/" className="mb-8 block" onClick={() => setOpen(false)}>
        <img src="/images/logo-transparentbg.png" alt="Vi Smart" className="h-12" />
      </Link>
      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                active ? "bg-purple-50 text-[#5c35d9]" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-60 border-r border-gray-200 bg-white p-4 lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="relative h-screen w-64 border-r border-gray-200 bg-white p-4 shadow-lg">
            <div className="flex justify-end mb-4">
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
