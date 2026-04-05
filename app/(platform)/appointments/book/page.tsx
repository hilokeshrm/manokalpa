"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/platform/TopBar";
import { CalendarCheck, Clock, ChevronLeft, ChevronRight, Star, CheckCircle2, Copy, Banknote, AlertCircle, Loader2 } from "lucide-react";
import { BANK_DETAILS } from "@/lib/bankDetails";

interface Counsellor {
  id: string;
  userId: string;
  expertise: string[];
  experience: number;
  rating: number;
  totalRatings: number;
  consultationFee: number;
  level: string;
  languages: string[];
  sessionTypes: string[];
  user: { name: string; email: string; avatar?: string | null };
}

const sessionTypes = [
  { value: "JUST_LISTEN",  label: "Just Listen to Me",      price: 500  },
  { value: "INDIVIDUAL",   label: "Individual Counselling",  price: null },
  { value: "COUPLES",      label: "Couples Counselling",     price: 3000 },
  { value: "GROUP",        label: "Group Session",           price: 900  },
  { value: "HOLISTIC",     label: "Holistic Wellness",       price: null },
];

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00",
  "14:00", "15:00", "16:00", "17:00", "18:00",
];

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function getCalendarDays(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const result = [];
  for (let i = 0; i < first; i++) result.push(null);
  for (let d = 1; d <= total; d++) {
    const date = new Date(year, month, d);
    result.push({ d, disabled: date < today || date.getDay() === 0 });
  }
  return result;
}

function formatSlot(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

const PAYMENT_METHODS = [
  { value: "UPI",         label: "UPI Transfer" },
  { value: "NET_BANKING", label: "Net Banking (NEFT / IMPS / RTGS)" },
  { value: "CARD",        label: "Card Payment" },
  { value: "WALLET",      label: "Wallet" },
];

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="ml-1.5 text-slate-400 hover:text-brand-purple transition-colors"
    >
      {copied ? <CheckCircle2 size={13} className="text-green-500" /> : <Copy size={13} />}
    </button>
  );
}

