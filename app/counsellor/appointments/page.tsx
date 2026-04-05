"use client";

import { useState, useEffect } from "react";
import { CalendarCheck, Clock, Video, CheckCircle2, XCircle, User, Banknote, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Appointment {
  id: string;
  date: string;
  time: string;
  sessionType: string;
  status: string;
  meetingLink: string | null;
  notes: string | null;
  user: { id: string; name: string; email: string; avatar?: string | null };
  payment: { id: string; status: string; amount: number; utr?: string | null; method?: string | null } | null;
  report: { id: string; status: string } | null;
}

const STATUS_TABS = ["All", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;

const statusConfig: Record<string, { color: string; label: string; icon: React.ElementType }> = {
  PENDING: { color: "bg-orange-50 text-orange-600", label: "Pending", icon: Clock },
  CONFIRMED: { color: "bg-brand-purple-pale text-brand-purple", label: "Confirmed", icon: CalendarCheck },
  COMPLETED: { color: "bg-green-50 text-green-600", label: "Completed", icon: CheckCircle2 },
  CANCELLED: { color: "bg-slate-100 text-slate-400", label: "Cancelled", icon: XCircle },
  NO_SHOW: { color: "bg-red-50 text-red-500", label: "No Show", icon: XCircle },
};

export default function CounsellorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<typeof STATUS_TABS[number]>("All");
  const [updating, setUpdating] = useState<string | null>(null);
  const [verifyingPayment, setVerifyingPayment] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeTab !== "All") params.set("status", activeTab);
    fetch(`/api/counsellor/appointments?${params}`)
      .then((r) => r.json())
      .then((data) => setAppointments(data.appointments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeTab]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await fetch("/api/counsellor/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
    } finally {
      setUpdating(null);
    }
  };

  const handlePaymentAction = async (paymentId: string, apptId: string, status: "VERIFIED" | "FAILED") => {
    setVerifyingPayment(paymentId);
    try {
      await fetch("/api/counsellor/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: paymentId, status }),
      });
      setAppointments((prev) =>
        prev.map((a) => {
          if (a.id !== apptId) return a;
          return {
            ...a,
            status: status === "VERIFIED" ? "CONFIRMED" : a.status,
            payment: a.payment ? { ...a.payment, status } : a.payment,
          };
        })
      );
    } finally {
      setVerifyingPayment(null);
    }
  };

  const counts = {
    All: appointments.length,
    PENDING: appointments.filter((a) => a.status === "PENDING").length,
    CONFIRMED: appointments.filter((a) => a.status === "CONFIRMED").length,
    COMPLETED: appointments.filter((a) => a.status === "COMPLETED").length,
    CANCELLED: appointments.filter((a) => a.status === "CANCELLED").length,
  };

  const displayed = activeTab === "All" ? appointments : appointments.filter((a) => a.status === activeTab);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">My Schedule</h1>
        <p className="text-slate-500 text-sm mt-0.5">{appointments.length} total appointments</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-brand-teal text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-brand-teal/40"
            }`}
          >
            {tab === "All" ? "All" : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <CalendarCheck size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500">No {activeTab === "All" ? "" : activeTab.toLowerCase()} appointments.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map((appt) => {
            const cfg = statusConfig[appt.status] || statusConfig.PENDING;
            const StatusIcon = cfg.icon;
            return (
              <div key={appt.id} className={`bg-white rounded-2xl border p-5 ${
                appt.payment?.status === "PENDING" ? "border-orange-200" : "border-slate-100"
              }`}>
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Client avatar */}
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-teal to-emerald-600 flex items-center justify-center text-white text-base font-bold flex-shrink-0">
                    {appt.user.name[0]}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{appt.user.name}</h3>
                      <span className={`badge text-xs flex items-center gap-1 ${cfg.color}`}>
                        <StatusIcon size={10} /> {cfg.label}
                      </span>
                      {appt.payment?.status === "VERIFIED" && (
                        <span className="badge text-xs bg-green-50 text-green-600 flex items-center gap-1">
                          <CheckCircle2 size={10} /> Payment Verified
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-sm mb-2">{appt.sessionType.replace(/_/g, " ")}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <CalendarCheck size={11} /> {formatDate(appt.date)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={11} /> {appt.time}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User size={11} /> {appt.user.email}
                      </span>
                    </div>
                    {appt.notes && (
                      <p className="text-slate-400 text-xs mt-2 italic">&ldquo;{appt.notes}&rdquo;</p>
                    )}

                    {/* Payment review panel */}
                    {appt.payment?.status === "PENDING" && appt.payment.utr && (
                      <div className="mt-3 p-3 rounded-xl bg-orange-50 border border-orange-100 space-y-2">
                        <p className="text-orange-700 text-xs font-semibold flex items-center gap-1.5">
                          <AlertCircle size={12} /> Payment submitted — review before confirming
                        </p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          <span className="text-slate-500">Amount</span>
                          <span className="font-semibold text-slate-900">₹{Math.round(appt.payment.amount / 100).toLocaleString("en-IN")}</span>
                          <span className="text-slate-500">Method</span>
                          <span className="text-slate-700">{appt.payment.method || "—"}</span>
                          <span className="text-slate-500">UTR / Ref No.</span>
                          <span className="font-mono text-slate-900">{appt.payment.utr}</span>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handlePaymentAction(appt.payment!.id, appt.id, "VERIFIED")}
                            disabled={verifyingPayment === appt.payment.id}
                            className="flex-1 text-xs bg-green-600 text-white px-3 py-2 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 size={12} /> {verifyingPayment === appt.payment.id ? "..." : "Approve & Confirm"}
                          </button>
                          <button
                            onClick={() => handlePaymentAction(appt.payment!.id, appt.id, "FAILED")}
                            disabled={verifyingPayment === appt.payment.id}
                            className="text-xs border border-red-200 text-red-500 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            <XCircle size={12} /> Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex flex-col gap-2">
                    {appt.status === "PENDING" && !appt.payment && (
                      <button
                        onClick={() => updateStatus(appt.id, "CONFIRMED")}
                        disabled={updating === appt.id}
                        className="text-xs bg-brand-teal text-white px-3 py-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {updating === appt.id ? "..." : "Confirm"}
                      </button>
                    )}
                    {appt.status === "CONFIRMED" && appt.meetingLink && (
                      <a href={appt.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs bg-brand-teal text-white px-3 py-2 rounded-xl hover:opacity-90 transition-opacity inline-flex items-center gap-1 justify-center">
                        <Video size={12} /> Join
                      </a>
                    )}
                    {appt.status === "CONFIRMED" && (
                      <button
                        onClick={() => updateStatus(appt.id, "COMPLETED")}
                        disabled={updating === appt.id}
                        className="text-xs border border-green-300 text-green-600 px-3 py-2 rounded-xl hover:bg-green-50 transition-colors disabled:opacity-50"
                      >
                        Mark Complete
                      </button>
                    )}
                    {(appt.status === "PENDING" || appt.status === "CONFIRMED") && (
                      <button
                        onClick={() => updateStatus(appt.id, "CANCELLED")}
                        disabled={updating === appt.id}
                        className="text-xs border border-slate-200 text-slate-400 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                    {appt.status === "COMPLETED" && !appt.report && (
                      <button className="text-xs text-brand-purple border border-brand-purple/30 px-3 py-2 rounded-xl hover:bg-brand-purple-pale transition-colors">
                        Write Report
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
