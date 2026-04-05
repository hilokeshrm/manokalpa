"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";

const benefits = [
  "Free initial wellness assessment",
  "Access to self-care tools & journal",
  "Browse and book verified counsellors",
  "Attend free events & webinars",
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    role: "USER",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed. Please try again."); return; }
      setStep(2);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7FF] p-6">
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-brand-teal-pale flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-brand-teal" />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900 mb-3">
            Account Created!
          </h2>
          <p className="text-slate-500 mb-2">
            Welcome to Manokalpa, <span className="font-semibold text-slate-700">{form.name}</span>!
          </p>
          <p className="text-slate-500 text-sm mb-8">
            We&apos;ve sent a verification link to <strong>{form.email}</strong>. Please verify
            your email to access all features.
          </p>
          <Link href="/dashboard" className="btn-primary w-full justify-center">
            Go to Dashboard
          </Link>
          <p className="text-slate-400 text-xs mt-4">
            Didn&apos;t receive the email?{" "}
            <button className="text-brand-purple hover:underline">Resend</button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-teal to-[#0d8060] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-purple/15 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <Link href="/">
            <Image src="/logo-white.svg" alt="Manokalpa" width={180} height={45} className="h-10 w-auto" />
          </Link>
        </div>
        <div className="relative z-10">
          <h2 className="font-display text-4xl font-bold text-white mb-6 leading-tight">
            Begin your path to<br />
            <span className="text-white/80">mental wellness today</span>
          </h2>
          <ul className="space-y-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3 text-white/80">
                <CheckCircle2 size={18} className="text-white flex-shrink-0" />
                <span className="text-sm">{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative z-10">
          <p className="text-white/40 text-xs">
            Trusted by 2,000+ users across India
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#F8F7FF] overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden mb-8">
            <Link href="/">
              <Image src="/logo.svg" alt="Manokalpa" width={160} height={40} className="h-9 w-auto" />
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">
              Create Account
            </h1>
            <p className="text-slate-500 text-sm mb-8">
              Already have an account?{" "}
              <Link href="/login" className="text-brand-purple font-medium hover:underline">
                Sign in
              </Link>
            </p>

            {/* Role selector */}
            <div className="flex gap-2 mb-6">
              {[
                { value: "USER", label: "I need support" },
                { value: "COUNSELLOR", label: "I&apos;m a counsellor" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, role: value })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    form.role === value
                      ? "bg-brand-purple text-white border-brand-purple shadow-sm"
                      : "border-slate-200 text-slate-600 hover:border-brand-purple/40"
                  }`}
                  dangerouslySetInnerHTML={{ __html: label }}
                />
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Minimum 8 characters"
                    className="input-field pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>
              )}

              <p className="text-xs text-slate-500 leading-relaxed">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-brand-purple hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-brand-purple hover:underline">Privacy Policy</Link>.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="btn-teal w-full justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
