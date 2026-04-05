"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
        return;
      }
      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7FF] p-6">
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-brand-teal-pale flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-brand-teal" />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900 mb-3">Check your email</h2>
          <p className="text-slate-500 text-sm mb-2">
            If an account exists for <strong>{email}</strong>, we've sent a password reset link.
          </p>
          <p className="text-slate-400 text-xs mb-8">
            Didn't receive it? Check your spam folder or try again in a few minutes.
          </p>
          <Link href="/login" className="btn-primary w-full justify-center">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

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
            <Mail size={24} className="text-brand-purple" />
          </div>

          <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">Forgot Password?</h1>
          <p className="text-slate-500 text-sm mb-6">
            Enter your registered email and we&apos;ll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="input-field"
              />
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center gap-2 disabled:opacity-60">
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-slate-500 hover:text-brand-purple flex items-center justify-center gap-1.5 transition-colors">
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