export default function BookSessionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [loadingCounsellors, setLoadingCounsellors] = useState(true);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [bookedApptId, setBookedApptId] = useState<string | null>(null);
  // Post-booking payment form state
  const [payMethod, setPayMethod]     = useState("UPI");
  const [payUtr, setPayUtr]           = useState("");
  const [payAmount, setPayAmount]     = useState("");
  const [submittingPay, setSubmittingPay] = useState(false);
  const [payError, setPayError]       = useState("");
  const [payDone, setPayDone]         = useState(false);
  const [selected, setSelected] = useState({
    counsellorId: "",
    sessionType: "",
    date: "",
    time: "",
    notes: "",
  });
  const now = new Date();
  const [cal, setCal] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const calDays = getCalendarDays(cal.year, cal.month);
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    fetch("/api/counsellors")
      .then((r) => r.json())
      .then((data) => setCounsellors(data.counsellors || []))
      .catch(() => {})
      .finally(() => setLoadingCounsellors(false));
  }, []);

  const selectedC = counsellors.find((c) => c.id === selected.counsellorId);

  // Fetch real available slots whenever counsellor + date change
  useEffect(() => {
    if (!selectedC?.userId || !selected.date) { setSlots([]); return; }
    setLoadingSlots(true);
    fetch(`/api/counsellors/${selectedC.userId}/slots?date=${selected.date}`)
      .then((r) => r.json())
      .then((data) => {
        // Fall back to default hardcoded slots if counsellor has no schedule set
        if (!data.slots || data.slots.length === 0) {
          setSlots(timeSlots.map((t) => ({ time: t, available: true })));
        } else {
          setSlots(data.slots);
        }
      })
      .catch(() => setSlots(timeSlots.map((t) => ({ time: t, available: true }))))
      .finally(() => setLoadingSlots(false));
  }, [selectedC?.userId, selected.date]); // eslint-disable-line
  const selectedST = sessionTypes.find((s) => s.value === selected.sessionType);
  const price = selectedST?.price ?? selectedC?.consultationFee ?? 0;

  const handleConfirm = async () => {
    setBooking(true);
    try {
      const [year, month, day] = selected.date.split("-").map(Number);
      const date = new Date(year, month - 1, day).toISOString();

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          counsellorId: selectedC?.userId,
          date,
          time: selected.time,
          sessionType: selected.sessionType,
          notes: selected.notes || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBookedApptId(data.appointment?.id ?? null);
        setPayAmount(String(price));
        setBooked(true);
      }
    } finally {
      setBooking(false);
    }
  };

  const handlePaySubmit = async () => {
    if (!payUtr.trim()) { setPayError("Please enter the Transaction / UTR reference number."); return; }
    if (!payAmount || Number(payAmount) <= 0) { setPayError("Please enter the amount paid."); return; }
    if (!bookedApptId) { setPayError("Appointment ID missing. Please go to Appointments and submit from there."); return; }
    setSubmittingPay(true);
    setPayError("");
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: bookedApptId, method: payMethod, utr: payUtr.trim(), amount: Number(payAmount) }),
      });
      const data = await res.json();
      if (!res.ok) { setPayError(data.error || "Failed to submit. Please try again."); return; }
      setPayDone(true);
    } finally {
      setSubmittingPay(false);
    }
  };

  if (booked) {
    // ── All done — payment verified ──────────────────────────────────────────
    if (payDone) {
      return (
        <>
          <TopBar pageTitle="Payment Submitted" />
          <div className="p-6 max-w-lg mx-auto">
            <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center">
              <div className="w-20 h-20 rounded-full bg-brand-teal-pale flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={40} className="text-brand-teal" />
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">Payment Submitted!</h2>
              <p className="text-slate-500 text-sm mb-1">
                Session with <strong>{selectedC?.user.name}</strong>
              </p>
              <p className="text-slate-500 text-sm mb-6">
                {selected.date} at {formatSlot(selected.time)}
              </p>
              <div className="bg-brand-teal-pale rounded-2xl p-4 mb-6 text-left">
                <p className="text-brand-teal text-sm font-semibold mb-1">What happens next?</p>
                <p className="text-teal-700 text-xs leading-relaxed">
                  Our team will verify your payment (usually within a few hours). You will receive a confirmation once your session is officially confirmed.
                </p>
              </div>
              <button onClick={() => router.push("/appointments")} className="btn-primary w-full justify-center">
                View My Appointments
              </button>
            </div>
          </div>
        </>
      );
    }

    // ── Booked — show bank details + payment form ─────────────────────────────
    return (
      <>
        <TopBar pageTitle="Complete Payment" />
        <div className="p-6 max-w-xl mx-auto space-y-5">

          {/* Session confirmed banner */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-teal-pale flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={24} className="text-brand-teal" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Session Booked!</p>
              <p className="text-slate-500 text-sm">
                {selectedC?.user.name} · {selected.date} at {formatSlot(selected.time)}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-slate-400">Amount Due</p>
              <p className="font-display font-bold text-xl text-brand-purple">₹{price.toLocaleString("en-IN")}</p>
            </div>
          </div>

          {/* Step 1: Bank details */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-brand-purple text-white text-xs flex items-center justify-center font-bold flex-shrink-0">1</div>
              <h3 className="font-semibold text-slate-900">Transfer the amount to</h3>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
              {[
                { label: "Account Name", value: BANK_DETAILS.accountName, mono: false },
                { label: "Account Number", value: BANK_DETAILS.accountNumber, mono: true, copy: true },
                { label: "IFSC Code", value: BANK_DETAILS.ifsc, mono: true, copy: true },
                { label: "Bank", value: BANK_DETAILS.bank, mono: false },
              ].map(({ label, value, mono, copy }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className={`text-sm font-medium text-slate-900 flex items-center ${mono ? "font-mono" : ""}`}>
                    {value}
                    {copy && <CopyBtn text={value} />}
                  </span>
                </div>
              ))}

              <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                <span className="text-xs text-slate-500">UPI ID</span>
                <span className="text-sm font-mono text-brand-purple font-semibold flex items-center">
                  {BANK_DETAILS.upiId}
                  <CopyBtn text={BANK_DETAILS.upiId} />
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-3 text-center">
              Use UPI, NEFT, IMPS or RTGS. Save the transaction reference number after transferring.
            </p>
          </div>

          {/* Step 2: Payment form */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-brand-purple text-white text-xs flex items-center justify-center font-bold flex-shrink-0">2</div>
              <h3 className="font-semibold text-slate-900">Submit your transaction details</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
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
                  value={payUtr}
                  onChange={(e) => setPayUtr(e.target.value)}
                  placeholder="e.g. 426112345678 or UPI Ref No."
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-purple"
                />
                <p className="text-xs text-slate-400 mt-1">Found in your bank app under transaction history or the payment success screen.</p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">
                  Amount Transferred (₹) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-purple"
                />
              </div>

              {payError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-xs">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" /> {payError}
                </div>
              )}

              <button
                onClick={handlePaySubmit}
                disabled={submittingPay}
                className="btn-primary w-full justify-center gap-2 disabled:opacity-50"
              >
                {submittingPay ? <Loader2 size={15} className="animate-spin" /> : <Banknote size={15} />}
                {submittingPay ? "Submitting…" : "Submit Payment Details"}
              </button>
            </div>
          </div>

          {/* Skip link */}
          <p className="text-center text-xs text-slate-400">
            Paid already but want to submit later?{" "}
            <button onClick={() => router.push("/appointments")} className="text-brand-purple underline">
              Go to Appointments
            </button>
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar pageTitle="Book a Session" />
      <div className="p-6 max-w-4xl mx-auto">

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {["Choose Counsellor", "Session Type", "Pick Date & Time", "Confirm"].map((s, i) => {
            const num = i + 1;
            const active = step === num;
            const done = step > num;
            return (
              <div key={s} className="flex items-center gap-2 flex-shrink-0">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  done ? "bg-brand-teal-pale text-brand-teal" :
                  active ? "bg-brand-purple text-white" :
                  "bg-slate-100 text-slate-400"
                }`}>
                  {done ? <CheckCircle2 size={14} /> : <span>{num}</span>}
                  {s}
                </div>
                {i < 3 && <div className="w-6 h-px bg-slate-200 flex-shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Step 1: Choose Counsellor */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-display font-bold text-xl text-slate-900 mb-4">Choose your counsellor</h2>
            {loadingCounsellors ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse h-24" />
                ))}
              </div>
            ) : counsellors.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                <p className="text-slate-500">No counsellors available right now. Please try again later.</p>
              </div>
            ) : (
              counsellors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected({ ...selected, counsellorId: c.id })}
                  className={`w-full text-left bg-white rounded-2xl border-2 p-5 transition-all ${
                    selected.counsellorId === c.id
                      ? "border-brand-purple shadow-md shadow-brand-purple/10"
                      : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-teal flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {c.user.name.split(" ").pop()![0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{c.user.name}</h3>
                        {selected.counsellorId === c.id && (
                          <CheckCircle2 size={16} className="text-brand-purple" />
                        )}
                        <span className="badge bg-slate-100 text-slate-500 text-xs">{c.level}</span>
                      </div>
                      <p className="text-slate-500 text-sm mb-2">{c.experience} yrs experience</p>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {c.expertise.slice(0, 4).map((e) => (
                          <span key={e} className="badge bg-slate-100 text-slate-500 text-xs">{e}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Star size={11} className="text-yellow-400 fill-yellow-400" />
                          {c.rating.toFixed(1)} ({c.totalRatings})
                        </span>
                        <span>{c.languages.slice(0, 3).join(", ")}</span>
                        <span className="font-semibold text-slate-700">₹{c.consultationFee}/session</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
            <button
              disabled={!selected.counsellorId}
              onClick={() => setStep(2)}
              className="btn-primary w-full justify-center disabled:opacity-50 mt-2"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Session Type */}
        {step === 2 && (
          <div>
            <h2 className="font-display font-bold text-xl text-slate-900 mb-4">Choose session type</h2>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {sessionTypes
                .filter((s) => !selectedC?.sessionTypes?.length || selectedC.sessionTypes.includes(s.value))
                .map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSelected({ ...selected, sessionType: s.value })}
                    className={`text-left p-4 rounded-2xl border-2 transition-all ${
                      selected.sessionType === s.value
                        ? "border-brand-purple bg-brand-purple-pale"
                        : "border-slate-100 bg-white hover:border-slate-200"
                    }`}
                  >
                    <div className="font-semibold text-slate-900 mb-1">{s.label}</div>
                    <div className="text-sm text-brand-purple font-medium">
                      {s.price ? `₹${s.price}` : `₹${selectedC?.consultationFee} (counsellor rate)`}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">50 min session</div>
                  </button>
                ))}
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes for counsellor (optional)</label>
              <textarea
                rows={3}
                value={selected.notes}
                onChange={(e) => setSelected({ ...selected, notes: e.target.value })}
                placeholder="Briefly describe what you'd like to work on..."
                className="input-field resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary gap-2">
                <ChevronLeft size={16} /> Back
              </button>
              <button disabled={!selected.sessionType} onClick={() => setStep(3)} className="btn-primary flex-1 justify-center disabled:opacity-50">
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Date & Time */}
        {step === 3 && (
          <div>
            <h2 className="font-display font-bold text-xl text-slate-900 mb-4">Choose date & time</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Calendar */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setCal((c) => c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 })} className="p-1 hover:bg-slate-100 rounded-lg">
                    <ChevronLeft size={18} />
                  </button>
                  <span className="font-semibold text-slate-900 text-sm">{months[cal.month]} {cal.year}</span>
                  <button onClick={() => setCal((c) => c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 })} className="p-1 hover:bg-slate-100 rounded-lg">
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {dayLabels.map((d) => (
                    <div key={d} className="text-xs font-medium text-slate-400 py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {calDays.map((day, i) => (
                    <div key={i}>
                      {day === null ? <div /> : (
                        <button
                          disabled={day.disabled}
                          onClick={() => setSelected({ ...selected, date: `${cal.year}-${cal.month + 1}-${day.d}` })}
                          className={`w-8 h-8 rounded-xl text-sm mx-auto flex items-center justify-center transition-all ${
                            selected.date === `${cal.year}-${cal.month + 1}-${day.d}`
                              ? "bg-brand-purple text-white font-bold"
                              : day.disabled
                              ? "text-slate-200 cursor-not-allowed"
                              : "hover:bg-brand-purple-pale text-slate-700"
                          }`}
                        >
                          {day.d}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Time slots */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <Clock size={15} className="text-brand-purple" /> Available Times
                  {loadingSlots && <span className="text-xs text-slate-400 font-normal">Loading...</span>}
                </h3>
                {slots.length === 0 && !loadingSlots && selected.date ? (
                  <p className="text-slate-400 text-sm">No available slots for this date. Please pick another day.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map(({ time: t, available }) => (
                      <button
                        key={t}
                        disabled={!available}
                        onClick={() => available && setSelected({ ...selected, time: t })}
                        className={`py-2 rounded-xl text-xs font-medium transition-all border ${
                          !available
                            ? "border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed line-through"
                            : selected.time === t
                            ? "bg-brand-purple text-white border-brand-purple"
                            : "border-slate-200 text-slate-600 hover:border-brand-purple/40"
                        }`}
                      >
                        {formatSlot(t)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary gap-2">
                <ChevronLeft size={16} /> Back
              </button>
              <button
                disabled={!selected.date || !selected.time}
                onClick={() => setStep(4)}
                className="btn-primary flex-1 justify-center disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div>
            <h2 className="font-display font-bold text-xl text-slate-900 mb-6">Confirm your booking</h2>
            <div className="bg-white rounded-3xl border border-slate-100 p-6 mb-6 space-y-4">
              {[
                { label: "Counsellor", value: selectedC?.user.name },
                { label: "Session Type", value: selectedST?.label },
                { label: "Date", value: selected.date },
                { label: "Time", value: formatSlot(selected.time) },
                { label: "Duration", value: "50 minutes" },
                { label: "Mode", value: "Online (Video)" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-slate-500 text-sm">{label}</span>
                  <span className="font-medium text-slate-900 text-sm">{value}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 bg-brand-purple-pale rounded-xl px-4 -mx-2 mt-2">
                <span className="font-semibold text-brand-purple">Total Amount</span>
                <span className="font-bold text-brand-purple text-lg">₹{price}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="btn-secondary gap-2">
                <ChevronLeft size={16} /> Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={booking}
                className="btn-teal flex-1 justify-center gap-2 disabled:opacity-50"
              >
                <CalendarCheck size={17} />
                {booking ? "Booking..." : `Confirm Booking · ₹${price}`}
              </button>
            </div>

            <p className="text-xs text-slate-400 text-center mt-3">
              Your booking will be confirmed. Payment details will be shared separately.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
