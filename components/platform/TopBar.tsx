"use client";

import Link from "next/link";
import { Bell, Search, ChevronDown } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { useUser } from "@/components/providers/UserProvider";

interface TopBarProps {
  pageTitle: string;
}

export default function TopBar({ pageTitle }: TopBarProps) {
  const { user } = useUser();
  const displayName = user?.name?.split(" ").slice(0, 2).join(" ") || "User";
  const roleLabel = user?.role
    ? user.role.charAt(0) + user.role.slice(1).toLowerCase()
    : "User";

  return (
    <header className="h-16 px-6 flex items-center justify-between bg-white border-b border-slate-100 sticky top-0 z-30">
      <h1 className="font-display font-bold text-slate-900 text-lg">{pageTitle}</h1>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-sm">
          <Search size={15} />
          <span>Search...</span>
          <span className="ml-8 px-1.5 py-0.5 rounded bg-slate-200 text-xs text-slate-500">⌘K</span>
        </div>

        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Bell size={17} />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand-purple text-white text-xs flex items-center justify-center leading-none">
            !
          </span>
        </Link>

        {/* User avatar */}
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-purple to-brand-teal flex items-center justify-center text-white text-xs font-bold">
            {getInitials(displayName)}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-sm font-medium text-slate-900 leading-none">{displayName}</div>
            <div className="text-xs text-slate-400 mt-0.5">{roleLabel}</div>
          </div>
          <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
        </div>
      </div>
    </header>
  );
}
