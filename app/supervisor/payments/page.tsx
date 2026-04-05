"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Clock, XCircle, Banknote, Download, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Payment {
  id: string;
  amount: number;
  method: string;
  status: string;
  utr: string | null;
  createdAt: string;
  user: { name: string; email: string; mobile: string };
  appointment: {
    id: string;
    date: string;
    time: string;
    sessionType: string;
    status: string;
    counsellor: { name: string; email: string };
  } | null;
}

interface Summary {
  pending: number;
  verified: number;
  failed: number;
  totalVerifiedAmount: number;
}

const STATUS_TABS = ["All", "PENDING", "VERIFIED", "FAILED"] as const;

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  VERIFIED: { icon: CheckCircle2, color: "bg-green-50 text-green-600",   label: "Verified" },
  PENDING:  { icon: Clock,         color: "bg-orange-50 text-orange-600", label: "Pending"  },
  FAILED:   { icon: XCircle,       color: "bg-red-50 text-red-500",       label: "Rejected" },
  REFUNDED: { icon: XCircle,       color: "bg-slate-100 text-slate-400",  label: "Refunded" },
};

function formatSession(type: string) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function SupervisorPaymentsPage() {
  const [payments, setPayments]       = useState<Payment[]>([]);
  const [summary, setSummary]         = useState<Summary | null>(null);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState<typeof STATUS_TABS[number]>("All");
  const [acting, setActing]           = useState<string | null>(null);
  const [detailId, setDetailId]       = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeTab !== "All") params.set("status", activeTab);
    fetch(`/api/supervisor/payments?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setPayments(data.payments || []);
        if (activeTab === "All") setSummary(data.summary || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeTab]);

  const handleAction = async (id: string, status: "VERIFIED" | "FAILED") => {
    const label = status === "VERIFIED" ? "verify" : "reject";
    if (!confirm(`Are you sure you want to ${label} this payment?`)) return;
    setActing(id);
    try {
      const res = await fetch("/api/supervisor/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setPayments((prev) =>
          prev.map((p) => p.id === id ? { ...p, status } : p)
        );
        if (summary) {
          setSummary({
            ...summary,
            pending: summary.pending - 1,
            verified: status === "VERIFIED" ? summary.verified + 1 : summary.verified,
            failed:   status === "FAILED"   ? summary.failed   + 1 : summary.failed,
          });
        }
      }
    } finally {
      setActing(null);
    }
  };

  const exportCSV = () => {
    const headers = ["User", "Email", "Mobile", "Counsellor", "Session", "Date", "Amount (₹)", "Method", "UTR", "Status", "Submitted On"];
    const rows = payments.map((p) => [
      p.user.name, p.user.email, p.user.mobile,
      p.appointment?.counsellor.name || "",
      p.appointment ? formatSession(p.appointment.sessionType) : "",
      p.appointment ? new Date(p.appointment.date).toLocaleDateString("en-IN") : "",
      Math.round(p.amount / 100),
      p.method, p.utr || "",
      p.status,
      new Date(p.createdAt).toLocaleDateString("en-IN"),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const detailPayment = payments.find((p) => p.id === detailId);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Payment Verification</h1>
          <p className="text-slate-500 text-sm">Review and approve user payment submissions</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
        >
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="bg-orange-50 text-orange-700 rounded-2xl p-5">
            <div className="font-bold text-2xl">{summary.pending}</div>
            <div className="text-sm opacity-70 mt-0.5">Pending Review</div>
          </div>
          <div className="bg-green-50 text-green-700 rounded-2xl p-5">
            <div className="font-bold text-2xl">{summary.verified}</div>
            <div className="text-sm opacity-70 mt-0.5">Verified</div>
          </div>
          <div className="bg-red-50 text-red-600 rounded-2xl p-5">
            <div className="font-bold text-2xl">{summary.failed}</div>
            <div className="text-sm opacity-70 mt-0.5">Rejected</div>
          </div>
          <div className="bg-brand-purple-pale text-brand-purple rounded-2xl p-5">
            <div className="font-bold text-2xl">
              ₹{Math.round(summary.totalVerifiedAmount / 100).toLocaleString("en-IN")}
            </div>
            <div className="text-sm opacity-70 mt-0.5">Total Verified</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-brand-purple text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-brand-purple/40"
            }`}
          >
            {tab === "All" ? "All Payments" : statusConfig[tab]?.label ?? tab}
            {tab === "PENDING" && summary?.pending ? (
              <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5">{summary.pending}</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-14 bg-slate-50 rounded-xl" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="py-16 text-center">
            <Banknote size={36} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No payments found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-medium">User</th>
                  <th className="text-left px-5 py-3 font-medium">Counsellor</th>
                  <th className="text-left px-5 py-3 font-medium">Session</th>
                  <th className="text-left px-5 py-3 font-medium">Amount</th>
                  <th className="text-left px-5 py-3 font-medium">Method / UTR</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Submitted</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payments.map((p) => {
                  const S = statusConfig[p.status] || statusConfig.PENDING;
                  const Icon = S.icon;
                  const isPending = p.status === "PENDING";
                  return (
                    <tr key={p.id} className={`transition-colors ${isPending ? "bg-orange-50/30 hover:bg-orange-50/60" : "hover:bg-slate-50"}`}>
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">{p.user.name}</div>
                        <div className="text-xs text-slate-400">{p.user.mobile}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {p.appointment?.counsellor.name || "—"}
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs">
                        {p.appointment ? (
                          <>
                            <div>{formatSession(p.appointment.sessionType)}</div>
                            <div className="text-slate-400">
                              {new Date(p.appointment.date).toLocaleDateString("en-IN")} · {p.appointment.time}
                            </div>
                          </>
                        ) : "—"}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        ₹{Math.round(p.amount / 100).toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs">
                          <span className="badge bg-slate-100 text-slate-600 mb-1">{p.method}</span>
                        </div>
                        {p.utr && (
                          <div className="font-mono text-xs text-slate-400 mt-0.5">{p.utr}</div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge text-xs flex items-center gap-1 w-fit ${S.color}`}>
                          <Icon size={10} /> {S.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs">
                        {formatDate(p.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {/* Detail view */}
                          <button
                            onClick={() => setDetailId(p.id === detailId ? null : p.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-purple hover:bg-brand-purple-pale transition-colors"
                            title="View details"
                          >
                            <Eye size={14} />
                          </button>
                          {/* Verify */}
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleAction(p.id, "VERIFIED")}
                                disabled={acting === p.id}
                                className="text-xs bg-brand-teal text-white px-3 py-1.5 rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
                              >
                                {acting === p.id ? "…" : "Verify"}
                              </button>
                              <button
                                onClick={() => handleAction(p.id, "FAILED")}
                                disabled={acting === p.id}
                                className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inline detail drawer */}
      {detailPayment && (
        <div className="bg-white rounded-2xl border border-brand-purple/20 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Payment Detail</h3>
            <button onClick={() => setDetailId(null)} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-3 text-sm">
            {[
              { label: "User Name",        value: detailPayment.user.name },
              { label: "Email",            value: detailPayment.user.email },
              { label: "Mobile",           value: detailPayment.user.mobile },
              { label: "Counsellor",       value: detailPayment.appointment?.counsellor.name || "—" },
              { label: "Session Type",     value: detailPayment.appointment ? formatSession(detailPayment.appointment.sessionType) : "—" },
              { label: "Session Date",     value: detailPayment.appointment ? new Date(detailPayment.appointment.date).toLocaleDateString("en-IN") : "—" },
              { label: "Session Time",     value: detailPayment.appointment?.time || "—" },
              { label: "Amount Paid",      value: `₹${Math.round(detailPayment.amount / 100).toLocaleString("en-IN")}` },
              { label: "Payment Method",   value: detailPayment.method },
              { label: "UTR / Ref No.",    value: detailPayment.utr || "—" },
              { label: "Payment Status",   value: detailPayment.status },
              { label: "Appointment Status", value: detailPayment.appointment?.status || "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-400 text-xs">{label}</span>
                <span className="font-medium text-slate-900 font-mono text-xs">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
