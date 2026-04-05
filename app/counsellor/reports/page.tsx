"use client";

import { useState, useEffect } from "react";
import { FileText, Plus, CheckCircle2, Clock, Edit2, X, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Report {
  id: string;
  status: string;
  sessionSummary: string | null;
  interventions: string[];
  nextSteps: string | null;
  supervisorNote: string | null;
  createdAt: string;
  user: { name: string; email: string };
  appointment: { id: string; date: string; sessionType: string } | null;
}

interface PendingAppt {
  id: string;
  date: string;
  sessionType: string;
  user: { name: string };
}

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT:     { label: "Draft",     color: "bg-slate-100 text-slate-500" },
  SUBMITTED: { label: "Submitted", color: "bg-brand-purple-pale text-brand-purple" },
  REVIEWED:  { label: "Reviewed",  color: "bg-green-50 text-green-600" },
};

const emptyForm = { appointmentId: "", sessionSummary: "", interventions: "", nextSteps: "", status: "DRAFT" };

export default function CounsellorReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [pending, setPending] = useState<PendingAppt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Report | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"All" | "DRAFT" | "SUBMITTED" | "REVIEWED">("All");

  const load = () => {
    setLoading(true);
    fetch("/api/counsellor/reports")
      .then((r) => r.json())
      .then((data) => {
        setReports(data.reports || []);
        setPending(data.completedWithoutReport || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = (apptId = "") => {
    setEditing(null);
    setForm({ ...emptyForm, appointmentId: apptId });
    setShowForm(true);
  };

  const openEdit = (r: Report) => {
    setEditing(r);
    setForm({
      appointmentId: r.appointment?.id || "",
      sessionSummary: r.sessionSummary || "",
      interventions: r.interventions.join("\n"),
      nextSteps: r.nextSteps || "",
      status: r.status,
    });
    setShowForm(true);
  };

  const handleSave = async (submitNow = false) => {
    if (!form.appointmentId && !editing) return;
    setSaving(true);
    try {
      const body = {
        sessionSummary: form.sessionSummary,
        interventions: form.interventions.split("\n").map((l) => l.trim()).filter(Boolean),
        nextSteps: form.nextSteps,
        status: submitNow ? "SUBMITTED" : form.status,
        ...(editing ? { id: editing.id } : { appointmentId: form.appointmentId }),
      };
      const res = await fetch("/api/counsellor/reports", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) { setShowForm(false); load(); }
    } finally { setSaving(false); }
  };

  const displayed = activeTab === "All" ? reports : reports.filter((r) => r.status === activeTab);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Session Reports</h1>
          <p className="text-slate-500 text-sm">{reports.length} reports written</p>
        </div>
        <button onClick={() => openCreate()} className="btn-primary !py-2 !text-sm gap-2">
          <Plus size={15} /> Write Report
        </button>
      </div>

      {/* Sessions needing a report */}
      {pending.length > 0 && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
          <p className="text-orange-700 text-sm font-semibold mb-3 flex items-center gap-2">
            <Clock size={14} /> {pending.length} completed session{pending.length > 1 ? "s" : ""} need a report
          </p>
          <div className="space-y-2">
            {pending.slice(0, 3).map((a) => (
              <div key={a.id} className="flex items-center justify-between bg-white rounded-xl p-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{a.user.name}</p>
                  <p className="text-xs text-slate-500">{formatDate(a.date)} · {a.sessionType.replace(/_/g, " ")}</p>
                </div>
                <button onClick={() => openCreate(a.id)} className="text-xs text-brand-purple font-medium hover:underline">
                  Write Report
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["All", "DRAFT", "SUBMITTED", "REVIEWED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab ? "bg-brand-teal text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-brand-teal/40"
            }`}
          >
            {tab === "All" ? "All" : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Reports list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-slate-100 h-20 animate-pulse" />)}
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <FileText size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No reports yet</p>
          <button onClick={() => openCreate()} className="btn-primary !py-2 !text-sm mt-4 inline-flex gap-2">
            <Plus size={14} /> Write First Report
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((r) => {
            const cfg = statusConfig[r.status] || statusConfig.DRAFT;
            return (
              <div key={r.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 text-sm">{r.user.name}</h3>
                      <span className={`badge text-xs ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    {r.appointment && (
                      <p className="text-xs text-slate-500 mb-2">
                        {formatDate(r.appointment.date)} · {r.appointment.sessionType.replace(/_/g, " ")}
                      </p>
                    )}
                    {r.sessionSummary && (
                      <p className="text-slate-500 text-xs line-clamp-2">{r.sessionSummary}</p>
                    )}
                    {r.supervisorNote && (
                      <div className="mt-2 p-2 bg-green-50 rounded-lg">
                        <p className="text-xs text-green-700"><strong>Supervisor:</strong> {r.supervisorNote}</p>
                      </div>
                    )}
                  </div>
                  {r.status !== "REVIEWED" && (
                    <button
                      onClick={() => openEdit(r)}
                      className="btn-secondary !py-1.5 !px-3 !text-xs flex items-center gap-1 flex-shrink-0"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Write / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-display text-lg font-bold text-slate-900">
                {editing ? "Edit Report" : "Write Session Report"}
              </h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <X size={15} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {!editing && (
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">Session *</label>
                  <select
                    value={form.appointmentId}
                    onChange={(e) => setForm((f) => ({ ...f, appointmentId: e.target.value }))}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-teal bg-white"
                  >
                    <option value="">Select a completed session</option>
                    {pending.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.user.name} — {formatDate(a.date)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">Session Summary</label>
                <textarea
                  value={form.sessionSummary}
                  onChange={(e) => setForm((f) => ({ ...f, sessionSummary: e.target.value }))}
                  rows={4}
                  placeholder="Describe what was discussed and the client's current state..."
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-teal resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">Interventions (one per line)</label>
                <textarea
                  value={form.interventions}
                  onChange={(e) => setForm((f) => ({ ...f, interventions: e.target.value }))}
                  rows={3}
                  placeholder={"CBT — thought reframing\nBreathing exercise — 4-7-8 technique\nJournaling assignment"}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-teal resize-none font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">Next Steps / Homework</label>
                <textarea
                  value={form.nextSteps}
                  onChange={(e) => setForm((f) => ({ ...f, nextSteps: e.target.value }))}
                  rows={2}
                  placeholder="What should the client work on before the next session?"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-teal resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="flex-1 btn-secondary justify-center disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="flex-1 btn-primary justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 size={14} /> {saving ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
