"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CalendarCheck, Users, FileText,
  DollarSign, Radio, Star, LogOut, User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/components/providers/UserProvider";
import { getInitials } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/counsellor/dashboard" },
  { icon: CalendarCheck, label: "Appointments", href: "/counsellor/appointments" },
  { icon: Users, label: "My Clients", href: "/counsellor/clients" },
  { icon: FileText, label: "Session Reports", href: "/counsellor/reports" },
  { icon: DollarSign, label: "Earnings", href: "/counsellor/earnings" },
  { icon: Radio, label: "Events & Radio", href: "/counsellor/events" },
  { icon: Star, label: "Feedback", href: "/counsellor/feedback" },
  { icon: User, label: "My Profile", href: "/counsellor/profile" },
];

export default function CounsellorSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useUser();

  return (
    <aside className="h-screen sticky top-0 w-64 flex-shrink-0 bg-white border-r border-slate-100 flex flex-col">
      <div className="h-16 px-5 flex items-center border-b border-slate-100">
        <Link href="/">
          <Image src="/logo.svg" alt="Manokalpa" width={140} height={35} className="h-8 w-auto" />
        </Link>
      </div>

      {user && (
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-teal to-emerald-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-slate-900 truncate">{user.name}</div>
              <div className="text-xs text-brand-teal">Counsellor</div>
            </div>
          </div>
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
                    active ? "bg-brand-teal-pale text-brand-teal" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-slate-100">
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
