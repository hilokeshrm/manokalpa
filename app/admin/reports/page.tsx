"use client";

import { useState, useEffect } from "react";
import { FileText, CheckCircle2, Clock, AlertCircle, Eye, X, ChevronDown } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface SessionReport {
  id: string;
  status: string;
  sessionSummary: string | null;
  interventions: string[];
  nextSteps: string | null;
  supervisorNote: string | null;
  createdAt: string;
  user: { name: string; email: string };
  counsellor: { name: string };
  appointment: { date: string; sessionType: string } | null;
}

interface Summary { status: string; _count: { id: number } }

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  DRAFT:     { label: "Draft",     color: "bg-slate-100 text-slate-500",         icon: FileText },
  SUBMITTED: { label: "Submitted", color: "bg-brand-purple-pale text-brand-purple", icon: Clock },
  REVIEWED:  { label: "Reviewed",  color: "bg-green-50 text-green-600",           icon: CheckCircle2 },
};

const STATUS_TABS = ["All", "SUBMITTED", "DRAFT", "REVIEWED"] as const;

export default function AdminReportsPage() {
  const [reports, setReports] = useState<SessionReport[]>([]);
  const [summary, setSummary] = useState<Summary[]>([]);
  const [activeTab, setActiveTab] = useState<typeof STATUS_TABS[number]>("All");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SessionReport | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeTab !== "All") params.set("status", activeTab);
    fetch(`/api/admin/reports?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setReports(data.reports || []);
        setSummary(data.summary || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [activeTab]); // eslint-disable-line

  const getCount = (s: string) => summary.find((x) => x.status === s)?._count.id ?? 0;

  const handleMarkReviewed = async (id: string) => {
    setSavingNote(true);
    await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "REVIEWED", supervisorNote: noteInput }),
    });
    setSavingNote(false);
    setSelected(null);
    setNoteInput("");
    load();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Session Reports</h1>
        <p className="text-slate-500 text-sm">{reports.length} reports</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { key: "SUBMITTED", label: "Awaiting Review", icon: Clock, color: "text-brand-purple", bg: "bg-brand-purple-pale" },
          { key: "REVIEWED",  label: "Reviewed",        icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
          { key: "DRAFT",     label: "Drafts",          icon: FileText, color: "text-slate-500", bg: "bg-slate-100" },
        ].map((s) => (
          <div key={s.key} className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={16} className={s.color} />
            </div>
            <p className="font-display text-2xl font-bold text-slate-900">{getCount(s.key)}</p>
            <p className="text-slate-500 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab ? "bg-brand-purple text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab === "All" ? "All" : tab.charAt(0) + tab.slice(1).toLowerCase()}
            {tab !== "All" && getCount(tab) > 0 && (
              <span className="ml-2 bg-white/20 text-xs px-1.5 py-0.5 rounded-md">{getCount(tab)}</span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-slate-100 h-20 animate-pulse" />)}
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <FileText size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500">No reports found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => {
            const cfg = statusConfig[r.status] || statusConfig.DRAFT;
            const StatusIcon = cfg.icon;
            return (
              <div key={r.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 text-sm">
                        {r.user.name} <span className="text-slate-400 font-normal">with</span> {r.counsellor.name}
                      </h3>
                      <span className={`badge text-xs flex items-center gap-1 ${cfg.color}`}>
                        <StatusIcon size={10} /> {cfg.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      {r.appointment && (
                        <span>{formatDate(r.appointment.date)} · {r.appointment.sessionType.replace(/_/g, " ")}</span>
                      )}
                      <span>Submitted {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    </div>
                    {r.sessionSummary && (
                      <p className="text-slate-500 text-xs mt-2 line-clamp-2">{r.sessionSummary}</p>
                    )}
                  </div>
                  <button
                    onClick={() => { setSelected(r); setNoteInput(r.supervisorNote || ""); }}
                    className="btn-secondary !py-1.5 !px-3 !text-xs flex items-center gap-1 flex-shrink-0"
                  >
                    <Eye size={12} /> View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Report Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">Session Report</h2>
                <p className="text-slate-500 text-sm mt-0.5">{selected.user.name} · {selected.counsellor.name}</p>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <X size={15} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {selected.appointment && (
                <div className="flex gap-4 text-sm text-slate-500">
                  <span>{formatDate(selected.appointment.date)}</span>
                  <span>{selected.appointment.sessionType.replace(/_/g, " ")}</span>
                </div>
              )}

              {selected.sessionSummary && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Session Summary</p>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3">{selected.sessionSummary}</p>
                </div>
              )}

              {selected.interventions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Interventions</p>
                  <ul className="space-y-1">
                    {selected.interventions.map((item, i) => (
                      <li key={i} className="text-sm text-slate-700 flex gap-2">
                        <span className="text-brand-teal">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selected.nextSteps && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Next Steps</p>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3">{selected.nextSteps}</p>
                </div>
              )}

              {selected.status !== "REVIEWED" && (
                <div className="border-t border-slate-100 pt-4">
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">Supervisor Note (optional)</label>
                  <textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    rows={3}
                    placeholder="Add feedback or notes for the counsellor..."
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-purple resize-none"
                  />
                  <button
                    onClick={() => handleMarkReviewed(selected.id)}
                    disabled={savingNote}
                    className="btn-primary w-full justify-center mt-3 disabled:opacity-50"
                  >
                    {savingNote ? "Saving..." : "Mark as Reviewed"}
                  </button>
                </div>
              )}

              {selected.supervisorNote && selected.status === "REVIEWED" && (
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Supervisor Note</p>
                  <p className="text-sm text-slate-700 bg-green-50 rounded-xl p-3">{selected.supervisorNote}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
