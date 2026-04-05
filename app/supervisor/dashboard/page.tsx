"use client";

import { useState, useEffect } from "react";
import { FileText, CheckCircle2, Clock, Users, AlertCircle, CreditCard, Banknote } from "lucide-react";
import Link from "next/link";

interface Stats {
  totalReports: number;
  pendingReports: number;
  submittedReports: number;
  reviewedReports: number;
  totalCounsellors: number;
}

interface RecentReport {
  id: string;
  status: string;
  updatedAt: string;
  counsellor: { name: string };
  appointment: { user: { name: string } } | null;
}

interface PendingPayment {
  id: string;
  amount: number;
  method: string;
  utr: string | null;
  createdAt: string;
  user: { name: string };
  appointment: { date: string; counsellor: { name: string } } | null;
}

export default function SupervisorDashboard() {
  const [stats, setStats]               = useState<Stats | null>(null);
  const [recent, setRecent]             = useState<RecentReport[]>([]);
  const [pendingPayments, setPending]   = useState<PendingPayment[]>([]);
  const [loading, setLoading]           = useState(true);
  const [acting, setActing]             = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/supervisor/stats").then((r) => r.json()),
      fetch("/api/supervisor/payments?status=PENDING").then((r) => r.json()),
    ])
      .then(([statsData, paymentsData]) => {
        setStats(statsData.stats);
        setRecent(statsData.recentSubmitted || []);
        setPending((paymentsData.payments || []).slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePaymentAction = async (id: string, status: "VERIFIED" | "FAILED") => {
    if (!confirm(`${status === "VERIFIED" ? "Verify" : "Reject"} this payment?`)) return;
    setActing(id);
    try {
      const res = await fetch("/api/supervisor/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) setPending((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setActing(null);
    }
  };

  const statCards = stats
    ? [
        { label: "Pending Payments",  value: pendingPayments.length, icon: CreditCard,   color: "bg-orange-50 text-orange-600",       href: "/supervisor/payments"                          },
        { label: "Awaiting Review",   value: stats.submittedReports, icon: AlertCircle,  color: "bg-yellow-50 text-yellow-600",       href: "/supervisor/reports?status=SUBMITTED"          },
        { label: "Reviewed",          value: stats.reviewedReports,  icon: CheckCircle2, color: "bg-green-50 text-green-600",         href: "/supervisor/reports?status=REVIEWED"           },
        { label: "Draft Reports",     value: stats.pendingReports,   icon: Clock,        color: "bg-slate-50 text-slate-500",         href: "/supervisor/reports?status=DRAFT"              },
        { label: "Active Counsellors",value: stats.totalCounsellors, icon: Users,        color: "bg-brand-purple-pale text-brand-purple", href: "/supervisor/counsellors"                   },
      ]
    : [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Supervisor Overview</h1>
        <p className="text-slate-500 text-sm">Monitor payments, session reports and counsellor quality.</p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid sm:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="animate-pulse bg-white rounded-2xl border border-slate-100 h-24" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-5 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, href }) => (
            <Link key={label} href={href} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-sm transition-shadow">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon size={18} />
              </div>
              <div className="text-2xl font-bold text-slate-900">{value}</div>
              <div className="text-slate-500 text-sm mt-0.5">{label}</div>
            </Link>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">

        {/* Pending Payments */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Banknote size={16} className="text-orange-500" /> Pending Payments
            </h2>
            <Link href="/supervisor/payments" className="text-sm text-brand-purple hover:underline">View all</Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="animate-pulse h-12 bg-slate-50 rounded-xl" />)}
            </div>
          ) : pendingPayments.length === 0 ? (
            <div className="py-6 text-center">
              <CheckCircle2 size={28} className="text-green-300 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">All payments verified</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-900 truncate">{p.user.name}</div>
                    <div className="text-xs text-slate-400">
                      ₹{Math.round(p.amount / 100).toLocaleString("en-IN")} · {p.method}
                      {p.utr && <span className="font-mono ml-1 text-slate-300">· {p.utr.slice(0, 10)}…</span>}
                    </div>
                  </div>
                  <div className="flex gap-1.5 ml-3 flex-shrink-0">
                    <button
                      onClick={() => handlePaymentAction(p.id, "VERIFIED")}
                      disabled={acting === p.id}
                      className="text-xs bg-brand-teal text-white px-2.5 py-1 rounded-lg hover:bg-teal-600 disabled:opacity-50 transition-colors"
                    >
                      {acting === p.id ? "…" : "Verify"}
                    </button>
                    <button
                      onClick={() => handlePaymentAction(p.id, "FAILED")}
                      disabled={acting === p.id}
                      className="text-xs border border-red-200 text-red-500 px-2.5 py-1 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reports awaiting review */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <FileText size={16} className="text-yellow-500" /> Reports Awaiting Review
            </h2>
            <Link href="/supervisor/reports" className="text-sm text-brand-purple hover:underline">View all</Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="animate-pulse h-12 bg-slate-50 rounded-xl" />)}
            </div>
          ) : recent.length === 0 ? (
            <div className="py-6 text-center">
              <CheckCircle2 size={28} className="text-green-300 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No reports awaiting review</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {r.counsellor.name}
                      <span className="text-slate-400 font-normal"> → {r.appointment?.user.name || "Unknown"}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Submitted {new Date(r.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                  <Link
                    href="/supervisor/reports"
                    className="text-xs text-brand-purple border border-brand-purple/30 px-3 py-1.5 rounded-lg hover:bg-brand-purple-pale transition-colors flex-shrink-0 ml-3"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
