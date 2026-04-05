"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/platform/TopBar";
import { CalendarCheck, Clock, Video, Plus, Star, Copy, CheckCircle2, X, Banknote, AlertCircle } from "lucide-react";
import Link from "next/link";
import { formatDate, formatTime } from "@/lib/utils";
import { BANK_DETAILS } from "@/lib/bankDetails";

interface Appointment {
  id: string;
  date: string;
  time: string;
  duration: number;
  sessionType: string;
  status: string;
  meetingLink?: string | null;
  counsellor: {
    id: string;
    name: string;
    avatar?: string | null;
    counsellor?: { expertise: string[]; consultationFee: number } | null;
  };
  payment?: { amount: number; status: string; utr?: string | null } | null;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "Pending",   color: "bg-yellow-50 text-yellow-600" },
  CONFIRMED: { label: "Upcoming",  color: "bg-brand-purple-pale text-brand-purple" },
  COMPLETED: { label: "Completed", color: "bg-brand-teal-pale text-brand-teal" },
  CANCELLED: { label: "Cancelled", color: "bg-red-50 text-red-500" },
  NO_SHOW:   { label: "No Show",   color: "bg-slate-100 text-slate-500" },
};

const PAYMENT_METHODS = [
  { value: "UPI",         label: "UPI Transfer" },
  { value: "NET_BANKING", label: "Net Banking (NEFT/IMPS/RTGS)" },
  { value: "CARD",        label: "Card Payment" },
  { value: "WALLET",      label: "Wallet" },
];

const TABS = ["All", "Upcoming", "Completed", "Cancelled"] as const;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="ml-1 text-slate-400 hover:text-brand-purple transition-colors">
      {copied ? <CheckCircle2 size={13} className="text-green-500" /> : <Copy size={13} />}
    </button>
  );
}

interface PayModalProps {
  appointment: Appointment;
  onClose: () => void;
  onSuccess: (apptId: string) => void;
}

