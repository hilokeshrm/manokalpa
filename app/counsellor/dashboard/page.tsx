"use client";

import { useState, useEffect } from "react";
import { CalendarCheck, Users, Star, DollarSign, Clock, ArrowRight, CheckCircle2, Video } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/components/providers/UserProvider";

interface Appointment {
  id: string;
  date: string;
  time: string;
  sessionType: string;
  status: string;
  meetingLink: string | null;
  user: { id: string; name: string; avatar?: string | null };
  report: { id: string; status: string } | null;
}

interface EarningSummary {
  netPayable: number;
  sessions: number;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function CounsellorDashboard() {
  const { user } = useUser();
  const [todaySessions, setTodaySessions] = useState<Appointment[]>([]);
  const [pendingReports, setPendingReports] = useState<Appointment[]>([]);
  const [earningSummary, setEarningSummary] = useState<EarningSummary | null>(null);
  const [totalClients, setTotalClients] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/counsellor/appointments?date=today").then((r) => r.json()),
      fetch("/api/counsellor/appointments?status=COMPLETED").then((r) => r.json()),
      fetch("/api/counsellor/earnings").then((r) => r.json()),
      fetch("/api/counsellor/clients").then((r) => r.json()),
    ])
      .then(([todayData, completedData, earningsData, clientsData]) => {
        setTodaySessions(todayData.appointments || []);
        // Pending reports: completed appointments without a report
        const completed: Appointment[] = completedData.appointments || [];
        setPendingReports(completed.filter((a) => !a.report));
        setEarningSummary(earningsData.summary || null);
        setTotalClients(clientsData.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const nextSession = todaySessions.find((s) => s.status !== "COMPLETED" && s.status !== "CANCELLED");

  const stats = [
    { label: "Sessions This Month", value: loading ? "—" : String(earningSummary?.sessions ?? 0), icon: CalendarCheck, color: "bg-brand-teal-pale text-brand-teal" },
    { label: "Total Clients", value: loading ? "—" : String(totalClients), icon: Users, color: "bg-brand-purple-pale text-brand-purple" },
    { label: "Avg. Rating", value: user?.counsellor ? `${user.counsellor.rating.toFixed(1)}★` : "—", icon: Star, color: "bg-yellow-50 text-yellow-600" },
    {
      label: "Net Earnings (Month)",
      value: loading ? "—" : earningSummary ? `₹${Math.round(earningSummary.netPayable / 100).toLocaleString("en-IN")}` : "₹0",
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-brand-teal to-emerald-700 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-white/70 text-sm">{greeting()},</p>
          <h2 className="font-display text-2xl font-bold mb-2">{user?.name || "Counsellor"}</h2>
          <p className="text-white/70 text-sm">
            {loading
              ? "Loading your schedule..."
              : todaySessions.length > 0
              ? `You have ${todaySessions.length} session${todaySessions.length !== 1 ? "s" : ""} today${nextSession ? `. Next at ${nextSession.time}.` : "."}`
              : "No sessions scheduled for today."}
          </p>
          <div className="flex gap-3 mt-5">
            <Link href="/counsellor/appointments" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-brand-teal text-sm font-semibold hover:bg-brand-teal-pale transition-colors">
              <CalendarCheck size={15} /> View Schedule
            </Link>
            {pendingReports.length > 0 && (
              <Link href="/counsellor/reports" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/15 border border-white/25 text-white text-sm font-medium hover:bg-white/25 transition-colors">
                Pending Reports ({pendingReports.length})
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <div className="font-bold text-2xl text-slate-900">{value}</div>
            <div className="text-slate-500 text-xs">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's sessions */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Clock size={16} className="text-brand-teal" /> Today&apos;s Sessions
            </h3>
            <Link href="/counsellor/appointments" className="text-xs text-brand-teal flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="animate-pulse h-14 bg-slate-50 rounded-xl" />)}
            </div>
          ) : todaySessions.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No sessions today.</p>
          ) : (
            <div className="space-y-3">
              {todaySessions.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-brand-teal-pale">
                  <div className="w-9 h-9 rounded-xl bg-brand-teal flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {s.user.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 text-sm">{s.user.name}</div>
                    <div className="text-slate-500 text-xs">{s.sessionType.replace("_", " ")} · {s.time}</div>
                  </div>
                  {s.meetingLink ? (
                    <a href={s.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs bg-brand-teal text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1">
                      <Video size={11} /> Join
                    </a>
                  ) : (
                    <span className={`text-xs px-2 py-1 rounded-lg ${
                      s.status === "CONFIRMED" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                    }`}>{s.status}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending reports */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-orange-500" /> Pending Reports
            </h3>
            <Link href="/counsellor/reports" className="text-xs text-brand-purple flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="animate-pulse h-14 bg-slate-50 rounded-xl" />)}
            </div>
          ) : pendingReports.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">All reports submitted!</p>
          ) : (
            <div className="space-y-3">
              {pendingReports.slice(0, 4).map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                  <div>
                    <div className="font-medium text-slate-900 text-sm">{r.user.name}</div>
                    <div className="text-slate-400 text-xs">{r.sessionType.replace("_", " ")} · {new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                  </div>
                  <button className="text-xs text-brand-purple border border-brand-purple/30 px-3 py-1.5 rounded-lg hover:bg-brand-purple-pale transition-colors">
                    Write Report
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
