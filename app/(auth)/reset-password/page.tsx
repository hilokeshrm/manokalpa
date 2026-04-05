"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, CheckCircle2, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

function ResetPasswordForm() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const token         = searchParams.get("token") ?? "";

  const [status, setStatus]         = useState<"checking" | "valid" | "invalid" | "success">("checking");
  const [minutesLeft, setMinutes]   = useState(15);
  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [showCf, setShowCf]         = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");

  // Validate token on mount
  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }
    fetch(`/api/auth/reset-password?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setMinutes(data.minutesLeft ?? 15);
          setStatus("valid");
        } else {
          setStatus("invalid");
        }
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res  = await fetch("/api/auth/reset-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        if (res.status === 400 && data.error?.includes("expired")) setStatus("invalid");
        return;
      }

      setStatus("success");
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Checking token ────────────────────────────────────────────────────────
  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7FF]">
        <Loader2 size={32} className="animate-spin text-brand-purple" />
      </div>
    );
  }

  // ── Invalid / expired ─────────────────────────────────────────────────────
  if (status === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7FF] p-6">
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-red-400" />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900 mb-3">Link Expired</h2>
          <p className="text-slate-500 text-sm mb-8">
            This password reset link is invalid or has expired.<br />
            Reset links are valid for <strong>15 minutes</strong> only.
          </p>
          <Link href="/forgot-password" className="btn-primary w-full justify-center">
            Request a New Link
          </Link>
          <div className="mt-4">
            <Link href="/login" className="text-sm text-slate-400 hover:text-brand-purple transition-colors">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7FF] p-6">
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-brand-teal-pale flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-brand-teal" />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900 mb-3">Password Reset!</h2>
          <p className="text-slate-500 text-sm mb-2">
            Your password has been updated successfully.
          </p>
          <p className="text-slate-400 text-xs mb-8">
            Redirecting you to login in a moment…
          </p>
          <Link href="/login" className="btn-primary w-full justify-center">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // ── Valid — show form ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F7FF] p-6">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link href="/">
            <Image src="/logo.svg" alt="Manokalpa" width={160} height={40} className="h-9 w-auto" />
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-brand-purple-pale flex items-center justify-center mb-5">
            <Lock size={24} className="text-brand-purple" />
          </div>

          <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">Set New Password</h1>
          <p className="text-slate-500 text-sm mb-1">
            Choose a strong password for your account.
          </p>
          {minutesLeft > 0 && (
            <p className="text-xs text-orange-500 mb-6">
              This link expires in {minutesLeft} minute{minutesLeft !== 1 ? "s" : ""}.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength indicator */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          getStrength(password) >= i
                            ? i <= 1 ? "bg-red-400"
                            : i <= 2 ? "bg-orange-400"
                            : i <= 3 ? "bg-yellow-400"
                            : "bg-green-400"
                            : "bg-slate-100"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">{strengthLabel(password)}</p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type={showCf ? "text" : "password"}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter your password"
                  className={`input-field pr-10 ${
                    confirm && confirm !== password ? "border-red-300 focus:border-red-400" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCf(!showCf)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirm && confirm !== password && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
              )}
              {confirm && confirm === password && password.length >= 8 && (
                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                  <CheckCircle2 size={11} /> Passwords match
                </p>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || password !== confirm || password.length < 8}
              className="btn-primary w-full justify-center gap-2 disabled:opacity-60"
            >
              {submitting
                ? <><Loader2 size={15} className="animate-spin" /> Resetting…</>
                : "Reset Password"
              }
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-slate-400 hover:text-brand-purple transition-colors">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getStrength(pw: string): number {
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

function strengthLabel(pw: string): string {
  const s = getStrength(pw);
  return ["", "Weak", "Fair", "Good", "Strong"][s] ?? "";
}

// ── Suspense wrapper (required for useSearchParams) ───────────────────────────

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7FF]">
        <Loader2 size={32} className="animate-spin text-brand-purple" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
