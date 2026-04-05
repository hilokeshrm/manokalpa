"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Download } from "lucide-react";

interface EarningEntry {
  id: string;
  totalAmount: number;
  counsellorShare: number;
  platformShare: number;
  tdsDeduction: number;
  netPayable: number;
  isPaid: boolean;
  createdAt: string;
  appointment: {
    id: string;
    date: string;
    sessionType: string;
    user: { name: string };
  } | null;
}

interface EarningSummary {
  totalGross: number;
  counsellorShare: number;
  platformShare: number;
  tdsDeduction: number;
  netPayable: number;
  sessions: number;
}

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<EarningEntry[]>([]);
  const [summary, setSummary] = useState<EarningSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/counsellor/earnings")
      .then((r) => r.json())
      .then((data) => {
        setEarnings(data.earnings || []);
        setSummary(data.summary || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const monthLabel = now.toLocaleString("default", { month: "long", year: "numeric" });

  const breakdownItems = summary
    ? [
        { label: "Total Gross Earnings", value: summary.totalGross, note: `From ${summary.sessions} sessions` },
        { label: "Counsellor Share (70%)", value: summary.counsellorShare, note: "Your share" },
        { label: "Manokalpa Share (30%)", value: summary.platformShare, note: "Platform commission" },
        { label: "TDS Deduction (10%)", value: summary.tdsDeduction, note: "On counsellor share" },
        { label: "Net Payable to You", value: summary.netPayable, note: "After TDS", highlight: true },
      ]
    : [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Earnings Dashboard</h1>
          <p className="text-slate-500 text-sm">{monthLabel} · {summary?.sessions ?? 0} sessions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">
          <Download size={15} /> Export Statement
        </button>
      </div>

      {/* Breakdown cards */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-3">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp size={17} className="text-brand-teal" /> Earnings Breakdown
        </h3>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse h-16 bg-slate-50 rounded-2xl" />
            ))}
          </div>
        ) : breakdownItems.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">No earnings this month yet.</p>
        ) : (
          breakdownItems.map(({ label, value, note, highlight }) => (
            <div
              key={label}
              className={`flex items-center justify-between p-4 rounded-2xl ${
                highlight ? "bg-green-50 border-2 border-green-200" : "bg-slate-50"
              }`}
            >
              <div>
                <div className={`font-medium text-sm ${highlight ? "text-green-700" : "text-slate-700"}`}>{label}</div>
                <div className="text-xs text-slate-400">{note}</div>
              </div>
              <div className={`font-bold text-lg ${highlight ? "text-green-700" : "text-slate-900"}`}>
                ₹{Math.round(value / 100).toLocaleString("en-IN")}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Session breakdown */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Session Earnings</h3>
        </div>
        {loading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-12 bg-slate-50 rounded-xl" />
            ))}
          </div>
        ) : earnings.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-12">No session earnings recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-50 text-slate-400 text-xs uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-medium">Client</th>
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                  <th className="text-left px-5 py-3 font-medium">Type</th>
                  <th className="text-right px-5 py-3 font-medium">Gross</th>
                  <th className="text-right px-5 py-3 font-medium">Your Share (70%)</th>
                  <th className="text-right px-5 py-3 font-medium">TDS</th>
                  <th className="text-right px-5 py-3 font-medium">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {earnings.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-900">{e.appointment?.user.name || "—"}</td>
                    <td className="px-5 py-4 text-slate-500 text-xs">
                      {e.appointment ? new Date(e.appointment.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className="badge bg-slate-100 text-slate-500 text-xs">
                        {e.appointment?.sessionType.replace("_", " ") || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-slate-600">₹{Math.round(e.totalAmount / 100).toLocaleString("en-IN")}</td>
                    <td className="px-5 py-4 text-right text-brand-teal font-medium">₹{Math.round(e.counsellorShare / 100).toLocaleString("en-IN")}</td>
                    <td className="px-5 py-4 text-right text-red-400 text-xs">-₹{Math.round(e.tdsDeduction / 100).toLocaleString("en-IN")}</td>
                    <td className="px-5 py-4 text-right font-bold text-slate-900">₹{Math.round(e.netPayable / 100).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
