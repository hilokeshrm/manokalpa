"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarCheck, BookOpen, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
  { icon: CalendarCheck, label: "Sessions", href: "/appointments" },
  { icon: BookOpen, label: "Journal", href: "/journal" },
  { icon: MessageCircle, label: "Chat", href: "/chat" },
  { icon: User, label: "Profile", href: "/profile" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-40 safe-area-inset-bottom">
      <div className="flex">
        {items.map(({ icon: Icon, label, href }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors",
                active ? "text-brand-purple" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
