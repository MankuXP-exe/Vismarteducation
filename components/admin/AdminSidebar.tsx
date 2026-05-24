"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CreditCard, LayoutDashboard, Package, Users } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/batches", label: "Batches", icon: Package },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 border-r border-gray-200 bg-white p-4">
      <Link href="/" className="mb-8 block">
        <img src="/images/logo-transparentbg.png" alt="Vi Smart" className="h-12" />
      </Link>
      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${active ? "bg-purple-50 text-[#5c35d9]" : "text-gray-600 hover:bg-gray-50"}`}>
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
