"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Clock, FileText, Eye, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface Report {
  id: string;
  status: string;
  sessionSummary: string | null;
  interventions: string[];
  nextSteps: string | null;
  supervisorNote: string | null;
  createdAt: string;
  updatedAt: string;
  counsellor: { name: string; email: string };
  appointment: { date: string; user: { name: string } } | null;
}

const STATUS_TABS = ["ALL", "SUBMITTED", "REVIEWED", "DRAFT"] as const;

const statusBadge: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-500",
  SUBMITTED: "bg-orange-50 text-orange-600",
  REVIEWED: "bg-green-50 text-green-600",
};

function ReportsContent() {
  const searchParams = useSearchParams();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<typeof STATUS_TABS[number]>(
    (searchParams.get("status") as typeof STATUS_TABS[number]) || "ALL"
  );
  const [selected, setSelected] = useState<Report | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = activeTab !== "ALL" ? `?status=${activeTab}` : "";
    fetch(`/api/supervisor/reports${params}`)
      .then((r) => r.json())
      .then((data) => setReports(data.reports || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeTab]);

  const openReport = (r: Report) => {
    setSelected(r);
    setNote(r.supervisorNote || "");
  };

  const handleReview = async () => {
    if (!selected) return;
    setSaving(true);
    const res = await fetch("/api/supervisor/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, supervisorNote: note }),
    });
    const data = await res.json();
    if (data.report) {
      setReports((prev) => prev.map((r) => r.id === selected.id ? { ...r, status: "REVIEWED", supervisorNote: note } : r));
      setSelected(null);
    }
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Session Reports</h1>
        <p className="text-slate-500 text-sm">Review and annotate counsellor session reports.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab ? "bg-brand-purple text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab === "ALL" ? "All Reports" : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-4">{[1, 2, 3].map((i) => <div key={i} className="animate-pulse h-14 bg-slate-50 rounded-xl" />)}</div>
        ) : reports.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">No reports found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-medium">Counsellor</th>
                <th className="text-left px-5 py-3 font-medium">Client</th>
                <th className="text-left px-5 py-3 font-medium">Session Date</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Updated</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-900">{r.counsellor.name}</td>
                  <td className="px-5 py-4 text-slate-600">{r.appointment?.user.name || "—"}</td>
                  <td className="px-5 py-4 text-slate-500 text-xs">
                    {r.appointment ? new Date(r.appointment.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge text-xs ${statusBadge[r.status] || "bg-slate-100 text-slate-500"}`}>{r.status}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-xs">
                    {new Date(r.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => openReport(r)}
                      className="flex items-center gap-1.5 text-xs text-brand-purple border border-brand-purple/30 px-2.5 py-1.5 rounded-lg hover:bg-brand-purple-pale transition-colors"
                    >
                      <Eye size={12} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Review modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="font-semibold text-slate-900">Session Report</h2>
                <p className="text-xs text-slate-400 mt-0.5">{selected.counsellor.name} → {selected.appointment?.user.name}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Summary</h3>
                <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 rounded-xl p-4">{selected.sessionSummary || "No summary provided."}</p>
              </div>

              {selected.interventions.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Interventions</h3>
                  <ul className="space-y-1">
                    {selected.interventions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <CheckCircle2 size={14} className="text-brand-teal mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selected.nextSteps && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Next Steps</h3>
                  <p className="text-slate-700 text-sm leading-relaxed">{selected.nextSteps}</p>
                </div>
              )}

              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Supervisor Note</h3>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full text-sm border border-slate-200 rounded-xl p-3 outline-none focus:border-brand-purple resize-none"
                  placeholder="Add your feedback or notes for this counsellor..."
                  disabled={selected.status === "REVIEWED"}
                />
              </div>

              {selected.status !== "REVIEWED" && (
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setSelected(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleReview}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-brand-purple text-white text-sm font-medium hover:bg-brand-purple/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={15} /> {saving ? "Saving..." : "Mark as Reviewed"}
                  </button>
                </div>
              )}
              {selected.status === "REVIEWED" && (
                <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 rounded-xl px-4 py-3">
                  <CheckCircle2 size={15} /> This report has been reviewed.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SupervisorReportsPage() {
  return (
    <Suspense fallback={<div className="p-6"><div className="animate-pulse h-8 bg-slate-100 rounded-xl w-48" /></div>}>
      <ReportsContent />
    </Suspense>
  );
}
