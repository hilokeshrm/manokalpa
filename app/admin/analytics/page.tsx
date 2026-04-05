"use client";

import { useState, useEffect } from "react";
import { Users, CalendarCheck, TrendingUp, BarChart3, BookOpen, Star } from "lucide-react";

interface AnalyticsData {
  userGrowth: { label: string; users: number; counsellors: number }[];
  appointmentsByMonth: { label: string; total: number; completed: number }[];
  revenueByMonth: { label: string; amount: number }[];
  assessmentBreakdown: { level: string; count: number }[];
  topContent: { id: string; title: string; type: string; views: number }[];
  topCounsellors: { name: string; rating: number; totalRatings: number; experience: number }[];
}

function BarChart({ data, valueKey, colorClass = "bg-brand-purple", maxOverride }: {
  data: { label: string; [k: string]: number | string }[];
  valueKey: string;
  colorClass?: string;
  maxOverride?: number;
}) {
  const max = maxOverride ?? Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d) => {
        const val = Number(d[valueKey]) || 0;
        const pct = Math.round((val / max) * 100);
        return (
          <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-slate-500">{val > 0 ? val : ""}</span>
            <div className="w-full rounded-t-lg relative" style={{ height: "80px" }}>
              <div
                className={`absolute bottom-0 w-full rounded-t-lg ${colorClass} transition-all duration-500`}
                style={{ height: `${Math.max(pct, val > 0 ? 4 : 0)}%` }}
              />
            </div>
            <span className="text-xs text-slate-400">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

const levelColor: Record<string, string> = {
  MINIMAL: "bg-green-500",
  MILD: "bg-yellow-400",
  MODERATE: "bg-orange-400",
  MODERATELY_SEVERE: "bg-red-400",
  SEVERE: "bg-red-700",
  UNKNOWN: "bg-slate-300",
};

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-8 bg-slate-100 rounded-xl w-48 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl border border-slate-100 h-24 animate-pulse" />)}
        </div>
      </div>
    );
  }

  const totalUsers = data?.userGrowth.reduce((s, m) => s + m.users, 0) ?? 0;
  const totalAppts = data?.appointmentsByMonth.reduce((s, m) => s + m.total, 0) ?? 0;
  const totalRevenue = data?.revenueByMonth.reduce((s, m) => s + m.amount, 0) ?? 0;
  const totalAssessments = data?.assessmentBreakdown.reduce((s, a) => s + a.count, 0) ?? 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 text-sm">Platform insights for the last 6 months</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "New Users", value: totalUsers, icon: Users, color: "text-brand-purple", bg: "bg-brand-purple-pale" },
          { label: "Appointments", value: totalAppts, icon: CalendarCheck, color: "text-brand-teal", bg: "bg-brand-teal-pale" },
          { label: "Revenue", value: `₹${Math.round(totalRevenue / 100).toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-50" },
          { label: "Assessments", value: totalAssessments, icon: BarChart3, color: "text-indigo-500", bg: "bg-indigo-50" },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon size={18} className={card.color} />
            </div>
            <p className="font-display text-2xl font-bold text-slate-900">{card.value}</p>
            <p className="text-slate-500 text-sm">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* User growth */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">User Growth</h3>
          {data && <BarChart data={data.userGrowth} valueKey="users" colorClass="bg-brand-purple" />}
          <div className="flex gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-3 h-3 rounded-sm bg-brand-purple inline-block" /> Users
            </span>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Monthly Revenue</h3>
          {data && (
            <BarChart
              data={data.revenueByMonth.map((m) => ({ ...m, amountK: Math.round(m.amount / 100) }))}
              valueKey="amountK"
              colorClass="bg-brand-teal"
            />
          )}
          <p className="text-xs text-slate-400 mt-3">Values in ₹</p>
        </div>

        {/* Appointments */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Appointments by Month</h3>
          {data && <BarChart data={data.appointmentsByMonth} valueKey="total" colorClass="bg-orange-400" />}
        </div>

        {/* Assessment breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Assessment Results Distribution</h3>
          {data && data.assessmentBreakdown.length === 0 ? (
            <p className="text-slate-400 text-sm">No assessment data yet.</p>
          ) : (
            <div className="space-y-3">
              {data?.assessmentBreakdown.map((item) => {
                const pct = totalAssessments > 0 ? Math.round((item.count / totalAssessments) * 100) : 0;
                return (
                  <div key={item.level}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 capitalize">{item.level.replace(/_/g, " ")}</span>
                      <span className="text-slate-500">{item.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${levelColor[item.level] || "bg-slate-400"} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top content */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <BookOpen size={16} className="text-brand-purple" /> Top Content
          </h3>
          {!data?.topContent.length ? (
            <p className="text-slate-400 text-sm">No content yet.</p>
          ) : (
            <div className="space-y-3">
              {data.topContent.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 text-xs flex items-center justify-center font-medium flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{c.title}</p>
                    <p className="text-xs text-slate-400">{c.type}</p>
                  </div>
                  <span className="text-xs text-slate-500 flex items-center gap-1 flex-shrink-0">
                    <Star size={10} className="text-yellow-400 fill-yellow-400" /> {c.views} views
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top counsellors */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Star size={16} className="text-yellow-400" /> Top Counsellors
          </h3>
          {!data?.topCounsellors.length ? (
            <p className="text-slate-400 text-sm">No counsellors yet.</p>
          ) : (
            <div className="space-y-3">
              {data.topCounsellors.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 text-xs flex items-center justify-center font-medium flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-teal to-emerald-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {c.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.experience}y exp</p>
                  </div>
                  <span className="text-xs font-semibold text-yellow-600 flex items-center gap-0.5 flex-shrink-0">
                    <Star size={10} className="fill-yellow-400 text-yellow-400" /> {c.rating.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
