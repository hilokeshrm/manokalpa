"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Clock, XCircle, Download } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AdminPayment {
  id: string;
  amount: number;
  method: string;
  status: string;
  utr: string | null;
  createdAt: string;
  user: { name: string; email: string };
  appointment: {
    date: string;
    sessionType: string;
    counsellor: { name: string };
  } | null;
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  VERIFIED: { icon: CheckCircle2, color: "bg-green-50 text-green-600", label: "Verified" },
  PENDING: { icon: Clock, color: "bg-orange-50 text-orange-600", label: "Pending" },
  FAILED: { icon: XCircle, color: "bg-red-50 text-red-500", label: "Failed" },
  REFUNDED: { icon: XCircle, color: "bg-slate-100 text-slate-400", label: "Refunded" },
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/payments")
      .then((r) => r.json())
      .then((data) => setPayments(data.payments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const verifyPayment = async (id: string) => {
    setVerifying(id);
    await fetch("/api/admin/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "VERIFIED" }),
    });
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "VERIFIED" } : p))
    );
    setVerifying(null);
  };

  const totalVerified = payments.filter((p) => p.status === "VERIFIED").reduce((s, p) => s + p.amount, 0);
  const pendingCount = payments.filter((p) => p.status === "PENDING").length;
  const failedCount = payments.filter((p) => p.status === "FAILED").length;

  const exportCSV = () => {
    const headers = ["User", "Email", "Counsellor", "Amount (₹)", "Method", "UTR", "Status", "Date"];
    const rows = payments.map((p) => [
      p.user.name,
      p.user.email,
      p.appointment?.counsellor.name || "",
      Math.round(p.amount / 100),
      p.method,
      p.utr || "",
      p.status,
      new Date(p.createdAt).toLocaleDateString("en-IN"),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-500 text-sm">Transaction management & verification</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-green-50 text-green-700 rounded-2xl p-5">
          <div className="font-bold text-2xl">₹{Math.round(totalVerified / 100).toLocaleString("en-IN")}</div>
          <div className="text-sm opacity-70 mt-0.5">Total Verified</div>
        </div>
        <div className="bg-orange-50 text-orange-700 rounded-2xl p-5">
          <div className="font-bold text-2xl">{pendingCount}</div>
          <div className="text-sm opacity-70 mt-0.5">Pending Verification</div>
        </div>
        <div className="bg-red-50 text-red-600 rounded-2xl p-5">
          <div className="font-bold text-2xl">{failedCount}</div>
          <div className="text-sm opacity-70 mt-0.5">Failed Transactions</div>
        </div>
      </div>

      {/* Payment table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse h-12 bg-slate-50 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-medium">User</th>
                  <th className="text-left px-5 py-3 font-medium">Counsellor</th>
                  <th className="text-left px-5 py-3 font-medium">Amount</th>
                  <th className="text-left px-5 py-3 font-medium">Method</th>
                  <th className="text-left px-5 py-3 font-medium">UTR</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payments.map((p) => {
                  const S = statusConfig[p.status] || statusConfig.PENDING;
                  const StatusIcon = S.icon;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 font-medium text-slate-900">{p.user.name}</td>
                      <td className="px-5 py-4 text-slate-600">{p.appointment?.counsellor.name || "—"}</td>
                      <td className="px-5 py-4 font-semibold text-slate-900">₹{Math.round(p.amount / 100).toLocaleString("en-IN")}</td>
                      <td className="px-5 py-4">
                        <span className="badge bg-slate-100 text-slate-600 text-xs">{p.method}</span>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-400">{p.utr || "—"}</td>
                      <td className="px-5 py-4">
                        <span className={`badge text-xs flex items-center gap-1 w-fit ${S.color}`}>
                          <StatusIcon size={10} /> {S.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs">{formatDate(p.createdAt)}</td>
                      <td className="px-5 py-4">
                        {p.status === "PENDING" && (
                          <button
                            onClick={() => verifyPayment(p.id)}
                            disabled={verifying === p.id}
                            className="text-xs text-brand-teal border border-brand-teal/30 px-2.5 py-1 rounded-lg hover:bg-brand-teal-pale transition-colors disabled:opacity-50"
                          >
                            {verifying === p.id ? "..." : "Verify"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-400 text-sm">
                      No payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
