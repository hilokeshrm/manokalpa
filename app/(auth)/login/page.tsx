"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Phone } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid credentials.");
        return;
      }
      // Role-based redirect
      const role = data.user?.role;
      if (role === "ADMIN") router.push("/admin/dashboard");
      else if (role === "COUNSELLOR") router.push("/counsellor/dashboard");
      else if (role === "SUPERVISOR") router.push("/supervisor/dashboard");
      else router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0d0a24] via-[#1a1640] to-[#0f1635] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-brand-teal/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <Link href="/">
            <Image src="/logo-white.svg" alt="Manokalpa" width={180} height={45} className="h-10 w-auto" />
          </Link>
        </div>
        <div className="relative z-10">
          <h2 className="font-display text-4xl font-bold text-white mb-4 leading-tight">
            Welcome back to<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple-light to-brand-teal">
              your wellness journey
            </span>
          </h2>
          <p className="text-white/60 text-lg leading-relaxed max-w-sm">
            Continue where you left off. Your reflections, progress, and counsellor are waiting.
          </p>
        </div>
        <div className="relative z-10 flex gap-4">
          {["🧠 Assessments", "📓 Journal", "💬 Chat", "📚 Content"].map((f) => (
            <span key={f} className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/70 text-xs">
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#F8F7FF]">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link href="/">
              <Image src="/logo.svg" alt="Manokalpa" width={160} height={40} className="h-9 w-auto" />
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">Sign In</h1>
            <p className="text-slate-500 text-sm mb-8">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-brand-purple font-medium hover:underline">
                Create one free
              </Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email or Mobile
                </label>
                <input
                  type="text"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com or mobile number"
                  className="input-field"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  <Link href="/forgot-password" className="text-xs text-brand-purple hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter your password"
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
                <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center gap-2 disabled:opacity-60 mt-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <div className="relative flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-slate-400 text-xs">or</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors">
              <Phone size={16} className="text-brand-teal" />
              Sign in with OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
