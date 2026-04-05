"use client";

import { useState, useEffect } from "react";
import {
  Users, UserCheck, CalendarCheck, CreditCard,
  TrendingUp, TrendingDown, ArrowRight, AlertCircle,
  CheckCircle2, Clock
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

type Trend = "up" | "down" | "neutral";

interface AdminStats {
  totalUsers: number;
  totalCounsellors: number;
  pendingCounsellors: number;
  sessionsThisMonth: number;
  revenueThisMonth: number;
  recentUsers: { id: string; name: string; email: string; role: string; isActive: boolean; createdAt: string }[];
  pendingPayments: number;
  pendingEnquiries: number;
  pendingReports: number;
  monthlyRevenue: { month: string; value: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const maxRevenue = stats ? Math.max(...stats.monthlyRevenue.map((d) => d.value), 1) : 1;

  type Trend = "up" | "down" | "neutral";
  const statCards: { label: string; value: string; change: string; trend: Trend; icon: React.ElementType; color: string }[] = stats
    ? [
        { label: "Total Users",          value: stats.totalUsers.toLocaleString(),                                              change: "registered users",               trend: "neutral", icon: Users,        color: "bg-brand-purple-pale text-brand-purple" },
        { label: "Active Counsellors",   value: String(stats.totalCounsellors),                                                 change: `${stats.pendingCounsellors} pending verification`, trend: "neutral", icon: UserCheck,    color: "bg-brand-teal-pale text-brand-teal" },
        { label: "Sessions This Month",  value: String(stats.sessionsThisMonth),                                                change: "confirmed + completed",          trend: "up",      icon: CalendarCheck, color: "bg-blue-50 text-blue-600" },
        { label: "Revenue This Month",   value: `₹${Math.round(stats.revenueThisMonth / 100).toLocaleString("en-IN")}`,        change: "verified payments",              trend: "up",      icon: CreditCard,   color: "bg-amber-50 text-amber-600" },
      ]
    : [];

  const pendingTasks = stats
    ? [
        { label: "Counsellor profiles pending verification", count: stats.pendingCounsellors, href: "/admin/counsellors", color: "text-orange-600 bg-orange-50" },
        { label: "Payment verification required", count: stats.pendingPayments, href: "/admin/payments", color: "text-blue-600 bg-blue-50" },
        { label: "New contact enquiries", count: stats.pendingEnquiries, href: "/admin/enquiries", color: "text-brand-purple bg-brand-purple-pale" },
        { label: "Session reports awaiting review", count: stats.pendingReports, href: "/admin/reports", color: "text-brand-teal bg-brand-teal-pale" },
      ]
    : [];

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse h-28" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Admin Overview</h1>
          <p className="text-slate-500 text-sm mt-0.5">{formatDate(new Date().toISOString())} · Manokalpa Platform</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">Export Report</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, change, trend, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <div className="font-display font-bold text-2xl text-slate-900">{value}</div>
            <div className="text-slate-500 text-xs mb-1">{label}</div>
            <div className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-500" : "text-slate-400"}`}>
              {trend === "up" ? <TrendingUp size={11} /> : trend === "down" ? <TrendingDown size={11} /> : null}
              {change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-900 mb-5">Monthly Revenue</h3>
          <div className="flex items-end gap-3 h-32">
            {stats?.monthlyRevenue.map(({ month, value }) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-slate-500">₹{Math.round(value / 1000)}K</span>
                <div
                  className="w-full rounded-t-lg bg-brand-purple transition-all hover:opacity-80"
                  style={{ height: `${(value / maxRevenue) * 80}px`, minHeight: value > 0 ? "4px" : "0" }}
                />
                <span className="text-xs text-slate-400">{month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending tasks */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <AlertCircle size={16} className="text-orange-500" /> Action Required
          </h3>
          <div className="space-y-2">
            {pendingTasks.map(({ label, count, href, color }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <span className="text-slate-700 text-sm leading-snug flex-1">{label}</span>
                <span className={`badge text-xs ml-2 flex-shrink-0 ${color}`}>{count}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent users */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Recent Registrations</h3>
          <Link href="/admin/users" className="text-sm text-brand-purple flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="divide-y divide-slate-50">
          {stats?.recentUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-purple to-brand-teal flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user.name[0]}
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-900 text-sm">{user.name}</div>
                <div className="text-slate-400 text-xs">{user.email}</div>
              </div>
              <span className={`badge text-xs ${user.role === "COUNSELLOR" ? "bg-brand-teal-pale text-brand-teal" : "bg-slate-100 text-slate-500"}`}>
                {user.role}
              </span>
              <div className="flex items-center gap-1 text-xs">
                {user.isActive ? (
                  <CheckCircle2 size={13} className="text-green-500" />
                ) : (
                  <Clock size={13} className="text-orange-400" />
                )}
                <span className="text-slate-400">{formatDate(user.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
