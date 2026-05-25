"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Calculator,
  Library,
  Package,
  ClipboardList,
  Gift,
  ShieldCheck,
  Sparkles,
  Menu,
  X,
  Percent,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getEffectiveRole } from "@/lib/auth/roles";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "LEARN ONLINE",
    items: [
      {
        label: "Study",
        icon: <BookOpen size={18} />,
        href: "/dashboard/study",
      },
      {
        label: "Pi",
        icon: <Calculator size={18} />,
        href: "/dashboard/pi",
        badge: "NEW",
      },
      {
        label: "Library",
        icon: <Library size={18} />,
        href: "/dashboard/library",
      },
    ],
  },
  {
    title: "STUDY PACKS",
    items: [
      {
        label: "Batches",
        icon: <Package size={18} />,
        href: "/dashboard/batches",
      },
      {
        label: "My Tests",
        icon: <ClipboardList size={18} />,
        href: "/dashboard/tests",
      },
    ],
  },
  {
    title: "MORE",
    items: [
      {
        label: "Fee Concession",
        icon: <Percent size={18} />,
        href: "/concession",
        badge: "NEW",
      },
      {
        label: "Refer & Earn",
        icon: <Gift size={18} />,
        href: "/dashboard/refer",
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const role = getEffectiveRole(user, profile);
  const [open, setOpen] = useState(false);

  const adminItems: NavItem[] = [
    {
      label: role === "admin" ? "Admin Panel" : "Teacher Panel",
      icon: <ShieldCheck size={18} />,
      href: role === "admin" ? "/admin/users" : "/teacher",
    },
  ];

  const sections: NavSection[] =
    role === "teacher" || role === "admin"
      ? [
          ...navSections,
          { title: "ADMIN", items: adminItems },
        ]
      : navSections;

  const isActive = (href: string) => {
    if (href === "/dashboard/study") {
      return (
        pathname === "/dashboard/study" ||
        pathname?.startsWith("/dashboard/study/")
      );
    }
    if (href === "/dashboard/batches") {
      return pathname?.startsWith("/dashboard/batches");
    }
    return pathname === href;
  };

  const sidebarContent = (
    <>
      <div className="px-4 py-3 border-b border-[#f0f0f0]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#5c35d9] flex items-center justify-center">
            <Sparkles size={12} className="text-white" />
          </div>
          <span className="text-xs font-bold text-gray-500 tracking-wide">STUDENT PORTAL</span>
        </div>
      </div>

      <nav className="flex-1 pb-6">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-[10px] font-semibold text-gray-400 tracking-widest px-4 pt-5 pb-1 uppercase">
              {section.title}
            </p>
            {section.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 relative ${
                    active
                      ? "bg-[#ede9ff] text-[#5c35d9] font-semibold border-r-2 border-[#5c35d9]"
                      : "text-gray-600 hover:bg-[#f0f0ff] hover:text-[#5c35d9]"
                  }`}
                >
                  <span className={active ? "text-[#5c35d9]" : "text-gray-400"}>
                    {item.icon}
                  </span>
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
        ))}
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-[56px] hidden h-[calc(100vh-56px)] w-[200px] border-r border-[#f0f0f0] bg-white overflow-y-auto z-30 flex-col lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-64 border-r border-[#f0f0f0] bg-white overflow-y-auto shadow-lg pt-14">
            <div className="absolute right-3 top-3">
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