function PayModal({ appointment, onClose, onSuccess }: PayModalProps) {
  const fee = appointment.counsellor.counsellor?.consultationFee ?? 800;
  const [method, setMethod] = useState("UPI");
  const [utr, setUtr] = useState("");
  const [amount, setAmount] = useState(String(fee));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!utr.trim()) { setError("Please enter the transaction / UTR number."); return; }
    if (!amount || Number(amount) <= 0) { setError("Please enter the payment amount."); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: appointment.id, method, utr: utr.trim(), amount: Number(amount) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to submit. Please try again."); return; }
      onSuccess(appointment.id);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">Submit Payment</h2>
            <p className="text-slate-500 text-sm mt-0.5">Session with {appointment.counsellor.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Amount due */}
          <div className="bg-brand-purple-pale rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Amount Due</p>
              <p className="font-display text-2xl font-bold text-brand-purple">₹{fee.toLocaleString("en-IN")}</p>
              <p className="text-slate-400 text-xs mt-0.5">{appointment.sessionType.replace(/_/g, " ")}</p>
            </div>
            <Banknote size={32} className="text-brand-purple/30" />
          </div>

          {/* Bank details */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Transfer To</p>

            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Account Name</span>
              <span className="text-sm font-medium text-slate-900">{BANK_DETAILS.accountName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Account No.</span>
              <span className="text-sm font-mono text-slate-900 flex items-center">
                {BANK_DETAILS.accountNumber}
                <CopyButton text={BANK_DETAILS.accountNumber} />
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">IFSC Code</span>
              <span className="text-sm font-mono text-slate-900 flex items-center">
                {BANK_DETAILS.ifsc}
                <CopyButton text={BANK_DETAILS.ifsc} />
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Bank & Branch</span>
              <span className="text-sm text-slate-900">{BANK_DETAILS.bank}, {BANK_DETAILS.branch}</span>
            </div>
            <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center">
              <span className="text-xs text-slate-500">UPI ID</span>
              <span className="text-sm font-mono text-brand-purple flex items-center">
                {BANK_DETAILS.upiId}
                <CopyButton text={BANK_DETAILS.upiId} />
              </span>
            </div>
          </div>

          {/* Payment form */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Payment Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-purple bg-white"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">
                UTR / Transaction Reference No. <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="e.g. UTR123456789012 or UPI Ref No."
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-purple"
              />
              <p className="text-slate-400 text-xs mt-1">Find this in your bank app under transaction history.</p>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">
                Amount Paid (₹) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-purple"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-xs">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" /> {error}
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary w-full justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Payment Details"}
          </button>

          <p className="text-center text-slate-400 text-xs">
            Your appointment will be confirmed once the payment is verified by our team (usually within a few hours).
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("All");
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [payingAppt, setPayingAppt] = useState<Appointment | null>(null);

  useEffect(() => {
    fetch("/api/appointments")
      .then((r) => r.json())
      .then((data) => setAppointments(data.appointments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this appointment?")) return;
    setCancelling(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      if (res.ok) {
        setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: "CANCELLED" } : a));
      }
    } finally {
      setCancelling(null);
    }
  };

  // After payment submitted: update local state to show "pending verification" badge
  const handlePaymentSuccess = (apptId: string) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === apptId
          ? { ...a, payment: { ...(a.payment ?? { amount: 0, status: "" }), status: "PENDING" } }
          : a
      )
    );
    setPayingAppt(null);
  };

  const filtered = appointments.filter((a) => {
    if (activeTab === "All") return true;
    if (activeTab === "Upcoming") return ["PENDING", "CONFIRMED"].includes(a.status);
    if (activeTab === "Completed") return a.status === "COMPLETED";
    if (activeTab === "Cancelled") return a.status === "CANCELLED";
    return true;
  });

  return (
    <>
      <TopBar pageTitle="Appointments" />

      {payingAppt && (
        <PayModal
          appointment={payingAppt}
          onClose={() => setPayingAppt(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2 flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-brand-purple text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-brand-purple/40"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <Link href="/appointments/book" className="btn-primary !py-2 !text-sm gap-2">
            <Plus size={15} /> Book Session
          </Link>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse h-24" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <CalendarCheck size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No appointments found</p>
            <p className="text-slate-400 text-sm mt-1">
              {activeTab === "All" ? "Book your first session to get started." : `No ${activeTab.toLowerCase()} appointments.`}
            </p>
            {activeTab === "All" && (
              <Link href="/appointments/book" className="btn-primary !py-2 !text-sm mt-4 inline-flex">
                Book a Session
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((appt) => {
              const statusInfo = statusConfig[appt.status] || statusConfig.PENDING;
              const isUpcoming = ["PENDING", "CONFIRMED"].includes(appt.status);
              const needsPayment = appt.status === "PENDING" && !appt.payment;
              const paymentPending = appt.status === "PENDING" && appt.payment?.status === "PENDING";
              const paymentFailed = appt.payment?.status === "FAILED";

              return (
                <div
                  key={appt.id}
                  className={`bg-white rounded-2xl border p-5 hover:shadow-sm transition-all ${
                    needsPayment ? "border-orange-200 shadow-orange-50" : "border-slate-100"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-teal flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {appt.counsellor.name.split(" ").pop()![0]}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{appt.counsellor.name}</h3>
                        <span className={`badge text-xs ${statusInfo.color}`}>{statusInfo.label}</span>
                        {paymentPending && (
                          <span className="badge text-xs bg-blue-50 text-blue-600">Payment Under Review</span>
                        )}
                        {paymentFailed && (
                          <span className="badge text-xs bg-red-50 text-red-500">Payment Failed</span>
                        )}
                      </div>
                      <p className="text-slate-500 text-sm mb-2">
                        {appt.sessionType.replace(/_/g, " ")}
                        {appt.counsellor.counsellor?.expertise?.[0] && ` · ${appt.counsellor.counsellor.expertise[0]}`}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <CalendarCheck size={12} /> {formatDate(appt.date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} /> {formatTime(appt.time)} · {appt.duration}min
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Video size={12} /> Online
                        </span>
                      </div>

                      {/* Payment prompt banner */}
                      {needsPayment && (
                        <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-orange-50 border border-orange-100">
                          <AlertCircle size={14} className="text-orange-500 flex-shrink-0 mt-0.5" />
                          <p className="text-orange-700 text-xs leading-relaxed">
                            <strong>Payment required.</strong> Please transfer ₹{(appt.counsellor.counsellor?.consultationFee ?? 800).toLocaleString("en-IN")} to our account and submit the transaction details to confirm your session.
                          </p>
                        </div>
                      )}
                      {paymentPending && appt.payment?.utr && (
                        <p className="text-slate-400 text-xs mt-2">UTR: <span className="font-mono">{appt.payment.utr}</span></p>
                      )}
                    </div>

                    {/* Price & Actions */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {appt.payment?.amount ? (
                        <span className="font-bold text-slate-900">
                          ₹{Math.round(appt.payment.amount / 100).toLocaleString("en-IN")}
                        </span>
                      ) : appt.counsellor.counsellor?.consultationFee ? (
                        <span className="font-bold text-slate-900">
                          ₹{appt.counsellor.counsellor.consultationFee.toLocaleString("en-IN")}
                        </span>
                      ) : null}

                      {isUpcoming && (
                        <div className="flex flex-col gap-2">
                          {/* Pay Now — if no payment or payment failed */}
                          {(needsPayment || paymentFailed) && (
                            <button
                              onClick={() => setPayingAppt(appt)}
                              className="btn-primary !py-1.5 !px-3 !text-xs"
                            >
                              {paymentFailed ? "Retry Payment" : "Pay Now"}
                            </button>
                          )}
                          {/* Join when confirmed and link available */}
                          {appt.status === "CONFIRMED" && appt.meetingLink && (
                            <a href={appt.meetingLink} target="_blank" rel="noopener noreferrer" className="btn-teal !py-1.5 !px-3 !text-xs">
                              Join
                            </a>
                          )}
                          <button
                            onClick={() => handleCancel(appt.id)}
                            disabled={cancelling === appt.id}
                            className="btn-secondary !py-1.5 !px-3 !text-xs"
                          >
                            {cancelling === appt.id ? "..." : "Cancel"}
                          </button>
                        </div>
                      )}
                      {appt.status === "COMPLETED" && (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={12} className="text-yellow-300 fill-yellow-300" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
