"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, UserCheck, CreditCard,
  Calendar, FileText, BookOpen, Settings,
  LogOut, BarChart3, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/components/providers/UserProvider";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin/dashboard" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: UserCheck, label: "Counsellors", href: "/admin/counsellors" },
  { icon: Calendar, label: "Appointments", href: "/admin/appointments" },
  { icon: CreditCard, label: "Payments", href: "/admin/payments" },
  { icon: BookOpen, label: "Content", href: "/admin/content" },
  { icon: FileText, label: "Reports", href: "/admin/reports" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useUser();

  return (
    <aside className="h-screen sticky top-0 w-64 flex-shrink-0 bg-slate-950 flex flex-col">
      <div className="flex items-center gap-2 h-16 px-5 border-b border-slate-800">
        <Shield size={18} className="text-brand-purple flex-shrink-0" />
        <span className="text-white font-semibold text-sm">Admin Panel</span>
      </div>

      <div className="px-3 py-2 border-b border-slate-800">
        <Link href="/" className="block">
          <Image src="/logo-white.svg" alt="Manokalpa" width={130} height={32} className="h-7 w-auto opacity-70 hover:opacity-100 transition-opacity" />
        </Link>
      </div>

      {user && (
        <div className="px-4 py-3 border-b border-slate-800">
          <div className="text-white text-sm font-medium leading-tight">{user.name}</div>
          <div className="text-slate-400 text-xs mt-0.5">{user.email}</div>
        </div>
      )}

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-0.5 px-2">
          {navItems.map(({ icon: Icon, label, href }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    active ? "bg-brand-purple text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Icon size={17} className="flex-shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-slate-800">
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut size={17} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
